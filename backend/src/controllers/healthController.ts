import type { Context } from 'hono';
import { count, eq } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import * as schema from '../db/schema.js';
import { notFound } from '../lib/http.js';

export const healthController = {
  systemHealth: async (c: Context) => {
    const base = {
      service: 'DocTimings Backend API',
      version: '1.1.0',
      timestamp: new Date().toISOString()
    };
    try {
      const db = getDb();
      const [[doctors], [establishments], [schedules], [reports]] = await Promise.all([
        db.select({ value: count() }).from(schema.doctors),
        db.select({ value: count() }).from(schema.establishments),
        db.select({ value: count() }).from(schema.schedules),
        db.select({ value: count() }).from(schema.reports)
      ]);
      return c.json({
        ...base,
        status: 'ok',
        database: {
          status: 'healthy',
          records: {
            doctors: doctors.value,
            establishments: establishments.value,
            schedules: schedules.value,
            reports: reports.value
          }
        }
      });
    } catch (err) {
      console.error(err);
      return c.json({ ...base, status: 'degraded', database: { status: 'unreachable' } }, 503);
    }
  },

  getTopics: async (c: Context) => {
    const topics = await getDb().select().from(schema.healthTopics).where(eq(schema.healthTopics.isActive, true));
    return c.json({ success: true, data: topics, total: topics.length });
  },

  getArticles: async (c: Context) => {
    const topicId = c.req.query('topicId');
    const db = getDb();
    const [articles, topics] = await Promise.all([
      db.select().from(schema.healthArticles),
      db.select().from(schema.healthTopics)
    ]);
    const topicMap = new Map(topics.map(t => [t.id, t]));
    const data = articles
      .filter(a => !topicId || a.topicId === topicId)
      .map(a => ({
        ...a,
        topicName: topicMap.get(a.topicId)?.name ?? null,
        topicCategory: topicMap.get(a.topicId)?.category ?? null
      }));
    return c.json({ success: true, data, total: data.length });
  },

  getArticleBySlug: async (c: Context) => {
    const slug = c.req.param('slug')!;
    const db = getDb();
    const [article] = await db.select().from(schema.healthArticles).where(eq(schema.healthArticles.slug, slug));
    if (!article) return notFound(c, `Health article '${slug}' not found`);
    const [topic] = await db.select().from(schema.healthTopics).where(eq(schema.healthTopics.id, article.topicId));
    return c.json({ success: true, data: { ...article, topic: topic ?? null } });
  }
};
