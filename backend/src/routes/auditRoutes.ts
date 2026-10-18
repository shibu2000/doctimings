import { Hono } from 'hono';
import { auditController } from '../controllers/auditController.js';
import { authMiddleware, requireAdmin } from '../middleware/auth.js';

export const auditRoutes = new Hono();

auditRoutes.get('/', authMiddleware(), requireAdmin, auditController.getAuditLogs);
