import { and, eq, gte, inArray } from 'drizzle-orm';
import type { Database } from '../db/index.js';
import * as schema from '../db/schema.js';
import type { SessionInput } from '../validators/scheduleValidator.js';
import { newId } from './http.js';
import { istNow, shiftNameFor, toMinutes } from './time.js';

type Schedule = typeof schema.schedules.$inferSelect;
type Location = typeof schema.practiceLocations.$inferSelect;

const sessionKey = (s: Pick<Schedule, 'dayOfWeek' | 'startTime' | 'endTime' | 'practiceLocationId'>) =>
  `${s.dayOfWeek}|${s.startTime}|${s.endTime}|${s.practiceLocationId}`;

export const findOverlap = (sessions: SessionInput[]) => {
  for (let i = 0; i < sessions.length; i++) {
    for (let j = i + 1; j < sessions.length; j++) {
      const a = sessions[i];
      const b = sessions[j];
      if (
        a.dayOfWeek === b.dayOfWeek &&
        toMinutes(a.startTime) < toMinutes(b.endTime) &&
        toMinutes(b.startTime) < toMinutes(a.endTime)
      ) {
        return a.dayOfWeek;
      }
    }
  }
  return null;
};

export const resolveRoom = (locations: Location[], id?: string) =>
  locations.find(l => l.id === id) ?? locations[0];

export const ensureAffiliation = async (db: Database, doctor: typeof schema.doctors.$inferSelect, establishmentId: string) => {
  if (doctor.affiliatedEstablishmentIds.includes(establishmentId)) return doctor;
  const [updated] = await db
    .update(schema.doctors)
    .set({
      affiliatedEstablishmentIds: [...doctor.affiliatedEstablishmentIds, establishmentId],
      updatedAt: new Date()
    })
    .where(eq(schema.doctors.id, doctor.id))
    .returning();
  return updated;
};

export const replaceSessions = async (
  db: Database,
  doctorId: string,
  establishmentId: string,
  sessions: SessionInput[]
) => {
  const [existing, locations] = await Promise.all([
    db
      .select()
      .from(schema.schedules)
      .where(and(eq(schema.schedules.doctorId, doctorId), eq(schema.schedules.establishmentId, establishmentId))),
    db.select().from(schema.practiceLocations).where(eq(schema.practiceLocations.establishmentId, establishmentId))
  ]);

  const existingByKey = new Map(existing.map(s => [sessionKey(s), s]));
  const kept = new Set<string>();
  const seen = new Set<string>();
  const inserts: (typeof schema.schedules.$inferInsert)[] = [];

  for (const session of sessions) {
    const room = resolveRoom(locations, session.practiceLocationId);
    const desired = {
      dayOfWeek: session.dayOfWeek,
      startTime: session.startTime,
      endTime: session.endTime,
      practiceLocationId: room?.id ?? ''
    };
    const key = sessionKey(desired);
    if (seen.has(key)) continue;
    seen.add(key);
    const match = existingByKey.get(key);
    if (match) {
      kept.add(match.id);
      continue;
    }
    inserts.push({
      id: newId('SCH'),
      doctorId,
      establishmentId,
      ...desired,
      shiftName: shiftNameFor(session.startTime),
      roomNumber: room?.roomDesignation ?? '',
      isActive: true
    });
  }

  const removed = existing.filter(s => !kept.has(s.id)).map(s => s.id);
  if (removed.length) {
    await db.delete(schema.schedules).where(inArray(schema.schedules.id, removed));
  }
  if (inserts.length) {
    await db.insert(schema.schedules).values(inserts);
  }
  const inactive = existing.filter(s => kept.has(s.id) && !s.isActive).map(s => s.id);
  if (inactive.length) {
    await db.update(schema.schedules).set({ isActive: true, updatedAt: new Date() }).where(inArray(schema.schedules.id, inactive));
  }

  return db
    .select()
    .from(schema.schedules)
    .where(and(eq(schema.schedules.doctorId, doctorId), eq(schema.schedules.establishmentId, establishmentId)));
};

export const removeSitting = async (db: Database, doctor: typeof schema.doctors.$inferSelect, establishmentId: string) => {
  await db
    .delete(schema.schedules)
    .where(and(eq(schema.schedules.doctorId, doctor.id), eq(schema.schedules.establishmentId, establishmentId)));
  await db
    .delete(schema.scheduleOverrides)
    .where(
      and(
        eq(schema.scheduleOverrides.doctorId, doctor.id),
        eq(schema.scheduleOverrides.establishmentId, establishmentId),
        gte(schema.scheduleOverrides.date, istNow().date)
      )
    );
  await db
    .update(schema.doctors)
    .set({
      affiliatedEstablishmentIds: doctor.affiliatedEstablishmentIds.filter(id => id !== establishmentId),
      updatedAt: new Date()
    })
    .where(eq(schema.doctors.id, doctor.id));
};

export const touchDoctor = (db: Database, doctorId: string) =>
  db.update(schema.doctors).set({ updatedAt: new Date() }).where(eq(schema.doctors.id, doctorId));
