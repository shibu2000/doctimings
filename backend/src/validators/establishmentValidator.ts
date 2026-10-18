import { z } from 'zod';

export const ESTABLISHMENT_TYPES = [
  'Pharmacy',
  'Clinic',
  'Doctor Chamber',
  'Polyclinic',
  'Diagnostic Center',
  'Nursing Home',
  'Hospital'
] as const;

export const establishmentTypeEnum = z.enum(ESTABLISHMENT_TYPES);

export const accountStatusEnum = z.enum(['Platform Managed', 'Invitation Pending', 'Account Active']);

const establishmentFields = {
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(150),
  type: establishmentTypeEnum.default('Pharmacy'),
  district: z.string().trim().min(2, 'District is required').max(100),
  subDistrict: z.string().trim().max(100).default(''),
  address: z.string().trim().min(3, 'Address is required'),
  pinCode: z.string().trim().regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit PIN code'),
  phone: z.string().trim().max(30).default(''),
  proprietorName: z.string().trim().max(150).default(''),
  licenseNumber: z.string().trim().max(100).default(''),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  verificationStatus: z.enum(['Verified', 'Needs Review', 'Pending']).default('Verified'),
  accountStatus: accountStatusEnum.default('Platform Managed'),
  isActive: z.boolean().default(true)
};

export const createEstablishmentSchema = z.object(establishmentFields);

export const updateEstablishmentSchema = z.object(establishmentFields).partial();

export const establishmentQuerySchema = z.object({
  search: z.string().optional(),
  type: z.string().optional(),
  district: z.string().optional(),
  verificationStatus: z.string().optional(),
  accountStatus: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(20)
});

export const createLocationSchema = z.object({
  establishmentId: z.string().optional(),
  name: z.string().trim().min(1, 'Room name is required').max(150),
  roomDesignation: z.string().trim().max(100).optional(),
  floor: z.string().trim().max(50).default('Ground Floor')
});

export const updateLocationSchema = z.object({
  name: z.string().trim().min(1, 'Room name is required').max(150).optional(),
  roomDesignation: z.string().trim().max(100).optional(),
  floor: z.string().trim().max(50).optional()
});

export type CreateEstablishmentInput = z.infer<typeof createEstablishmentSchema>;
export type UpdateEstablishmentInput = z.infer<typeof updateEstablishmentSchema>;
export type EstablishmentQueryParams = z.infer<typeof establishmentQuerySchema>;
export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
