import type { Context } from 'hono';
import { eq } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import * as schema from '../db/schema.js';
import { KNOWN_TOWNS } from '../data/knownTowns.js';
import { calculateHaversineDistanceKm, groupTowns } from '../lib/towns.js';

const DEFAULT_TOWN_ID = 'medinipur-sadar';
const APPROX_MATCH_RADIUS_KM = 40;

interface RequestGeo {
  latitude?: string;
  longitude?: string;
  city?: string;
  region?: string;
  country?: string;
}

const loadTowns = async () => {
  const db = getDb();
  const [establishments, doctors] = await Promise.all([
    db.select().from(schema.establishments).where(eq(schema.establishments.isActive, true)),
    db
      .select({ id: schema.doctors.id, establishmentIds: schema.doctors.affiliatedEstablishmentIds })
      .from(schema.doctors)
      .where(eq(schema.doctors.isActive, true))
  ]);

  return groupTowns(establishments)
    .map(({ establishmentIds, ...town }) => {
      const ids = new Set(establishmentIds);
      return {
        ...town,
        establishmentCount: establishmentIds.length,
        doctorCount: doctors.filter(d => d.establishmentIds.some(id => ids.has(id))).length
      };
    })
    .sort((a, b) => b.doctorCount - a.doctorCount || a.name.localeCompare(b.name));
};

export const locationController = {
  getTowns: async (c: Context) => {
    const towns = await loadTowns();
    const fallback = KNOWN_TOWNS.find(t => t.id === DEFAULT_TOWN_ID)!;
    const defaultLocation = { id: fallback.id, name: 'Medinipur', district: fallback.district, latitude: fallback.latitude, longitude: fallback.longitude };

    return c.json({ success: true, data: towns, defaultLocation });
  },

  getApproxLocation: async (c: Context) => {
    c.header('Cache-Control', 'private, no-store');
    const geo = (c.req.raw as Request & { cf?: RequestGeo }).cf;
    const latitude = Number(geo?.latitude);
    const longitude = Number(geo?.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return c.json({ success: true, data: null });
    }

    const nearest = (await loadTowns())
      .filter(town => town.doctorCount > 0)
      .map(town => ({ town, km: calculateHaversineDistanceKm(latitude, longitude, town.latitude, town.longitude) }))
      .sort((a, b) => a.km - b.km)[0];

    if (!nearest || nearest.km > APPROX_MATCH_RADIUS_KM) {
      return c.json({ success: true, data: null });
    }

    const { id, name, district } = nearest.town;
    return c.json({
      success: true,
      data: {
        town: { id, name, district, latitude: nearest.town.latitude, longitude: nearest.town.longitude },
        distanceKm: nearest.km,
        networkCity: geo?.city ?? null
      }
    });
  }
};
