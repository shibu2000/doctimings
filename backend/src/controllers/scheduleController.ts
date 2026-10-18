import type { Context } from 'hono';
import { and, eq, inArray } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import * as schema from '../db/schema.js';
import { CreateScheduleInput, UpdateScheduleInput, CreateOverrideInput } from '../validators/scheduleValidator.js';
import { recordAudit } from '../lib/audit.js';
import { badRequest, currentUser, fail, newId, notFound, validBody } from '../lib/http.js';
import { canManageEstablishment, canManageSitting, getAccess } from '../lib/access.js';
import { ensureAffiliation, resolveRoom } from '../lib/sittings.js';
import { dayOfDate, formatTo12Hour, shiftNameFor } from '../lib/time.js';

const nameMaps = async () => {
  const db = getDb();
  const [doctors, establishments, locations] = await Promise.all([
    db.select({ id: schema.doctors.id, name: schema.doctors.fullName, specialty: schema.doctors.specialty }).from(schema.doctors),
    db.select({ id: schema.establishments.id, name: schema.establishments.name }).from(schema.establishments),
    db.select({ id: schema.practiceLocations.id, name: schema.practiceLocations.name }).from(schema.practiceLocations)
  ]);
  return {
    doctors: new Map(doctors.map(d => [d.id, d])),
    establishments: new Map(establishments.map(e => [e.id, e.name])),
    locations: new Map(locations.map(l => [l.id, l.name]))
  };
};

const findSchedule = async (id: string) => {
  const [schedule] = await getDb().select().from(schema.schedules).where(eq(schema.schedules.id, id));
  return schedule;
};

export const scheduleController = {
  getSchedules: async (c: Context) => {
    const { doctorId, establishmentId, dayOfWeek } = c.req.query();
    const [list, names] = await Promise.all([getDb().select().from(schema.schedules), nameMaps()]);

    const data = list
      .filter(
        s =>
          (!doctorId || s.doctorId === doctorId) &&
          (!establishmentId || s.establishmentId === establishmentId) &&
          (!dayOfWeek || s.dayOfWeek.toLowerCase() === dayOfWeek.toLowerCase())
      )
      .map(s => ({
        ...s,
        doctorName: names.doctors.get(s.doctorId)?.name ?? '',
        doctorSpecialty: names.doctors.get(s.doctorId)?.specialty ?? '',
        establishmentName: names.establishments.get(s.establishmentId) ?? '',
        locationName: names.locations.get(s.practiceLocationId) ?? ''
      }));

    return c.json({ success: true, data, total: data.length });
  },

  getScheduleById: async (c: Context) => {
    const id = c.req.param('id')!;
    const db = getDb();
    const schedule = await findSchedule(id);
    if (!schedule) return notFound(c, `Schedule ${id} was not found`);

    const [[doctor], [establishment], [location]] = await Promise.all([
      db.select().from(schema.doctors).where(eq(schema.doctors.id, schedule.doctorId)),
      db.select().from(schema.establishments).where(eq(schema.establishments.id, schedule.establishmentId)),
      db.select().from(schema.practiceLocations).where(eq(schema.practiceLocations.id, schedule.practiceLocationId))
    ]);

    return c.json({
      success: true,
      data: { ...schedule, doctor: doctor ?? null, establishment: establishment ?? null, location: location ?? null }
    });
  },

  createSchedule: async (c: Context) => {
    const body = validBody<CreateScheduleInput>(c);
    const db = getDb();
    const [[doctor], [establishment], locations] = await Promise.all([
      db.select().from(schema.doctors).where(eq(schema.doctors.id, body.doctorId)),
      db.select().from(schema.establishments).where(eq(schema.establishments.id, body.establishmentId)),
      db.select().from(schema.practiceLocations).where(eq(schema.practiceLocations.establishmentId, body.establishmentId))
    ]);
    if (!doctor) return badRequest(c, `Doctor ${body.doctorId} does not exist`);
    if (!establishment) return badRequest(c, `Establishment ${body.establishmentId} does not exist`);
    const access = await getAccess(c);
    const allowed = doctor.affiliatedEstablishmentIds.includes(body.establishmentId)
      ? canManageSitting(access, doctor.id, body.establishmentId)
      : canManageEstablishment(access, body.establishmentId);
    if (!allowed) return fail(c, 403, 'FORBIDDEN', 'You can only change timing at your own establishments');

    const room = resolveRoom(locations, body.practiceLocationId);
    await ensureAffiliation(db, doctor, body.establishmentId);
    const [schedule] = await db
      .insert(schema.schedules)
      .values({
        id: newId('SCH'),
        doctorId: body.doctorId,
        establishmentId: body.establishmentId,
        practiceLocationId: room?.id ?? '',
        dayOfWeek: body.dayOfWeek,
        startTime: body.startTime,
        endTime: body.endTime,
        shiftName: body.shiftName || shiftNameFor(body.startTime),
        roomNumber: body.roomNumber || room?.roomDesignation || '',
        tokenPolicy: body.tokenPolicy,
        maxTokens: body.maxTokens
      })
      .returning();

    await recordAudit(db, currentUser(c), {
      action: 'Added session',
      entityType: 'Schedule',
      entityId: schedule.id,
      entityName: doctor.fullName,
      details: `${establishment.name}: ${schedule.dayOfWeek} ${formatTo12Hour(schedule.startTime)}–${formatTo12Hour(schedule.endTime)}`
    });

    return c.json({ success: true, message: 'Schedule slot created successfully', data: schedule }, 201);
  },

  updateSchedule: async (c: Context) => {
    const id = c.req.param('id')!;
    const body = validBody<UpdateScheduleInput>(c);
    const db = getDb();
    const existing = await findSchedule(id);
    if (!existing) return notFound(c, `Schedule ${id} was not found`);
    if (!canManageSitting(await getAccess(c), existing.doctorId, existing.establishmentId)) {
      return fail(c, 403, 'FORBIDDEN', 'You can only change timing at your own establishments');
    }

    if (body.practiceLocationId !== undefined) {
      const [room] = await db
        .select()
        .from(schema.practiceLocations)
        .where(and(eq(schema.practiceLocations.id, body.practiceLocationId), eq(schema.practiceLocations.establishmentId, existing.establishmentId)));
      if (!room) return badRequest(c, 'That room does not belong to this establishment');
      body.roomNumber = room.roomDesignation;
    }

    const startTime = body.startTime ?? existing.startTime;
    const endTime = body.endTime ?? existing.endTime;
    if (startTime >= endTime) return badRequest(c, 'End time must be after start time');

    const [schedule] = await db
      .update(schema.schedules)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(schema.schedules.id, id))
      .returning();

    await recordAudit(db, currentUser(c), {
      action: 'Updated session',
      entityType: 'Schedule',
      entityId: id,
      entityName: `${schedule.dayOfWeek} ${schedule.shiftName}`,
      details: `${formatTo12Hour(schedule.startTime)}–${formatTo12Hour(schedule.endTime)}`
    });

    return c.json({ success: true, message: 'Schedule updated successfully', data: schedule });
  },

  deleteSchedule: async (c: Context) => {
    const id = c.req.param('id')!;
    const db = getDb();
    const existing = await findSchedule(id);
    if (!existing) return notFound(c, `Schedule ${id} was not found`);
    if (!canManageSitting(await getAccess(c), existing.doctorId, existing.establishmentId)) {
      return fail(c, 403, 'FORBIDDEN', 'You can only change timing at your own establishments');
    }

    await db.delete(schema.schedules).where(eq(schema.schedules.id, id));
    await recordAudit(db, currentUser(c), {
      action: 'Removed session',
      entityType: 'Schedule',
      entityId: id,
      entityName: `${existing.dayOfWeek} ${existing.shiftName}`
    });

    return c.json({ success: true, message: 'Schedule deleted successfully' });
  },

  getOverrides: async (c: Context) => {
    const { doctorId, establishmentId, date, from } = c.req.query();
    const [list, names] = await Promise.all([getDb().select().from(schema.scheduleOverrides), nameMaps()]);

    const data = list
      .filter(
        o =>
          (!doctorId || o.doctorId === doctorId) &&
          (!establishmentId || o.establishmentId === establishmentId) &&
          (!date || o.date === date) &&
          (!from || o.date >= from)
      )
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(({ internalNote: _, ...o }) => ({
        ...o,
        doctorName: names.doctors.get(o.doctorId)?.name ?? '',
        establishmentName: names.establishments.get(o.establishmentId) ?? ''
      }));

    return c.json({ success: true, data, total: data.length });
  },

  createOverride: async (c: Context) => {
    const body = validBody<CreateOverrideInput>(c);
    const db = getDb();
    const [[doctor], [establishment], sameDay, daySchedules] = await Promise.all([
      db.select().from(schema.doctors).where(eq(schema.doctors.id, body.doctorId)),
      db.select().from(schema.establishments).where(eq(schema.establishments.id, body.establishmentId)),
      db
        .select()
        .from(schema.scheduleOverrides)
        .where(
          and(
            eq(schema.scheduleOverrides.doctorId, body.doctorId),
            eq(schema.scheduleOverrides.establishmentId, body.establishmentId),
            eq(schema.scheduleOverrides.date, body.date)
          )
        ),
      db
        .select()
        .from(schema.schedules)
        .where(and(eq(schema.schedules.doctorId, body.doctorId), eq(schema.schedules.establishmentId, body.establishmentId)))
    ]);
    if (!doctor) return badRequest(c, `Doctor ${body.doctorId} does not exist`);
    if (!establishment) return badRequest(c, `Establishment ${body.establishmentId} does not exist`);
    if (!doctor.affiliatedEstablishmentIds.includes(body.establishmentId)) {
      return badRequest(c, 'This doctor does not sit at that establishment');
    }
    const access = await getAccess(c);
    if (!canManageSitting(access, doctor.id, body.establishmentId)) {
      return fail(c, 403, 'FORBIDDEN', 'You can only change timing at your own establishments');
    }

    const dayOfWeek = dayOfDate(body.date);
    const standardShift =
      body.standardShift ||
      daySchedules
        .filter(s => s.dayOfWeek === dayOfWeek)
        .map(s => `${s.startTime}-${s.endTime}`)
        .join(', ') ||
      'No regular session';

    if (body.overrideType !== 'additional') {
      const superseded = sameDay.filter(o => o.overrideType !== 'additional').map(o => o.id);
      if (superseded.length) {
        await db.delete(schema.scheduleOverrides).where(inArray(schema.scheduleOverrides.id, superseded));
      }
    }

    const [override] = await db
      .insert(schema.scheduleOverrides)
      .values({
        id: newId('OVR'),
        doctorId: body.doctorId,
        establishmentId: body.establishmentId,
        date: body.date,
        dayOfWeek,
        overrideType: body.overrideType,
        standardShift,
        newStartTime: body.overrideType === 'unavailable' ? null : body.newStartTime ?? null,
        newEndTime: body.overrideType === 'unavailable' ? null : body.newEndTime ?? null,
        publicReason: body.publicReason,
        internalNote: body.internalNote,
        reportedBy: (access.platform && body.reportedBy) || currentUser(c)?.name || 'Operations Desk'
      })
      .returning();

    const labels = { unavailable: 'Marked not available', changed: 'Changed hours', additional: 'Added extra session' };
    await recordAudit(db, currentUser(c), {
      action: labels[body.overrideType],
      entityType: 'Doctor',
      entityId: doctor.id,
      entityName: doctor.fullName,
      details: `${establishment.name} on ${body.date}: ${body.publicReason}`
    });

    return c.json({ success: true, message: 'Schedule override created successfully', data: override }, 201);
  },

  deleteOverride: async (c: Context) => {
    const id = c.req.param('id')!;
    const db = getDb();
    const [existing] = await db.select().from(schema.scheduleOverrides).where(eq(schema.scheduleOverrides.id, id));
    if (!existing) return notFound(c, `Override ${id} was not found`);
    if (!canManageSitting(await getAccess(c), existing.doctorId, existing.establishmentId)) {
      return fail(c, 403, 'FORBIDDEN', 'You can only change timing at your own establishments');
    }

    await db.delete(schema.scheduleOverrides).where(eq(schema.scheduleOverrides.id, id));
    await recordAudit(db, currentUser(c), {
      action: 'Cancelled schedule change',
      entityType: 'Doctor',
      entityId: existing.doctorId,
      entityName: `${existing.date} ${existing.overrideType}`,
      details: existing.publicReason
    });

    return c.json({ success: true, message: 'Schedule override deleted successfully' });
  }
};
