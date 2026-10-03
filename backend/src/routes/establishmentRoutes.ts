import { Hono } from 'hono';
import { establishmentController } from '../controllers/establishmentController.js';
import { authMiddleware, requireAdmin, requireStaffOrAdmin } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validator.js';
import {
  createEstablishmentSchema,
  updateEstablishmentSchema,
  establishmentQuerySchema,
  createLocationSchema
} from '../validators/establishmentValidator.js';

export const establishmentRoutes = new Hono();

establishmentRoutes.get('/', validateQuery(establishmentQuerySchema), establishmentController.getEstablishments);
establishmentRoutes.get('/:id', establishmentController.getEstablishmentById);
establishmentRoutes.post('/', authMiddleware(), requireAdmin, validateBody(createEstablishmentSchema), establishmentController.createEstablishment);
establishmentRoutes.put('/:id', authMiddleware(), requireStaffOrAdmin, validateBody(updateEstablishmentSchema), establishmentController.updateEstablishment);
establishmentRoutes.get('/:id/locations', establishmentController.getPracticeLocations);
establishmentRoutes.post('/:id/locations', authMiddleware(), requireStaffOrAdmin, validateBody(createLocationSchema), establishmentController.addPracticeLocation);

