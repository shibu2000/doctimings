import { z } from 'zod';

export const dayOfWeekEnum = z.enum([
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
]);

export const createScheduleSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  establishmentId: z.string().min(1, 'Establishment ID is required'),
  practiceLocationId: z.string().min(1, 'Practice location ID is required'),
  dayOfWeek: dayOfWeekEnum,
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  shiftName: z.string().min(2, 'Shift name is required'),
  roomNumber: z.string().min(1, 'Room number is required'),
  tokenPolicy: z.string().default('First Come First Served'),
  maxTokens: z.number().int().min(1).default(30)
});

export const updateScheduleSchema = createScheduleSchema.partial();

export const createOverrideSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  establishmentId: z.string().min(1, 'Establishment ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  dayOfWeek: dayOfWeekEnum,
  overrideType: z.enum(['unavailable', 'changed', 'additional']),
  standardShift: z.string().min(1, 'Standard shift is required'),
  newStartTime: z.string().optional(),
  newEndTime: z.string().optional(),
  publicReason: z.string().min(3, 'Public explanation reason is required'),
  internalNote: z.string().default(''),
  reportedBy: z.string().default('Operations Desk')
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
export type CreateOverrideInput = z.infer<typeof createOverrideSchema>;
