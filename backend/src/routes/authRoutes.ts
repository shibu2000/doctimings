import { Hono } from 'hono';
import { authController } from '../controllers/authController.js';
import { authMiddleware, requireAccount, requireAdmin, requireSuperAdmin } from '../middleware/auth.js';
import { accessController } from '../controllers/accessController.js';
import { activateSchema, changePasswordSchema } from '../validators/accessValidator.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { validateBody } from '../middleware/validator.js';
import { loginSchema, registerSchema, createUserSchema, updateUserSchema } from '../validators/authValidator.js';

export const authRoutes = new Hono();

const authAttempts = rateLimiter({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many attempts. Try again in a few minutes.' });

authRoutes.post('/login', authAttempts, validateBody(loginSchema), authController.login);
authRoutes.post('/register', authAttempts, validateBody(registerSchema), authController.register);
authRoutes.get('/me', authMiddleware(), authController.me);
authRoutes.post('/activate', authAttempts, validateBody(activateSchema), accessController.activate);
authRoutes.post('/change-password', authAttempts, authMiddleware(), validateBody(changePasswordSchema), accessController.changePassword);
authRoutes.get('/partner', authMiddleware(), requireAccount, accessController.partnerMe);
authRoutes.get('/users', authMiddleware(), requireAdmin, authController.getUsers);
authRoutes.post('/users', authMiddleware(), requireSuperAdmin, validateBody(createUserSchema), authController.createUser);
authRoutes.patch('/users/:id', authMiddleware(), requireSuperAdmin, validateBody(updateUserSchema), authController.updateUser);
