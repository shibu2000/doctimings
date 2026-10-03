import { z } from 'zod';

export const searchQuerySchema = z.object({
  q: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().min(1).max(200).default(15),
  specialty: z.string().optional(),
  dayOfWeek: z.string().optional(),
  availableOnly: z.coerce.boolean().default(false),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20)
});

export type SearchQueryParams = z.infer<typeof searchQuerySchema>;
