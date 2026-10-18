import { Hono } from 'hono';
import { doctorController } from '../controllers/doctorController.js';
import { authMiddleware, optionalAuthMiddleware, requireAccount, requireAdmin } from '../middleware/auth.js';
import { accessController } from '../controllers/accessController.js';
import { claimSchema, doctorInviteSchema } from '../validators/accessValidator.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { validateBody, validateQuery } from '../middleware/validator.js';
import {
  createDoctorSchema,
  updateDoctorSchema,
  doctorQuerySchema,
  sittingSchema,
  leaveSchema
} from '../validators/doctorValidator.js';

export const doctorRoutes = new Hono();

const claimLimit = rateLimiter({ windowMs: 60 * 60 * 1000, max: 10, message: 'Too many requests. Try again later.' });

doctorRoutes.post('/:id/claims', claimLimit, validateBody(claimSchema), accessController.submitClaim);
doctorRoutes.get('/:id/access', authMiddleware(), requireAdmin, accessController.doctorAccess);
doctorRoutes.post('/:id/invitations', authMiddleware(), requireAdmin, validateBody(doctorInviteSchema), accessController.inviteDoctor);
doctorRoutes.delete('/:id/account', authMiddleware(), requireAdmin, accessController.unlinkDoctor);

doctorRoutes.get('/', optionalAuthMiddleware(), validateQuery(doctorQuerySchema), doctorController.getDoctors);
doctorRoutes.get('/:id', optionalAuthMiddleware(), doctorController.getDoctorById);
doctorRoutes.post('/', authMiddleware(), requireAccount, validateBody(createDoctorSchema), doctorController.createDoctor);
doctorRoutes.put('/:id', authMiddleware(), requireAccount, validateBody(updateDoctorSchema), doctorController.updateDoctor);
doctorRoutes.delete('/:id', authMiddleware(), requireAdmin, doctorController.deleteDoctor);
doctorRoutes.put('/:id/sittings/:establishmentId', authMiddleware(), requireAccount, validateBody(sittingSchema), doctorController.saveSitting);
doctorRoutes.delete('/:id/sittings/:establishmentId', authMiddleware(), requireAccount, doctorController.removeSitting);
doctorRoutes.post('/:id/leave', authMiddleware(), requireAccount, validateBody(leaveSchema), doctorController.markLeave);
