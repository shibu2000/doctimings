import { Hono } from 'hono';
import { adminController } from '../controllers/adminController.js';
import { authMiddleware, requireAccount, requireAdmin, requireStaffOrAdmin } from '../middleware/auth.js';
import { accessController } from '../controllers/accessController.js';
import { validateBody } from '../middleware/validator.js';
import { reviewClaimSchema } from '../validators/accessValidator.js';

export const adminRoutes = new Hono();

adminRoutes.get('/snapshot', authMiddleware(), requireStaffOrAdmin, adminController.snapshot);
adminRoutes.get('/claims', authMiddleware(), requireAdmin, accessController.listClaims);
adminRoutes.post('/claims/:id/review', authMiddleware(), requireAdmin, validateBody(reviewClaimSchema), accessController.reviewClaim);
adminRoutes.delete('/invitations/:id', authMiddleware(), requireAccount, accessController.revokeInvitation);
