import { z } from 'zod';

export const establishmentTypeEnum = z.enum([
  'Pharmacy',
  'Clinic',
  'Doctor Chamber',
  'Polyclinic',
  'Diagnostic Center',
  'Nursing Home',
  'Hospital'
]);

export const accountStatusEnum = z.enum([
  'Platform Managed',
  'Invitation Pending',
  'Account Active'
]);

export const createEstablishmentSchema = z.object({
  name: z.string().min(2, 'Establishment name must be at least 2 characters'),
  type: establishmentTypeEnum.default('Doctor Chamber'),
  district: z.string().min(2, 'District is required'),
  subDistrict: z.string().min(2, 'Sub-district / Block is required'),
  address: z.string().min(5, 'Physical address is required'),
  pinCode: z.string().regex(/^[1-9][0-9]{5}$/, 'Valid 6-digit Indian PIN code required'),
  phone: z.string().min(10, 'Contact telephone is required'),
  proprietorName: z.string().min(2, 'Proprietor name is required'),
  licenseNumber: z.string().min(3, 'Drug / Trade license number is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  verificationStatus: z.enum(['Verified', 'Needs Review', 'Pending']).default('Verified'),
  accountStatus: accountStatusEnum.default('Platform Managed')
});

export const updateEstablishmentSchema = createEstablishmentSchema.partial();

export const establishmentQuerySchema = z.object({
  search: z.string().optional(),
  type: z.string().optional(),
  district: z.string().optional(),
  verificationStatus: z.string().optional(),
  accountStatus: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export const createLocationSchema = z.object({
  establishmentId: z.string().min(1, 'Establishment ID is required'),
  name: z.string().min(2, 'Location name is required'),
  roomDesignation: z.string().min(1, 'Room / Bay designation is required'),
  floor: z.string().default('Ground Floor')
});

export type CreateEstablishmentInput = z.infer<typeof createEstablishmentSchema>;
export type UpdateEstablishmentInput = z.infer<typeof updateEstablishmentSchema>;
export type EstablishmentQueryParams = z.infer<typeof establishmentQuerySchema>;
export type CreateLocationInput = z.infer<typeof createLocationSchema>;
