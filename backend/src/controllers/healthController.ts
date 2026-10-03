import type { Context } from 'hono';
import { memoryStore } from '../db/index.js';

export const healthController = {
  systemHealth: async (c: Context) => {
    return c.json({
      status: 'ok',
      service: 'DocTimings Backend API',
      version: '1.0.0',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      database: {
        status: 'healthy',
        records: {
          doctors: memoryStore.doctors.length,
          establishments: memoryStore.establishments.length,
          schedules: memoryStore.schedules.length,
          reports: memoryStore.reports.length
        }
      }
    });
  },

  getTopics: async (c: Context) => {
    return c.json({
      success: true,
      data: memoryStore.healthTopics,
      total: memoryStore.healthTopics.length
    });
  },

  getArticles: async (c: Context) => {
    const topicId = c.req.query('topicId');
    let list = [...memoryStore.healthArticles];

    if (topicId) {
      list = list.filter(a => a.topicId === topicId);
    }

    const enriched = list.map(a => {
      const topic = memoryStore.healthTopics.find(t => t.id === a.topicId);
      return {
        ...a,
        topicName: topic ? topic.name : null,
        topicCategory: topic ? topic.category : null
      };
    });

    return c.json({
      success: true,
      data: enriched,
      total: enriched.length
    });
  },

  getArticleBySlug: async (c: Context) => {
    const slug = c.req.param('slug');
    const article = memoryStore.healthArticles.find(a => a.slug === slug);

    if (!article) {
      return c.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Health article '${slug}' not found`
          }
        },
        404
      );
    }

    const topic = memoryStore.healthTopics.find(t => t.id === article.topicId);

    return c.json({
      success: true,
      data: {
        ...article,
        topic: topic || null
      }
    });
  }
};
