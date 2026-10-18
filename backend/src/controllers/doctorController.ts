import type { Context } from 'hono';
import { and, eq, inArray } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import * as schema from '../db/schema.js';
import {
  CreateDoctorInput,
  UpdateDoctorInput,
  DoctorQueryParams,
  SittingInput,
  LeaveInput
} from '../validators/doctorValidator.js';
import { recordAudit } from '../lib/audit.js';
import { badRequest, currentUser, fail, newId, notFound, paginate, validBody, validQuery } from '../lib/http.js';
import {
  accessIfSignedIn,
  canEditDoctorProfile,
  canSeeDoctor,
  canManageEstablishment,
  canManageSitting,
  getAccess,
  PROFILE_FIELDS_FOR_DOCTOR,
  PROFILE_FIELDS_FOR_PARTNERS
} from '../lib/access.js';
import { ensureAffiliation, findOverlap, removeSitting, replaceSessions } from '../lib/sittings.js';
import { datesBetween, dayOfDate, istNow } from '../lib/time.js';

const findDoctor = async (id: string) => {
  const [doctor] = await getDb().select().from(schema.doctors).where(eq(schema.doctors.id, id));
  return doctor;
};

const forbidden = (c: Context, message: string) => fail(c, 403, 'FORBIDDEN', message);

const findEstablishment = async (id: string) => {
  const [establishment] = await getDb().select().from(schema.establishments).where(eq(schema.establishments.id, id));
  return establishment;
};

export const doctorController = {
  getDoctors: async (c: Context) => {
    const { search, q, specialty, verificationStatus, establishmentId, page, limit } = validQuery<DoctorQueryParams>(c);
    const viewer = await accessIfSignedIn(c);
    let list = (await getDb().select().from(schema.doctors).orderBy(schema.doctors.fullName)).filter(d => canSeeDoctor(viewer, d));

    const term = (search || q || '').toLowerCase().trim();
    if (term) {
      list = list.filter(d =>
        [d.fullName, d.specialty, d.registrationNumber, d.qualifications].some(v => v.toLowerCase().includes(term))
      );
    }
    if (specialty && specialty !== 'All') {
      list = list.filter(d => d.specialty.toLowerCase() === specialty.toLowerCase());
    }
    if (verificationStatus && verificationStatus !== 'All') {
      list = list.filter(d => d.verificationStatus.toLowerCase() === verificationStatus.toLowerCase());
    }
    if (establishmentId) {
      list = list.filter(d => d.affiliatedEstablishmentIds.includes(establishmentId));
    }

    return c.json({ success: true, ...paginate(list, page, limit) });
  },

  getDoctorById: async (c: Context) => {
    const id = c.req.param('id')!;
    const db = getDb();
    const doctor = await findDoctor(id);
    if (!doctor || !canSeeDoctor(await accessIfSignedIn(c), doctor)) return notFound(c, `Doctor ${id} was not found`);

    const [affiliatedEstablishments, schedules, overrides] = await Promise.all([
      doctor.affiliatedEstablishmentIds.length
        ? db.select().from(schema.establishments).where(inArray(schema.establishments.id, doctor.affiliatedEstablishmentIds))
        : Promise.resolve([]),
      db.select().from(schema.schedules).where(eq(schema.schedules.doctorId, id)),
      db.select().from(schema.scheduleOverrides).where(eq(schema.scheduleOverrides.doctorId, id))
    ]);

    return c.json({
      success: true,
      data: { ...doctor, affiliatedEstablishments, schedules, overrides: overrides.map(({ internalNote: _, ...o }) => o) }
    });
  },

  createDoctor: async (c: Context) => {
    const { sittings, affiliatedEstablishmentIds, ...data } = validBody<CreateDoctorInput>(c);
    const db = getDb();
    const access = await getAccess(c);

    const establishmentIds = [...new Set([...affiliatedEstablishmentIds, ...sittings.map(s => s.establishmentId)])];
    if (!access.platform) {
      if (!establishmentIds.length) return forbidden(c, 'Add the doctor to one of your establishments');
      if (!establishmentIds.every(id => canManageEstablishment(access, id))) {
        return forbidden(c, 'You can only add doctors to your own establishments');
      }
      data.verificationStatus = 'Needs Review';
      data.isActive = true;
    }
    if (establishmentIds.length) {
      const found = await db
        .select({ id: schema.establishments.id })
        .from(schema.establishments)
        .where(inArray(schema.establishments.id, establishmentIds));
      if (found.length !== establishmentIds.length) {
        return badRequest(c, 'One of the selected establishments no longer exists');
      }
    }
    for (const sitting of sittings) {
      const overlapDay = findOverlap(sitting.sessions);
      if (overlapDay) return badRequest(c, `Two sessions overlap on ${overlapDay}`);
    }

    const [doctor] = await db
      .insert(schema.doctors)
      .values({ ...data, id: newId('DOC'), affiliatedEstablishmentIds: establishmentIds })
      .returning();

    for (const sitting of sittings) {
      await replaceSessions(db, doctor.id, sitting.establishmentId, sitting.sessions);
    }

    await recordAudit(db, currentUser(c), {
      action: 'Created doctor',
      entityType: 'Doctor',
      entityId: doctor.id,
      entityName: doctor.fullName,
      details: `${doctor.specialty}; ${establishmentIds.length} establishment(s)`
    });

    return c.json({ success: true, data: doctor }, 201);
  },

  updateDoctor: async (c: Context) => {
    const id = c.req.param('id')!;
    const body = validBody<UpdateDoctorInput>(c);
    const db = getDb();
    const existing = await findDoctor(id);
    if (!existing) return notFound(c, `Doctor ${id} was not found`);

    const access = await getAccess(c);
    if (!(await canEditDoctorProfile(access, existing))) {
      return forbidden(c, 'Only the doctor or DocTimings can change this profile');
    }
    const allowedFields: readonly string[] = access.doctorId === id ? PROFILE_FIELDS_FOR_DOCTOR : PROFILE_FIELDS_FOR_PARTNERS;
    const updates = access.platform ? body : Object.fromEntries(Object.entries(body).filter(([key]) => allowedFields.includes(key)));

    const [doctor] = await db
      .update(schema.doctors)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.doctors.id, id))
      .returning();

    const fields = Object.keys(updates);
    await recordAudit(db, currentUser(c), {
      action: fields.length ? 'Updated doctor' : 'Confirmed doctor details',
      entityType: 'Doctor',
      entityId: id,
      entityName: doctor.fullName,
      details: fields.length ? `Changed: ${fields.join(', ')}` : 'Marked as checked'
    });

    return c.json({ success: true, data: doctor });
  },

  deleteDoctor: async (c: Context) => {
    const id = c.req.param('id')!;
    const db = getDb();
    const existing = await findDoctor(id);
    if (!existing) return notFound(c, `Doctor ${id} was not found`);

    await db.delete(schema.doctors).where(eq(schema.doctors.id, id));
    await recordAudit(db, currentUser(c), {
      action: 'Deleted doctor',
      entityType: 'Doctor',
      entityId: id,
      entityName: existing.fullName
    });

    return c.json({ success: true, message: `${existing.fullName} was removed` });
  },

  saveSitting: async (c: Context) => {
    const doctorId = c.req.param('id')!;
    const establishmentId = c.req.param('establishmentId')!;
    const { sessions } = validBody<SittingInput>(c);
    const db = getDb();

    const [doctor, establishment] = await Promise.all([findDoctor(doctorId), findEstablishment(establishmentId)]);
    if (!doctor) return notFound(c, `Doctor ${doctorId} was not found`);
    if (!establishment) return notFound(c, `Establishment ${establishmentId} was not found`);

    const isNew = !doctor.affiliatedEstablishmentIds.includes(establishmentId);
    const access = await getAccess(c);
    const allowed = isNew ? canManageEstablishment(access, establishmentId) : canManageSitting(access, doctorId, establishmentId);
    if (!allowed) return forbidden(c, 'You can only change timing at your own establishments');

    const overlapDay = findOverlap(sessions);
    if (overlapDay) return badRequest(c, `Two sessions overlap on ${overlapDay}`);

    await ensureAffiliation(db, doctor, establishmentId);
    const schedules = await replaceSessions(db, doctorId, establishmentId, sessions);
    await db.update(schema.doctors).set({ updatedAt: new Date() }).where(eq(schema.doctors.id, doctorId));

    await recordAudit(db, currentUser(c), {
      action: isNew ? 'Added doctor to establishment' : 'Updated weekly timing',
      entityType: 'Doctor',
      entityId: doctorId,
      entityName: doctor.fullName,
      details: `${establishment.name}: ${sessions.length} session(s) per week`
    });

    return c.json({ success: true, data: { doctorId, establishmentId, schedules } });
  },

  removeSitting: async (c: Context) => {
    const doctorId = c.req.param('id')!;
    const establishmentId = c.req.param('establishmentId')!;
    const db = getDb();
    const doctor = await findDoctor(doctorId);
    if (!doctor) return notFound(c, `Doctor ${doctorId} was not found`);
    if (!doctor.affiliatedEstablishmentIds.includes(establishmentId)) {
      return notFound(c, 'This doctor does not sit at that establishment');
    }
    if (!canManageSitting(await getAccess(c), doctorId, establishmentId)) {
      return forbidden(c, 'You can only change your own establishments');
    }

    const establishment = await findEstablishment(establishmentId);
    await removeSitting(db, doctor, establishmentId);
    await recordAudit(db, currentUser(c), {
      action: 'Removed doctor from establishment',
      entityType: 'Doctor',
      entityId: doctorId,
      entityName: doctor.fullName,
      details: establishment?.name ?? establishmentId
    });

    return c.json({ success: true, message: 'Removed' });
  },

  markLeave: async (c: Context) => {
    const doctorId = c.req.param('id')!;
    const { from, to, establishmentIds, reason } = validBody<LeaveInput>(c);
    const db = getDb();
    const doctor = await findDoctor(doctorId);
    if (!doctor) return notFound(c, `Doctor ${doctorId} was not found`);

    const access = await getAccess(c);
    if (establishmentIds?.some(id => !canManageSitting(access, doctorId, id))) {
      return forbidden(c, 'You can only change timing at your own establishments');
    }
    const targetIds = (establishmentIds?.length ? establishmentIds : doctor.affiliatedEstablishmentIds).filter(
      id => doctor.affiliatedEstablishmentIds.includes(id) && canManageSitting(access, doctorId, id)
    );
    if (!targetIds.length) {
      return doctor.affiliatedEstablishmentIds.length
        ? forbidden(c, 'You can only change timing at your own establishments')
        : badRequest(c, 'This doctor has no establishments yet');
    }

    const today = istNow().date;
    if (to < today) return badRequest(c, 'Leave dates are in the past');
    const dates = datesBetween(from < today ? today : from, to, 93);

    const [schedules, existingOverrides] = await Promise.all([
      db
        .select()
        .from(schema.schedules)
        .where(and(eq(schema.schedules.doctorId, doctorId), inArray(schema.schedules.establishmentId, targetIds))),
      db
        .select()
        .from(schema.scheduleOverrides)
        .where(
          and(
            eq(schema.scheduleOverrides.doctorId, doctorId),
            inArray(schema.scheduleOverrides.establishmentId, targetIds),
            inArray(schema.scheduleOverrides.date, dates)
          )
        )
    ]);

    const inserts: (typeof schema.scheduleOverrides.$inferInsert)[] = [];
    const replaced: string[] = [];
    for (const date of dates) {
      const day = dayOfDate(date);
      for (const establishmentId of targetIds) {
        const daySessions = schedules.filter(s => s.isActive && s.establishmentId === establishmentId && s.dayOfWeek === day);
        if (!daySessions.length) continue;
        const sameDay = existingOverrides.filter(o => o.establishmentId === establishmentId && o.date === date);
        if (sameDay.some(o => o.overrideType === 'unavailable')) continue;
        replaced.push(...sameDay.filter(o => o.overrideType === 'changed').map(o => o.id));
        inserts.push({
          id: newId('OVR'),
          doctorId,
          establishmentId,
          date,
          dayOfWeek: day,
          overrideType: 'unavailable',
          standardShift: daySessions.map(s => `${s.startTime}-${s.endTime}`).join(', '),
          publicReason: reason,
          reportedBy: currentUser(c)?.name ?? 'Operations Desk'
        });
      }
    }

    if (!inserts.length) {
      return badRequest(c, 'The doctor has no sessions on those dates, or is already marked away');
    }
    if (replaced.length) {
      await db.delete(schema.scheduleOverrides).where(inArray(schema.scheduleOverrides.id, replaced));
    }
    const created = await db.insert(schema.scheduleOverrides).values(inserts).returning();

    await recordAudit(db, currentUser(c), {
      action: 'Marked doctor away',
      entityType: 'Doctor',
      entityId: doctorId,
      entityName: doctor.fullName,
      details: `${from} to ${to}: ${reason} (${created.length} session day(s))`
    });

    return c.json({ success: true, data: created }, 201);
  }
};
