import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address format'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Patient', 'Staff', 'Operations Admin', 'District Lead', 'Super Admin']).default('Patient')
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
