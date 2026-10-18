import { z } from 'zod';
import { daysApart } from '../lib/time.js';
import { dayOfWeekEnum, sessionSchema, dateString } from './scheduleValidator.js';

export const SPECIALTIES = [
  'General Medicine',
  'Pediatrics',
  'Gynecology & Obstetrics',
  'Dermatology',
  'Orthopedics',
  'Cardiology',
  'ENT',
  'Ophthalmology',
  'Dentistry',
  'General Surgery',
  'Pulmonology',
  'Gastroenterology',
  'Neurology',
  'Psychiatry',
  'Urology',
  'Nephrology',
  'Endocrinology',
  'Oncology'
] as const;

const SPECIALTY_ALIASES: Record<string, (typeof SPECIALTIES)[number]> = {
  'Gynecology & Obs': 'Gynecology & Obstetrics'
};

export const specialtyEnum = z.preprocess(
  value => (typeof value === 'string' && SPECIALTY_ALIASES[value]) || value,
  z.enum(SPECIALTIES, { errorMap: () => ({ message: 'Choose a specialty from the list' }) })
);

export const verificationStatusEnum = z.enum(['Verified', 'Needs Review', 'Pending']);

const optionalEmail = z
  .union([z.string().trim().email('Enter a valid email address'), z.literal('')])
  .nullable()
  .optional()
  .transform(value => value || null);

export const sittingInputSchema = z.object({
  establishmentId: z.string().min(1, 'Choose an establishment'),
  sessions: z.array(sessionSchema).max(28)
});

const doctorFields = {
  fullName: z.string().trim().min(2, 'Doctor name must be at least 2 characters').max(150),
  specialty: specialtyEnum,
  registrationNumber: z.string().trim().max(100).default(''),
  council: z.string().trim().max(150).default('West Bengal Medical Council'),
  qualifications: z.string().trim().max(255).default(''),
  experienceYears: z.number().int().min(0).max(65).default(0),
  primaryPhone: z.string().trim().max(30).default(''),
  email: optionalEmail,
  languages: z.array(z.string().trim().min(1).max(40)).max(10).default(['Bengali', 'English']),
  photoUrl: z
    .union([z.string().trim().url('Photo must be a web link').max(500).refine(v => v.startsWith('https://'), 'Photo link must start with https://'), z.literal('')])
    .nullable()
    .optional()
    .transform(value => value || null),
  verificationStatus: verificationStatusEnum.default('Verified'),
  isActive: z.boolean().default(true)
};

export const createDoctorSchema = z.object({
  ...doctorFields,
  affiliatedEstablishmentIds: z.array(z.string().max(50)).max(50).default([]),
  sittings: z.array(sittingInputSchema).default([])
});

export const updateDoctorSchema = z.object(doctorFields).partial();

export const sittingSchema = z.object({
  sessions: z.array(sessionSchema).max(28)
});

export const leaveSchema = z
  .object({
    from: dateString,
    to: dateString,
    establishmentIds: z.array(z.string().max(50)).max(50).optional(),
    reason: z.string().trim().min(3, 'Add a short reason patients will see').max(200)
  })
  .refine(v => v.from <= v.to, { message: 'End date cannot be before start date', path: ['to'] })
  .refine(v => daysApart(v.from, v.to) <= 92, { message: 'Leave can cover at most 3 months at a time', path: ['to'] });

export const doctorQuerySchema = z.object({
  search: z.string().optional(),
  q: z.string().optional(),
  specialty: z.string().optional(),
  verificationStatus: z.string().optional(),
  establishmentId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(20)
});

export { dayOfWeekEnum };

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
export type SittingInput = z.infer<typeof sittingSchema>;
export type LeaveInput = z.infer<typeof leaveSchema>;
export type DoctorQueryParams = z.infer<typeof doctorQuerySchema>;
