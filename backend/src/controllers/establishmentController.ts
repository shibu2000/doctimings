import type { Context } from 'hono';
import { db, memoryStore } from '../db/index.js';
import * as schema from '../db/schema.js';
import { eq } from 'drizzle-orm';
import {
  CreateEstablishmentInput,
  UpdateEstablishmentInput,
  EstablishmentQueryParams,
  CreateLocationInput
} from '../validators/establishmentValidator.js';
import {
  EstablishmentRecord,
  PracticeLocationRecord,
  DoctorRecord,
  ScheduleRecord,
  JWTPayload
} from '../types/index.js';

export const establishmentController = {
  getEstablishments: async (c: Context) => {
    const query = c.req.query() as unknown as EstablishmentQueryParams;
    const { search, type, district, verificationStatus, accountStatus } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    let list: EstablishmentRecord[];
    let locationsList = memoryStore.practiceLocations;
    let doctorsList = memoryStore.doctors;

    if (db) {
      try {
        const [ests, locs, docs] = await Promise.all([
          db.select().from(schema.establishments),
          db.select().from(schema.practiceLocations),
          db.select().from(schema.doctors)
        ]);
        list = ests as EstablishmentRecord[];
        locationsList = locs as PracticeLocationRecord[];
        doctorsList = docs as DoctorRecord[];
      } catch {
        list = [...memoryStore.establishments];
      }
    } else {
      list = [...memoryStore.establishments];
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        e =>
          e.name.toLowerCase().includes(q) ||
          e.district.toLowerCase().includes(q) ||
          e.subDistrict.toLowerCase().includes(q) ||
          e.address.toLowerCase().includes(q) ||
          e.pinCode.includes(q)
      );
    }

    if (type && type !== 'All') {
      list = list.filter(e => e.type.toLowerCase() === type.toLowerCase());
    }

    if (district && district !== 'All') {
      list = list.filter(e => e.district.toLowerCase() === district.toLowerCase());
    }

    if (verificationStatus && verificationStatus !== 'All') {
      list = list.filter(e => e.verificationStatus.toLowerCase() === verificationStatus.toLowerCase());
    }

    if (accountStatus && accountStatus !== 'All') {
      list = list.filter(e => e.accountStatus.toLowerCase() === accountStatus.toLowerCase());
    }

    const total = list.length;
    const startIndex = (page - 1) * limit;
    const items = list.slice(startIndex, startIndex + limit).map(est => {
      const locations = locationsList.filter(l => l.establishmentId === est.id);
      const docCount = doctorsList.filter(d =>
        d.affiliatedEstablishmentIds.includes(est.id)
      ).length;
      return {
        ...est,
        practiceLocations: locations,
        doctorCount: docCount
      };
    });

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

  getEstablishmentById: async (c: Context) => {
    const id = c.req.param('id') as string;
    if (!id) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Establishment ID is required' } }, 404);
    }
    let establishment: EstablishmentRecord | undefined;
    let practiceLocations = memoryStore.practiceLocations.filter(p => p.establishmentId === id);
    let doctors = memoryStore.doctors.filter(d => d.affiliatedEstablishmentIds.includes(id));
    let schedules = memoryStore.schedules.filter(s => s.establishmentId === id);

    if (db) {
      try {
        const [ests, locs, docs, schs] = await Promise.all([
          db.select().from(schema.establishments).where(eq(schema.establishments.id, id)),
          db.select().from(schema.practiceLocations).where(eq(schema.practiceLocations.establishmentId, id)),
          db.select().from(schema.doctors),
          db.select().from(schema.schedules).where(eq(schema.schedules.establishmentId, id))
        ]);
        establishment = ests[0] as EstablishmentRecord | undefined;
        practiceLocations = locs as PracticeLocationRecord[];
        doctors = (docs as DoctorRecord[]).filter(d => d.affiliatedEstablishmentIds.includes(id));
        schedules = schs as ScheduleRecord[];
      } catch {
        establishment = memoryStore.establishments.find(e => e.id === id);
      }
    } else {
      establishment = memoryStore.establishments.find(e => e.id === id);
    }

    if (!establishment) {
      return c.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Establishment with ID ${id} was not found`
          }
        },
        404
      );
    }

    return c.json({
      success: true,
      data: {
        ...establishment,
        doctorCount: doctors.length,
        practiceLocations,
        doctors,
        schedules
      }
    });
  },

  createEstablishment: async (c: Context) => {
    const data: CreateEstablishmentInput = await c.req.json();
    const currentUser = c.get('user') as JWTPayload | undefined;

    const newEst = {
      ...data,
      id: `EST-WB-${Date.now().toString().slice(-4)}`,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastUpdated: new Date().toISOString()
    };

    memoryStore.establishments.unshift(newEst);

    memoryStore.practiceLocations.push({
      id: `LOC-${newEst.id}-1`,
      establishmentId: newEst.id,
      name: 'Main Chamber / OPD 1',
      roomDesignation: 'Chamber 1 (Ground Floor)',
      floor: 'Ground Floor',
      isActive: true
    });

    memoryStore.auditLogs.unshift({
      id: `LOG-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser?.sub || 'SYSTEM',
      actorName: currentUser?.name || 'Admin',
      action: 'Created Establishment',
      entityType: 'Establishment',
      entityId: newEst.id,
      entityName: newEst.name,
      details: `Type: ${newEst.type}, District: ${newEst.district}, Pin: ${newEst.pinCode}`
    });

    return c.json(
      {
        success: true,
        data: newEst
      },
      201
    );
  },

  updateEstablishment: async (c: Context) => {
    const id = c.req.param('id');
    const updates: UpdateEstablishmentInput = await c.req.json();
    const currentUser = c.get('user') as JWTPayload | undefined;

    const index = memoryStore.establishments.findIndex(e => e.id === id);
    if (index === -1) {
      return c.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Establishment with ID ${id} was not found`
          }
        },
        404
      );
    }

    const existing = memoryStore.establishments[index];
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
      lastUpdated: new Date().toISOString()
    };

    memoryStore.establishments[index] = updated;

    memoryStore.auditLogs.unshift({
      id: `LOG-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser?.sub || 'SYSTEM',
      actorName: currentUser?.name || 'Admin',
      action: 'Updated Establishment',
      entityType: 'Establishment',
      entityId: id || '',
      entityName: updated.name,
      details: `Modified fields: ${Object.keys(updates).join(', ')}`
    });

    return c.json({
      success: true,
      data: updated
    });
  },

  addPracticeLocation: async (c: Context) => {
    const data: CreateLocationInput = await c.req.json();
    const est = memoryStore.establishments.find(e => e.id === data.establishmentId);

    if (!est) {
      return c.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Parent establishment with ID ${data.establishmentId} not found`
          }
        },
        404
      );
    }

    const newLoc = {
      id: `LOC-${est.id}-${Date.now().toString().slice(-4)}`,
      establishmentId: data.establishmentId,
      name: data.name,
      roomDesignation: data.roomDesignation,
      floor: data.floor || 'Ground Floor',
      isActive: true
    };

    memoryStore.practiceLocations.push(newLoc);

    return c.json(
      {
        success: true,
        data: newLoc
      },
      201
    );
  },

  getPracticeLocations: async (c: Context) => {
    const establishmentId = c.req.param('id') as string;
    if (!establishmentId) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Establishment ID is required' } }, 404);
    }
    let locations: PracticeLocationRecord[];
    if (db) {
      try {
        const rows = await db.select().from(schema.practiceLocations).where(eq(schema.practiceLocations.establishmentId, establishmentId));
        locations = rows as PracticeLocationRecord[];
      } catch {
        locations = memoryStore.practiceLocations.filter(p => p.establishmentId === establishmentId);
      }
    } else {
      locations = memoryStore.practiceLocations.filter(p => p.establishmentId === establishmentId);
    }
    return c.json({
      success: true,
      data: locations,
      total: locations.length
    });
  }
};
