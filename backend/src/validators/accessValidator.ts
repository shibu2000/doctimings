import { z } from 'zod';

const phone = z.string().trim().min(10, 'Enter a valid phone number').max(30);

export const establishmentInviteSchema = z.object({
  role: z.enum(['Owner', 'Staff']),
  name: z.string().trim().min(2, 'Enter the person’s name').max(150),
  phone
});

export const doctorInviteSchema = z.object({
  name: z.string().trim().max(150).optional(),
  phone: z.string().trim().max(30).optional()
});

export const activateSchema = z.object({
  code: z.string().trim().min(8, 'Enter the full code').max(20),
  name: z.string().trim().min(2, 'Enter your name').max(150),
  email: z.string().trim().email('Enter a valid email address').max(150),
  phone,
  password: z.string().min(8, 'Password must be at least 8 characters').max(128)
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters').max(128)
  })
  .refine(v => v.currentPassword !== v.newPassword, { message: 'Choose a different password', path: ['newPassword'] });

export const claimSchema = z.object({
  claimantName: z.string().trim().min(2, 'Enter your name').max(150),
  phone,
  email: z.union([z.string().trim().email('Enter a valid email').max(150), z.literal('')]).optional(),
  registrationNumber: z.string().trim().min(3, 'Enter your medical registration number').max(100),
  message: z.string().trim().max(1000).default('')
});

export const reviewClaimSchema = z.object({
  decision: z.enum(['approve', 'reject']),
  note: z.string().trim().max(500).optional()
});

export type EstablishmentInviteInput = z.infer<typeof establishmentInviteSchema>;
export type DoctorInviteInput = z.infer<typeof doctorInviteSchema>;
export type ActivateInput = z.infer<typeof activateSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ClaimInput = z.infer<typeof claimSchema>;
export type ReviewClaimInput = z.infer<typeof reviewClaimSchema>;
