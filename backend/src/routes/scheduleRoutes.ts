import { Hono } from 'hono';
import { scheduleController } from '../controllers/scheduleController.js';
import { authMiddleware, requireAdmin, requireStaffOrAdmin } from '../middleware/auth.js';
import { validateBody } from '../middleware/validator.js';
import {
  createScheduleSchema,
  updateScheduleSchema,
  createOverrideSchema
} from '../validators/scheduleValidator.js';

export const scheduleRoutes = new Hono();

scheduleRoutes.get('/overrides', scheduleController.getOverrides);
scheduleRoutes.post('/overrides', authMiddleware(), requireStaffOrAdmin, validateBody(createOverrideSchema), scheduleController.createOverride);
scheduleRoutes.delete('/overrides/:id', authMiddleware(), requireStaffOrAdmin, scheduleController.deleteOverride);

scheduleRoutes.get('/', scheduleController.getSchedules);
scheduleRoutes.get('/:id', scheduleController.getScheduleById);
scheduleRoutes.post('/', authMiddleware(), requireStaffOrAdmin, validateBody(createScheduleSchema), scheduleController.createSchedule);
scheduleRoutes.put('/:id', authMiddleware(), requireStaffOrAdmin, validateBody(updateScheduleSchema), scheduleController.updateSchedule);
scheduleRoutes.delete('/:id', authMiddleware(), requireStaffOrAdmin, scheduleController.deleteSchedule);

