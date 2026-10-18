import type { Context } from 'hono';
import { and, eq, inArray } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import * as schema from '../db/schema.js';
import {
  CreateEstablishmentInput,
  UpdateEstablishmentInput,
  EstablishmentQueryParams,
  CreateLocationInput,
  UpdateLocationInput
} from '../validators/establishmentValidator.js';
import { recordAudit } from '../lib/audit.js';
import { currentUser, fail, newId, notFound, paginate, validBody, validQuery } from '../lib/http.js';
import { accessIfSignedIn, canManageEstablishment, canSeeDoctor, getAccess } from '../lib/access.js';

const PLATFORM_ONLY_FIELDS = ['verificationStatus', 'accountStatus', 'isActive'];

const guard = async (c: Context, establishmentId: string) =>
  canManageEstablishment(await getAccess(c), establishmentId)
    ? null
    : fail(c, 403, 'FORBIDDEN', 'You can only manage your own establishments');

const findEstablishment = async (id: string) => {
  const [establishment] = await getDb().select().from(schema.establishments).where(eq(schema.establishments.id, id));
  return establishment;
};

const findLocation = async (establishmentId: string, locationId: string) => {
  const [location] = await getDb()
    .select()
    .from(schema.practiceLocations)
    .where(and(eq(schema.practiceLocations.id, locationId), eq(schema.practiceLocations.establishmentId, establishmentId)));
  return location;
};

export const establishmentController = {
  getEstablishments: async (c: Context) => {
    const { search, type, district, verificationStatus, accountStatus, page, limit } = validQuery<EstablishmentQueryParams>(c);
    const db = getDb();
    const [establishments, locations, doctors] = await Promise.all([
      db.select().from(schema.establishments).orderBy(schema.establishments.name),
      db.select().from(schema.practiceLocations),
      db.select({ ids: schema.doctors.affiliatedEstablishmentIds }).from(schema.doctors)
    ]);

    const viewer = await accessIfSignedIn(c);
    let list = establishments.filter(e => e.isActive || (viewer && canManageEstablishment(viewer, e.id)));
    const term = (search || '').toLowerCase().trim();
    if (term) {
      list = list.filter(e =>
        [e.name, e.district, e.subDistrict, e.address, e.pinCode].some(v => v.toLowerCase().includes(term))
      );
    }
    const matches = (value: string, filter?: string) =>
      !filter || filter === 'All' || value.toLowerCase() === filter.toLowerCase();
    list = list.filter(
      e =>
        matches(e.type, type) &&
        matches(e.district, district) &&
        matches(e.verificationStatus, verificationStatus) &&
        matches(e.accountStatus, accountStatus)
    );

    const page$ = paginate(list, page, limit);
    const data = page$.data.map(e => ({
      ...e,
      practiceLocations: locations.filter(l => l.establishmentId === e.id),
      doctorCount: doctors.filter(d => d.ids.includes(e.id)).length
    }));

    return c.json({ success: true, data, pagination: page$.pagination });
  },

  getEstablishmentById: async (c: Context) => {
    const id = c.req.param('id')!;
    const db = getDb();
    const establishment = await findEstablishment(id);
    const viewer = await accessIfSignedIn(c);
    if (!establishment || (!establishment.isActive && !(viewer && canManageEstablishment(viewer, id)))) {
      return notFound(c, `Establishment ${id} was not found`);
    }

    const [practiceLocations, allDoctors, schedules] = await Promise.all([
      db.select().from(schema.practiceLocations).where(eq(schema.practiceLocations.establishmentId, id)),
      db.select().from(schema.doctors),
      db.select().from(schema.schedules).where(eq(schema.schedules.establishmentId, id))
    ]);
    const doctors = allDoctors.filter(d => d.affiliatedEstablishmentIds.includes(id) && canSeeDoctor(viewer, d));

    return c.json({
      success: true,
      data: { ...establishment, doctorCount: doctors.length, practiceLocations, doctors, schedules }
    });
  },

  createEstablishment: async (c: Context) => {
    const data = validBody<CreateEstablishmentInput>(c);
    const db = getDb();
    const id = newId('EST');

    const [establishment] = await db.insert(schema.establishments).values({ ...data, id }).returning();
    const [location] = await db
      .insert(schema.practiceLocations)
      .values({ id: newId('LOC'), establishmentId: id, name: 'Main chamber', roomDesignation: 'Main chamber', floor: 'Ground Floor' })
      .returning();

    await recordAudit(db, currentUser(c), {
      action: 'Created establishment',
      entityType: 'Establishment',
      entityId: id,
      entityName: establishment.name,
      details: `${establishment.type}, ${establishment.district} ${establishment.pinCode}`
    });

    return c.json({ success: true, data: { ...establishment, practiceLocations: [location], doctorCount: 0 } }, 201);
  },

  updateEstablishment: async (c: Context) => {
    const id = c.req.param('id')!;
    const body = validBody<UpdateEstablishmentInput>(c);
    const db = getDb();
    if (!(await findEstablishment(id))) return notFound(c, `Establishment ${id} was not found`);
    const denied = await guard(c, id);
    if (denied) return denied;
    const updates = (await getAccess(c)).platform
      ? body
      : Object.fromEntries(Object.entries(body).filter(([key]) => !PLATFORM_ONLY_FIELDS.includes(key)));

    const [establishment] = await db
      .update(schema.establishments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.establishments.id, id))
      .returning();

    const fields = Object.keys(updates);
    await recordAudit(db, currentUser(c), {
      action: fields.length ? 'Updated establishment' : 'Confirmed establishment details',
      entityType: 'Establishment',
      entityId: id,
      entityName: establishment.name,
      details: fields.length ? `Changed: ${fields.join(', ')}` : 'Marked as checked'
    });

    return c.json({ success: true, data: establishment });
  },

  deleteEstablishment: async (c: Context) => {
    const id = c.req.param('id')!;
    const db = getDb();
    const establishment = await findEstablishment(id);
    if (!establishment) return notFound(c, `Establishment ${id} was not found`);

    const linked = (await db.select().from(schema.doctors)).filter(d => d.affiliatedEstablishmentIds.includes(id));
    for (const doctor of linked) {
      await db
        .update(schema.doctors)
        .set({ affiliatedEstablishmentIds: doctor.affiliatedEstablishmentIds.filter(e => e !== id), updatedAt: new Date() })
        .where(eq(schema.doctors.id, doctor.id));
    }
    await db.delete(schema.establishments).where(eq(schema.establishments.id, id));

    await recordAudit(db, currentUser(c), {
      action: 'Deleted establishment',
      entityType: 'Establishment',
      entityId: id,
      entityName: establishment.name,
      details: `${linked.length} doctor link(s) removed`
    });

    return c.json({ success: true, message: `${establishment.name} was removed` });
  },

  getPracticeLocations: async (c: Context) => {
    const establishmentId = c.req.param('id')!;
    const locations = await getDb()
      .select()
      .from(schema.practiceLocations)
      .where(eq(schema.practiceLocations.establishmentId, establishmentId));
    return c.json({ success: true, data: locations, total: locations.length });
  },

  addPracticeLocation: async (c: Context) => {
    const establishmentId = c.req.param('id')!;
    const data = validBody<CreateLocationInput>(c);
    const db = getDb();
    const establishment = await findEstablishment(establishmentId);
    if (!establishment) return notFound(c, `Establishment ${establishmentId} was not found`);
    const denied = await guard(c, establishmentId);
    if (denied) return denied;

    const [location] = await db
      .insert(schema.practiceLocations)
      .values({
        id: newId('LOC'),
        establishmentId,
        name: data.name,
        roomDesignation: data.roomDesignation || data.name,
        floor: data.floor
      })
      .returning();

    await recordAudit(db, currentUser(c), {
      action: 'Added room',
      entityType: 'Establishment',
      entityId: establishmentId,
      entityName: establishment.name,
      details: location.name
    });

    return c.json({ success: true, data: location }, 201);
  },

  updatePracticeLocation: async (c: Context) => {
    const establishmentId = c.req.param('id')!;
    const locationId = c.req.param('locationId')!;
    const updates = validBody<UpdateLocationInput>(c);
    const db = getDb();
    if (!(await findLocation(establishmentId, locationId))) return notFound(c, 'Room was not found');
    const denied = await guard(c, establishmentId);
    if (denied) return denied;

    const [location] = await db
      .update(schema.practiceLocations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.practiceLocations.id, locationId))
      .returning();
    if (updates.roomDesignation !== undefined || updates.name !== undefined) {
      await db
        .update(schema.schedules)
        .set({ roomNumber: location.roomDesignation, updatedAt: new Date() })
        .where(eq(schema.schedules.practiceLocationId, locationId));
    }

    return c.json({ success: true, data: location });
  },

  deletePracticeLocation: async (c: Context) => {
    const establishmentId = c.req.param('id')!;
    const locationId = c.req.param('locationId')!;
    const db = getDb();
    const location = await findLocation(establishmentId, locationId);
    if (!location) return notFound(c, 'Room was not found');
    const denied = await guard(c, establishmentId);
    if (denied) return denied;

    const others = await db
      .select()
      .from(schema.practiceLocations)
      .where(eq(schema.practiceLocations.establishmentId, establishmentId));
    const fallback = others.find(l => l.id !== locationId);
    await db
      .update(schema.schedules)
      .set({ practiceLocationId: fallback?.id ?? '', roomNumber: fallback?.roomDesignation ?? '', updatedAt: new Date() })
      .where(
        and(eq(schema.schedules.establishmentId, establishmentId), inArray(schema.schedules.practiceLocationId, [locationId]))
      );
    await db.delete(schema.practiceLocations).where(eq(schema.practiceLocations.id, locationId));

    return c.json({ success: true, message: 'Room removed' });
  }
};
