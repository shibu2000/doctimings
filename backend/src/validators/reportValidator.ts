import { z } from 'zod';

export const createReportSchema = z.object({
  doctorId: z.string().optional(),
  establishmentId: z.string().optional(),
  issueType: z.enum([
    'doc_unavailable',
    'sched_change',
    'no_longer_practices',
    'info_incorrect',
    'est_closed',
    'other'
  ]),
  issueTitle: z.string().trim().min(3, 'Issue summary title is required').max(200),
  description: z.string().trim().min(10, 'Detailed description must be at least 10 characters').max(2000),
  severity: z.enum(['low', 'medium', 'high']).default('medium'),
  reporterPhone: z.string().trim().max(30).optional()
});

export const updateReportSchema = z.object({
  status: z.enum(['pending', 'verified', 'rejected', 'resolved']),
  resolutionNotes: z.string().trim().max(1000).optional()
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportInput = z.infer<typeof updateReportSchema>;
