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
  issueTitle: z.string().min(3, 'Issue summary title is required'),
  description: z.string().min(10, 'Detailed description must be at least 10 characters'),
  severity: z.enum(['low', 'medium', 'high']).default('medium'),
  reporterPhone: z.string().optional()
});

export const updateReportSchema = z.object({
  status: z.enum(['pending', 'verified', 'rejected', 'resolved']),
  resolutionNotes: z.string().optional()
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportInput = z.infer<typeof updateReportSchema>;
