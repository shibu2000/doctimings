import type { Context } from 'hono';
import { count, eq, gte } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import * as schema from '../db/schema.js';
import { istNow } from '../lib/time.js';

export const adminController = {
  snapshot: async (c: Context) => {
    const today = istNow();
    const db = getDb();
    const [doctors, establishments, locations, schedules, overrides, [pending], [claims], links] = await Promise.all([
      db.select().from(schema.doctors).orderBy(schema.doctors.fullName),
      db.select().from(schema.establishments).orderBy(schema.establishments.name),
      db.select().from(schema.practiceLocations),
      db.select().from(schema.schedules),
      db.select().from(schema.scheduleOverrides).where(gte(schema.scheduleOverrides.date, today.date)),
      db.select({ value: count() }).from(schema.reports).where(eq(schema.reports.status, 'pending')),
      db.select({ value: count() }).from(schema.doctorClaims).where(eq(schema.doctorClaims.status, 'pending')),
      db.select({ doctorId: schema.doctorLinks.doctorId }).from(schema.doctorLinks)
    ]);

    return c.json({
      success: true,
      data: {
        today: { date: today.date, dayOfWeek: today.dayOfWeek, minutes: today.minutes },
        doctors,
        establishments,
        locations,
        schedules,
        overrides: overrides.sort((a, b) => a.date.localeCompare(b.date)),
        pendingReports: pending.value,
        pendingClaims: claims.value,
        claimedDoctorIds: links.map(l => l.doctorId)
      }
    });
  }
};
