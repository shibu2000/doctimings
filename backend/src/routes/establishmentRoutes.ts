import { Hono } from 'hono';
import { establishmentController } from '../controllers/establishmentController.js';
import { authMiddleware, optionalAuthMiddleware, requireAccount, requireAdmin, requireStaffOrAdmin } from '../middleware/auth.js';
import { accessController } from '../controllers/accessController.js';
import { establishmentInviteSchema } from '../validators/accessValidator.js';
import { validateBody, validateQuery } from '../middleware/validator.js';
import {
  createEstablishmentSchema,
  updateEstablishmentSchema,
  establishmentQuerySchema,
  createLocationSchema,
  updateLocationSchema
} from '../validators/establishmentValidator.js';

export const establishmentRoutes = new Hono();

establishmentRoutes.get('/', optionalAuthMiddleware(), validateQuery(establishmentQuerySchema), establishmentController.getEstablishments);
establishmentRoutes.get('/:id', optionalAuthMiddleware(), establishmentController.getEstablishmentById);
establishmentRoutes.post('/', authMiddleware(), requireStaffOrAdmin, validateBody(createEstablishmentSchema), establishmentController.createEstablishment);
establishmentRoutes.put('/:id', authMiddleware(), requireAccount, validateBody(updateEstablishmentSchema), establishmentController.updateEstablishment);
establishmentRoutes.delete('/:id', authMiddleware(), requireAdmin, establishmentController.deleteEstablishment);
establishmentRoutes.get('/:id/locations', establishmentController.getPracticeLocations);
establishmentRoutes.post('/:id/locations', authMiddleware(), requireAccount, validateBody(createLocationSchema), establishmentController.addPracticeLocation);
establishmentRoutes.put('/:id/locations/:locationId', authMiddleware(), requireAccount, validateBody(updateLocationSchema), establishmentController.updatePracticeLocation);
establishmentRoutes.delete('/:id/locations/:locationId', authMiddleware(), requireAccount, establishmentController.deletePracticeLocation);
establishmentRoutes.get('/:id/access', authMiddleware(), requireAccount, accessController.establishmentAccess);
establishmentRoutes.post('/:id/invitations', authMiddleware(), requireAccount, validateBody(establishmentInviteSchema), accessController.inviteToEstablishment);
establishmentRoutes.delete('/:id/members/:memberId', authMiddleware(), requireAccount, accessController.removeMember);
