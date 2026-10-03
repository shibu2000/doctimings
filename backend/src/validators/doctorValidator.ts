import { z } from 'zod';

export const specialtyEnum = z.enum([
  'General Medicine',
  'Pediatrics',
  'Dermatology',
  'Orthopedics',
  'Gynecology & Obs',
  'Cardiology',
  'General Surgery',
  'Pulmonology',
  'ENT',
  'Ophthalmology',
  'Dentistry'
]);

export const verificationStatusEnum = z.enum(['Verified', 'Needs Review', 'Pending']);

export const createDoctorSchema = z.object({
  fullName: z.string().min(2, 'Doctor name must be at least 2 characters'),
  specialty: specialtyEnum,
  registrationNumber: z.string().min(3, 'Registration number is required'),
  council: z.string().default('West Bengal Medical Council'),
  qualifications: z.string().min(2, 'Qualifications are required'),
  experienceYears: z.number().int().min(0).max(65).default(0),
  primaryPhone: z.string().min(10, 'Valid primary phone number is required'),
  email: z.string().email().optional(),
  languages: z.array(z.string()).default(['Bengali', 'English']),
  photoUrl: z.string().optional(),
  verificationStatus: verificationStatusEnum.default('Verified'),
  affiliatedEstablishmentIds: z.array(z.string()).default([])
});

export const updateDoctorSchema = createDoctorSchema.partial();

export const doctorQuerySchema = z.object({
  search: z.string().optional(),
  specialty: z.string().optional(),
  verificationStatus: z.string().optional(),
  establishmentId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
export type DoctorQueryParams = z.infer<typeof doctorQuerySchema>;
