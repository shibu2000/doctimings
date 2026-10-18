import { Hono } from 'hono';
import { scheduleController } from '../controllers/scheduleController.js';
import { authMiddleware, requireAccount } from '../middleware/auth.js';
import { validateBody } from '../middleware/validator.js';
import {
  createScheduleSchema,
  updateScheduleSchema,
  createOverrideSchema
} from '../validators/scheduleValidator.js';

export const scheduleRoutes = new Hono();

scheduleRoutes.get('/overrides', scheduleController.getOverrides);
scheduleRoutes.post('/overrides', authMiddleware(), requireAccount, validateBody(createOverrideSchema), scheduleController.createOverride);
scheduleRoutes.delete('/overrides/:id', authMiddleware(), requireAccount, scheduleController.deleteOverride);

scheduleRoutes.get('/', scheduleController.getSchedules);
scheduleRoutes.get('/:id', scheduleController.getScheduleById);
scheduleRoutes.post('/', authMiddleware(), requireAccount, validateBody(createScheduleSchema), scheduleController.createSchedule);
scheduleRoutes.put('/:id', authMiddleware(), requireAccount, validateBody(updateScheduleSchema), scheduleController.updateSchedule);
scheduleRoutes.delete('/:id', authMiddleware(), requireAccount, scheduleController.deleteSchedule);

