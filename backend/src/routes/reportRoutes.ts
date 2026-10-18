import { Hono } from 'hono';
import { reportController } from '../controllers/reportController.js';
import { authMiddleware, optionalAuthMiddleware, requireAdmin } from '../middleware/auth.js';
import { validateBody } from '../middleware/validator.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const reportLimit = rateLimiter({ windowMs: 60 * 60 * 1000, max: 20, message: 'Too many reports from this device. Try again later.' });
import { createReportSchema, updateReportSchema } from '../validators/reportValidator.js';

export const reportRoutes = new Hono();

reportRoutes.post('/', reportLimit, optionalAuthMiddleware(), validateBody(createReportSchema), reportController.submitReport);
reportRoutes.get('/', authMiddleware(), requireAdmin, reportController.getReports);
reportRoutes.get('/:id', authMiddleware(), requireAdmin, reportController.getReportById);
reportRoutes.put('/:id/status', authMiddleware(), requireAdmin, validateBody(updateReportSchema), reportController.updateReportStatus);
