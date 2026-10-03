import { Hono } from 'hono';
import { reportController } from '../controllers/reportController.js';
import { authMiddleware, optionalAuthMiddleware, requireAdmin } from '../middleware/auth.js';
import { validateBody } from '../middleware/validator.js';
import { createReportSchema, updateReportSchema } from '../validators/reportValidator.js';

export const reportRoutes = new Hono();

reportRoutes.post('/', optionalAuthMiddleware(), validateBody(createReportSchema), reportController.submitReport);
reportRoutes.get('/', authMiddleware(), requireAdmin, reportController.getReports);
reportRoutes.get('/:id', authMiddleware(), requireAdmin, reportController.getReportById);
reportRoutes.put('/:id/status', authMiddleware(), requireAdmin, validateBody(updateReportSchema), reportController.updateReportStatus);
