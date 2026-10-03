import { Hono } from 'hono';
import { doctorController } from '../controllers/doctorController.js';
import { authMiddleware, requireAdmin, requireStaffOrAdmin } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validator.js';
import {
  createDoctorSchema,
  updateDoctorSchema,
  doctorQuerySchema
} from '../validators/doctorValidator.js';

export const doctorRoutes = new Hono();

doctorRoutes.get('/', validateQuery(doctorQuerySchema), doctorController.getDoctors);
doctorRoutes.get('/:id', doctorController.getDoctorById);
doctorRoutes.post('/', authMiddleware(), requireStaffOrAdmin, validateBody(createDoctorSchema), doctorController.createDoctor);
doctorRoutes.put('/:id', authMiddleware(), requireStaffOrAdmin, validateBody(updateDoctorSchema), doctorController.updateDoctor);
doctorRoutes.delete('/:id', authMiddleware(), requireAdmin, doctorController.deleteDoctor);

