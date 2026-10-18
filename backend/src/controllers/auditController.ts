import type { Context } from 'hono';
import { desc } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import * as schema from '../db/schema.js';
import { paginate } from '../lib/http.js';

export const auditController = {
  getAuditLogs: async (c: Context) => {
    const { entityType, entityId, action, actorId } = c.req.query();
    const page = Number(c.req.query('page')) || 1;
    const limit = Math.min(Number(c.req.query('limit')) || 20, 200);

    const list = (await getDb().select().from(schema.auditLogs).orderBy(desc(schema.auditLogs.timestamp))).filter(
      l =>
        (!entityType || entityType === 'All' || l.entityType.toLowerCase() === entityType.toLowerCase()) &&
        (!entityId || l.entityId === entityId) &&
        (!action || action === 'All' || l.action.toLowerCase() === action.toLowerCase()) &&
        (!actorId || l.actorId === actorId)
    );

    return c.json({ success: true, ...paginate(list, page, limit) });
  }
};
