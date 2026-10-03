import type { Context } from 'hono';
import { db, memoryStore } from '../db/index.js';
import * as schema from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { CreateScheduleInput, UpdateScheduleInput, CreateOverrideInput } from '../validators/scheduleValidator.js';
import {
  ScheduleRecord,
  ScheduleOverrideRecord,
  DoctorRecord,
  EstablishmentRecord,
  PracticeLocationRecord,
  JWTPayload
} from '../types/index.js';

export const scheduleController = {
  getSchedules: async (c: Context) => {
    const doctorId = c.req.query('doctorId');
    const establishmentId = c.req.query('establishmentId');
    const dayOfWeek = c.req.query('dayOfWeek');

    let list: ScheduleRecord[];
    let doctorsList = memoryStore.doctors;
    let establishmentsList = memoryStore.establishments;
    let locationsList = memoryStore.practiceLocations;

    if (db) {
      try {
        const [schs, docs, ests, locs] = await Promise.all([
          db.select().from(schema.schedules),
          db.select().from(schema.doctors),
          db.select().from(schema.establishments),
          db.select().from(schema.practiceLocations)
        ]);
        list = schs as ScheduleRecord[];
        doctorsList = docs as DoctorRecord[];
        establishmentsList = ests as EstablishmentRecord[];
        locationsList = locs as PracticeLocationRecord[];
      } catch {
        list = [...memoryStore.schedules];
      }
    } else {
      list = [...memoryStore.schedules];
    }

    if (doctorId) {
      list = list.filter(s => s.doctorId === doctorId);
    }

    if (establishmentId) {
      list = list.filter(s => s.establishmentId === establishmentId);
    }

    if (dayOfWeek) {
      list = list.filter(s => s.dayOfWeek.toLowerCase() === dayOfWeek.toLowerCase());
    }

    const enhanced = list.map(s => {
      const doc = doctorsList.find(d => d.id === s.doctorId);
      const est = establishmentsList.find(e => e.id === s.establishmentId);
      const loc = locationsList.find(l => l.id === s.practiceLocationId);

      return {
        ...s,
        doctorName: doc ? doc.fullName : '',
        doctorSpecialty: doc ? doc.specialty : '',
        establishmentName: est ? est.name : '',
        locationName: loc ? loc.name : ''
      };
    });

    return c.json({
      success: true,
      data: enhanced,
      total: enhanced.length
    });
  },

  getScheduleById: async (c: Context) => {
    const id = c.req.param('id');
    let schedule: ScheduleRecord | undefined;
    let doc: DoctorRecord | null = null;
    let est: EstablishmentRecord | null = null;
    let loc: PracticeLocationRecord | null = null;

    if (db) {
      try {
        const rows = await db.select().from(schema.schedules).where(eq(schema.schedules.id, id));
        schedule = rows[0] as ScheduleRecord | undefined;
        if (schedule) {
          const [docs, ests, locs] = await Promise.all([
            db.select().from(schema.doctors).where(eq(schema.doctors.id, schedule.doctorId)),
            db.select().from(schema.establishments).where(eq(schema.establishments.id, schedule.establishmentId)),
            db.select().from(schema.practiceLocations).where(eq(schema.practiceLocations.id, schedule.practiceLocationId))
          ]);
          doc = (docs[0] as DoctorRecord) || null;
          est = (ests[0] as EstablishmentRecord) || null;
          loc = (locs[0] as PracticeLocationRecord) || null;
        }
      } catch {
        schedule = memoryStore.schedules.find(s => s.id === id);
      }
    } else {
      schedule = memoryStore.schedules.find(s => s.id === id);
    }

    if (!schedule) {
      return c.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Schedule slot with ID ${id} was not found`
          }
        },
        404
      );
    }

    if (!doc) doc = memoryStore.doctors.find(d => d.id === schedule!.doctorId) || null;
    if (!est) est = memoryStore.establishments.find(e => e.id === schedule!.establishmentId) || null;
    if (!loc) loc = memoryStore.practiceLocations.find(l => l.id === schedule!.practiceLocationId) || null;

    return c.json({
      success: true,
      data: {
        ...schedule,
        doctor: doc,
        establishment: est,
        location: loc
      }
    });
  },

  createSchedule: async (c: Context) => {
    const body = (c.get('validatedBody') || (await c.req.json())) as CreateScheduleInput;
    const user = c.get('user') as JWTPayload | undefined;

    const doctorExists = memoryStore.doctors.some(d => d.id === body.doctorId);
    if (!doctorExists) {
      return c.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Doctor ${body.doctorId} does not exist`
          }
        },
        400
      );
    }

    const newSchedule = {
      id: `SCH-${Date.now().toString().slice(-6)}`,
      doctorId: body.doctorId,
      establishmentId: body.establishmentId,
      practiceLocationId: body.practiceLocationId,
      dayOfWeek: body.dayOfWeek,
      startTime: body.startTime,
      endTime: body.endTime,
      shiftName: body.shiftName,
      roomNumber: body.roomNumber,
      tokenPolicy: body.tokenPolicy || 'First Come First Served',
      maxTokens: body.maxTokens || 30,
      isActive: true
    };

    memoryStore.schedules.push(newSchedule);

    memoryStore.auditLogs.unshift({
      id: `LOG-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      actorId: user?.sub || 'SYSTEM',
      actorName: user?.name || 'Anonymous',
      action: 'Create',
      entityType: 'Schedule',
      entityId: newSchedule.id,
      entityName: `${newSchedule.dayOfWeek} ${newSchedule.shiftName}`,
      details: `Added new schedule for Doctor ${newSchedule.doctorId}`
    });

    return c.json(
      {
        success: true,
        message: 'Schedule slot created successfully',
        data: newSchedule
      },
      201
    );
  },

  updateSchedule: async (c: Context) => {
    const id = c.req.param('id');
    const body = (c.get('validatedBody') || (await c.req.json())) as UpdateScheduleInput;
    const user = c.get('user') as JWTPayload | undefined;

    const index = memoryStore.schedules.findIndex(s => s.id === id);
    if (index === -1) {
      return c.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Schedule ${id} does not exist`
          }
        },
        404
      );
    }

    const existing = memoryStore.schedules[index];
    const updated = {
      ...existing,
      ...body
    };

    memoryStore.schedules[index] = updated;

    memoryStore.auditLogs.unshift({
      id: `LOG-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      actorId: user?.sub || 'SYSTEM',
      actorName: user?.name || 'Anonymous',
      action: 'Update',
      entityType: 'Schedule',
      entityId: id || '',
      entityName: `${updated.dayOfWeek} ${updated.shiftName}`,
      details: `Updated schedule slot properties`
    });

    return c.json({
      success: true,
      message: 'Schedule updated successfully',
      data: updated
    });
  },

  deleteSchedule: async (c: Context) => {
    const id = c.req.param('id');
    const user = c.get('user') as JWTPayload | undefined;

    const index = memoryStore.schedules.findIndex(s => s.id === id);
    if (index === -1) {
      return c.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Schedule ${id} does not exist`
          }
        },
        404
      );
    }

    const deleted = memoryStore.schedules.splice(index, 1)[0];

    memoryStore.auditLogs.unshift({
      id: `LOG-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      actorId: user?.sub || 'SYSTEM',
      actorName: user?.name || 'Anonymous',
      action: 'Delete',
      entityType: 'Schedule',
      entityId: id || '',
      entityName: `${deleted.dayOfWeek} ${deleted.shiftName}`,
      details: `Deleted schedule slot`
    });

    return c.json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  },

  getOverrides: async (c: Context) => {
    const doctorId = c.req.query('doctorId');
    const establishmentId = c.req.query('establishmentId');
    const date = c.req.query('date');

    let list: ScheduleOverrideRecord[];
    let doctorsList = memoryStore.doctors;
    let establishmentsList = memoryStore.establishments;

    if (db) {
      try {
        const [ovrs, docs, ests] = await Promise.all([
          db.select().from(schema.scheduleOverrides),
          db.select().from(schema.doctors),
          db.select().from(schema.establishments)
        ]);
        list = ovrs as ScheduleOverrideRecord[];
        doctorsList = docs as DoctorRecord[];
        establishmentsList = ests as EstablishmentRecord[];
      } catch {
        list = [...memoryStore.overrides];
      }
    } else {
      list = [...memoryStore.overrides];
    }

    if (doctorId) {
      list = list.filter(o => o.doctorId === doctorId);
    }

    if (establishmentId) {
      list = list.filter(o => o.establishmentId === establishmentId);
    }

    if (date) {
      list = list.filter(o => o.date === date);
    }

    const enhanced = list.map(o => {
      const doc = doctorsList.find(d => d.id === o.doctorId);
      const est = establishmentsList.find(e => e.id === o.establishmentId);

      return {
        ...o,
        doctorName: doc ? doc.fullName : '',
        establishmentName: est ? est.name : ''
      };
    });

    return c.json({
      success: true,
      data: enhanced,
      total: enhanced.length
    });
  },

  createOverride: async (c: Context) => {
    const body = (c.get('validatedBody') || (await c.req.json())) as CreateOverrideInput;
    const user = c.get('user') as JWTPayload | undefined;

    const doctorExists = memoryStore.doctors.some(d => d.id === body.doctorId);
    if (!doctorExists) {
      return c.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Doctor ${body.doctorId} does not exist`
          }
        },
        400
      );
    }

    const newOverride = {
      id: `OVR-${Date.now().toString().slice(-6)}`,
      doctorId: body.doctorId,
      establishmentId: body.establishmentId,
      date: body.date,
      dayOfWeek: body.dayOfWeek,
      overrideType: body.overrideType,
      standardShift: body.standardShift,
      publicReason: body.publicReason,
      internalNote: body.internalNote || '',
      reportedBy: body.reportedBy || user?.name || 'Operations Desk'
    };

    memoryStore.overrides.push(newOverride);

    memoryStore.auditLogs.unshift({
      id: `LOG-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      actorId: user?.sub || 'SYSTEM',
      actorName: user?.name || 'Anonymous',
      action: 'Create',
      entityType: 'ScheduleOverride',
      entityId: newOverride.id,
      entityName: `${newOverride.date} - ${newOverride.overrideType}`,
      details: `Created schedule override for doctor ${newOverride.doctorId}: ${newOverride.publicReason}`
    });

    return c.json(
      {
        success: true,
        message: 'Schedule override created successfully',
        data: newOverride
      },
      201
    );
  },

  deleteOverride: async (c: Context) => {
    const id = c.req.param('id');
    const user = c.get('user') as JWTPayload | undefined;

    const index = memoryStore.overrides.findIndex(o => o.id === id);
    if (index === -1) {
      return c.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Override ${id} does not exist`
          }
        },
        404
      );
    }

    const deleted = memoryStore.overrides.splice(index, 1)[0];

    memoryStore.auditLogs.unshift({
      id: `LOG-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      actorId: user?.sub || 'SYSTEM',
      actorName: user?.name || 'Anonymous',
      action: 'Delete',
      entityType: 'ScheduleOverride',
      entityId: id || '',
      entityName: `${deleted.date} - ${deleted.overrideType}`,
      details: `Removed schedule override`
    });

    return c.json({
      success: true,
      message: 'Schedule override deleted successfully'
    });
  }
};
