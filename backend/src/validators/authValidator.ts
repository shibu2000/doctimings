import { z } from 'zod';
import { STAFF_ROLES } from '../types/index.js';

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address format').max(150),
  password: z.string().min(1, 'Password is required').max(128)
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(150),
  email: z.string().trim().email('Invalid email address format').max(150),
  phone: z.string().trim().min(10, 'Phone must be at least 10 digits').max(30),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128)
});

export const createUserSchema = registerSchema.extend({
  role: z.enum(STAFF_ROLES)
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(150).optional(),
  phone: z.string().trim().min(10).max(30).optional(),
  role: z.enum(STAFF_ROLES).optional(),
  status: z.enum(['Active', 'Suspended']).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128).optional()
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
