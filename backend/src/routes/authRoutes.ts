import { Hono } from 'hono';
import { authController } from '../controllers/authController.js';
import { validateBody } from '../middleware/validator.js';
import { loginSchema, registerSchema } from '../validators/authValidator.js';
import { authMiddleware } from '../middleware/auth.js';

export const authRoutes = new Hono();

authRoutes.post('/login', validateBody(loginSchema), authController.login);
authRoutes.post('/register', validateBody(registerSchema), authController.register);
authRoutes.get('/me', authMiddleware(), authController.me);
authRoutes.get('/users', authMiddleware(), authController.getUsers);
