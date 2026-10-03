import type { Context } from 'hono';
import { memoryStore } from '../db/index.js';

export const auditController = {
  getAuditLogs: async (c: Context) => {
    const entityType = c.req.query('entityType');
    const entityId = c.req.query('entityId');
    const action = c.req.query('action');
    const actorId = c.req.query('actorId');
    const page = Number(c.req.query('page')) || 1;
    const limit = Number(c.req.query('limit')) || 20;

    let list = [...memoryStore.auditLogs];

    if (entityType && entityType !== 'All') {
      list = list.filter(l => l.entityType.toLowerCase() === entityType.toLowerCase());
    }

    if (entityId) {
      list = list.filter(l => l.entityId === entityId);
    }

    if (action && action !== 'All') {
      list = list.filter(l => l.action.toLowerCase() === action.toLowerCase());
    }

    if (actorId) {
      list = list.filter(l => l.actorId === actorId);
    }

    const total = list.length;
    const startIndex = (page - 1) * limit;
    const paged = list.slice(startIndex, startIndex + limit);

    return c.json({
      success: true,
      data: paged,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  },

  createAuditLog: async (c: Context) => {
    const user = c.get('user');
    const body = await c.req.json();
    const newLog = {
      id: `LOG-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      actorId: user?.sub || body.actorId || 'USR-ADMIN',
      actorName: user?.name || body.actorName || 'System Admin',
      action: body.action || 'Admin Action',
      entityType: body.entityType || 'System',
      entityId: body.entityId || '0',
      entityName: body.entityName || '',
      details: body.details || ''
    };
    memoryStore.auditLogs.unshift(newLog);
    return c.json({ success: true, data: newLog }, 201);
  }
};
