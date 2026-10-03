import type { Context } from 'hono';
import { db, memoryStore } from '../db/index.js';
import * as schema from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { CreateDoctorInput, UpdateDoctorInput, DoctorQueryParams } from '../validators/doctorValidator.js';
import {
  DoctorRecord,
  EstablishmentRecord,
  ScheduleRecord,
  ScheduleOverrideRecord,
  JWTPayload
} from '../types/index.js';

export const doctorController = {
  getDoctors: async (c: Context) => {
    const query = c.req.query() as unknown as DoctorQueryParams;
    const { search, specialty, verificationStatus, establishmentId } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    let list: DoctorRecord[];
    if (db) {
      try {
        const rows = await db.select().from(schema.doctors);
        list = rows as DoctorRecord[];
      } catch {
        list = [...memoryStore.doctors];
      }
    } else {
      list = [...memoryStore.doctors];
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        d =>
          d.fullName.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q) ||
          d.registrationNumber.toLowerCase().includes(q) ||
          d.qualifications.toLowerCase().includes(q)
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

    const total = list.length;
    const startIndex = (page - 1) * limit;
    const items = list.slice(startIndex, startIndex + limit);

    return c.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  },

  getDoctorById: async (c: Context) => {
    const id = c.req.param('id') as string;
    if (!id) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Doctor ID is required' } }, 404);
    }
    let doctor: DoctorRecord | undefined;
    let establishmentsList = memoryStore.establishments;
    let schedulesList = memoryStore.schedules;
    let overridesList = memoryStore.overrides;

    if (db) {
      try {
        const [docs, ests, schs, ovrs] = await Promise.all([
          db.select().from(schema.doctors).where(eq(schema.doctors.id, id)),
          db.select().from(schema.establishments),
          db.select().from(schema.schedules).where(eq(schema.schedules.doctorId, id)),
          db.select().from(schema.scheduleOverrides).where(eq(schema.scheduleOverrides.doctorId, id))
        ]);
        doctor = docs[0] as DoctorRecord | undefined;
        establishmentsList = ests as EstablishmentRecord[];
        schedulesList = schs as ScheduleRecord[];
        overridesList = ovrs as ScheduleOverrideRecord[];
      } catch {
        doctor = memoryStore.doctors.find(d => d.id === id);
      }
    } else {
      doctor = memoryStore.doctors.find(d => d.id === id);
    }

    if (!doctor) {
      return c.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Doctor record with ID ${id} was not found`
          }
        },
        404
      );
    }

    const affiliatedEstablishments = establishmentsList.filter(e =>
      doctor.affiliatedEstablishmentIds.includes(e.id)
    );

    const schedules = schedulesList.filter(s => s.doctorId === doctor.id);
    const overrides = overridesList.filter(o => o.doctorId === doctor.id);

    return c.json({
      success: true,
      data: {
        ...doctor,
        affiliatedEstablishments,
        schedules,
        overrides
      }
    });
  },

  createDoctor: async (c: Context) => {
    const data: CreateDoctorInput = await c.req.json();
    const currentUser = c.get('user') as JWTPayload | undefined;

    const newDoctor = {
      ...data,
      id: `DOC-WB-${Date.now().toString().slice(-4)}`,
      council: data.council || 'West Bengal Medical Council',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastUpdated: new Date().toISOString()
    };

    memoryStore.doctors.unshift(newDoctor);

    memoryStore.auditLogs.unshift({
      id: `LOG-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser?.sub || 'SYSTEM',
      actorName: currentUser?.name || 'Admin',
      action: 'Created Doctor Record',
      entityType: 'Doctor',
      entityId: newDoctor.id,
      entityName: newDoctor.fullName,
      details: `Specialty: ${newDoctor.specialty}, Reg: ${newDoctor.registrationNumber}`
    });

    return c.json(
      {
        success: true,
        data: newDoctor
      },
      201
    );
  },

  updateDoctor: async (c: Context) => {
    const id = c.req.param('id');
    const updates: UpdateDoctorInput = await c.req.json();
    const currentUser = c.get('user') as JWTPayload | undefined;

    const index = memoryStore.doctors.findIndex(d => d.id === id);
    if (index === -1) {
      return c.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Doctor record with ID ${id} was not found`
          }
        },
        404
      );
    }

    const existing = memoryStore.doctors[index];
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
      lastUpdated: new Date().toISOString()
    };

    memoryStore.doctors[index] = updated;

    memoryStore.auditLogs.unshift({
      id: `LOG-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser?.sub || 'SYSTEM',
      actorName: currentUser?.name || 'Admin',
      action: 'Updated Doctor Profile',
      entityType: 'Doctor',
      entityId: id || '',
      entityName: updated.fullName,
      details: `Updated fields: ${Object.keys(updates).join(', ')}`
    });

    return c.json({
      success: true,
      data: updated
    });
  },

  deleteDoctor: async (c: Context) => {
    const id = c.req.param('id');
    const currentUser = c.get('user') as JWTPayload | undefined;

    const index = memoryStore.doctors.findIndex(d => d.id === id);
    if (index === -1) {
      return c.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Doctor record with ID ${id} was not found`
          }
        },
        404
      );
    }

    const removed = memoryStore.doctors.splice(index, 1)[0];

    memoryStore.auditLogs.unshift({
      id: `LOG-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser?.sub || 'SYSTEM',
      actorName: currentUser?.name || 'Admin',
      action: 'Deleted Doctor Record',
      entityType: 'Doctor',
      entityId: id || '',
      entityName: removed.fullName,
      details: `Deleted doctor ${removed.fullName} (${removed.registrationNumber})`
    });

    return c.json({
      success: true,
      message: `Doctor ${removed.fullName} successfully removed`
    });
  }
};
