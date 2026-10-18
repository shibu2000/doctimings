import { z } from 'zod';
import { DAYS, TIME_PATTERN, isRealDate, toMinutes } from '../lib/time.js';

export const dayOfWeekEnum = z.enum(DAYS);

export const dateString = z.string().refine(isRealDate, 'Enter a real date (YYYY-MM-DD)');

export const timeString = z
  .string()
  .trim()
  .transform(value => (/^\d:\d{2}$/.test(value) ? `0${value}` : value))
  .pipe(z.string().regex(TIME_PATTERN, 'Time must be in 24-hour HH:mm format'));

const endsAfterStart = (v: { startTime?: string; endTime?: string }) =>
  !v.startTime || !v.endTime || toMinutes(v.startTime) < toMinutes(v.endTime);

export const sessionSchema = z
  .object({
    dayOfWeek: dayOfWeekEnum,
    startTime: timeString,
    endTime: timeString,
    practiceLocationId: z.string().optional()
  })
  .refine(endsAfterStart, { message: 'End time must be after start time', path: ['endTime'] });

export const createScheduleSchema = z
  .object({
    doctorId: z.string().min(1, 'Doctor ID is required'),
    establishmentId: z.string().min(1, 'Establishment ID is required'),
    practiceLocationId: z.string().optional(),
    dayOfWeek: dayOfWeekEnum,
    startTime: timeString,
    endTime: timeString,
    shiftName: z.string().trim().max(100).optional(),
    roomNumber: z.string().trim().max(50).optional(),
    tokenPolicy: z.string().trim().max(100).default('First Come First Served'),
    maxTokens: z.number().int().min(1).max(1000).default(30)
  })
  .refine(endsAfterStart, { message: 'End time must be after start time', path: ['endTime'] });

export const updateScheduleSchema = z
  .object({
    practiceLocationId: z.string().optional(),
    dayOfWeek: dayOfWeekEnum.optional(),
    startTime: timeString.optional(),
    endTime: timeString.optional(),
    shiftName: z.string().trim().max(100).optional(),
    roomNumber: z.string().trim().max(50).optional(),
    tokenPolicy: z.string().trim().max(100).optional(),
    maxTokens: z.number().int().min(1).max(1000).optional(),
    isActive: z.boolean().optional()
  })
  .refine(endsAfterStart, { message: 'End time must be after start time', path: ['endTime'] });

export const createOverrideSchema = z
  .object({
    doctorId: z.string().min(1, 'Doctor ID is required'),
    establishmentId: z.string().min(1, 'Establishment ID is required'),
    date: dateString,
    dayOfWeek: dayOfWeekEnum.optional(),
    overrideType: z.enum(['unavailable', 'changed', 'additional']),
    standardShift: z.string().trim().max(100).optional(),
    newStartTime: timeString.optional(),
    newEndTime: timeString.optional(),
    publicReason: z.string().trim().min(3, 'Add a short reason patients will see').max(300),
    internalNote: z.string().trim().max(1000).default(''),
    reportedBy: z.string().trim().max(150).optional()
  })
  .refine(v => v.overrideType !== 'additional' || (v.newStartTime && v.newEndTime), {
    message: 'Start and end times are required for an extra session',
    path: ['newStartTime']
  })
  .refine(v => endsAfterStart({ startTime: v.newStartTime, endTime: v.newEndTime }), {
    message: 'End time must be after start time',
    path: ['newEndTime']
  });

export type SessionInput = z.infer<typeof sessionSchema>;
export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
export type CreateOverrideInput = z.infer<typeof createOverrideSchema>;
