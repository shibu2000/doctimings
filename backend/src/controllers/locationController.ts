import type { Context } from 'hono';
import { eq } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import * as schema from '../db/schema.js';
import { KNOWN_TOWNS } from '../data/knownTowns.js';
import { groupTowns } from '../lib/towns.js';

const DEFAULT_TOWN_ID = 'medinipur-sadar';

export const locationController = {
  getTowns: async (c: Context) => {
    const db = getDb();
    const [establishments, doctors] = await Promise.all([
      db.select().from(schema.establishments).where(eq(schema.establishments.isActive, true)),
      db
        .select({ id: schema.doctors.id, establishmentIds: schema.doctors.affiliatedEstablishmentIds })
        .from(schema.doctors)
        .where(eq(schema.doctors.isActive, true))
    ]);

    const towns = groupTowns(establishments)
      .map(({ establishmentIds, ...town }) => {
        const ids = new Set(establishmentIds);
        return {
          ...town,
          establishmentCount: establishmentIds.length,
          doctorCount: doctors.filter(d => d.establishmentIds.some(id => ids.has(id))).length
        };
      })
      .sort((a, b) => b.doctorCount - a.doctorCount || a.name.localeCompare(b.name));

    const fallback = KNOWN_TOWNS.find(t => t.id === DEFAULT_TOWN_ID)!;
    const defaultLocation = { id: fallback.id, name: 'Medinipur', district: fallback.district, latitude: fallback.latitude, longitude: fallback.longitude };

    return c.json({ success: true, data: towns, defaultLocation });
  }
};
