import type { Context } from 'hono';
import { eq } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import * as schema from '../db/schema.js';
import { KNOWN_TOWNS } from '../data/knownTowns.js';
import { calculateHaversineDistanceKm } from './searchController.js';

const MATCH_RADIUS_KM = 6;
const DEFAULT_TOWN_ID = 'medinipur-sadar';

interface TownBucket {
  id: string;
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  establishmentIds: string[];
  points: { latitude: number; longitude: number }[];
  known: boolean;
}

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

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

    const buckets = new Map<string, TownBucket>();
    for (const e of establishments) {
      let nearest: { town: (typeof KNOWN_TOWNS)[number]; km: number } | null = null;
      for (const town of KNOWN_TOWNS) {
        const km = calculateHaversineDistanceKm(e.latitude, e.longitude, town.latitude, town.longitude);
        if (km <= MATCH_RADIUS_KM && (!nearest || km < nearest.km)) nearest = { town, km };
      }
      const text = `${e.name} ${e.address}`.toLowerCase();
      const named = nearest ? null : KNOWN_TOWNS.find(t => t.district === e.district && text.includes(t.name.toLowerCase()));
      const town = nearest?.town ?? named;
      const name = town?.name ?? (e.subDistrict || e.district);
      const district = town?.district ?? e.district;
      const id = town?.id ?? slug(`${name}-${district}`);
      const bucket = buckets.get(id) ?? {
        id,
        name,
        district,
        latitude: nearest?.town.latitude ?? 0,
        longitude: nearest?.town.longitude ?? 0,
        establishmentIds: [],
        points: [],
        known: Boolean(nearest)
      };
      bucket.establishmentIds.push(e.id);
      bucket.points.push({ latitude: e.latitude, longitude: e.longitude });
      buckets.set(id, bucket);
    }

    const towns = [...buckets.values()]
      .map(b => {
        const ids = new Set(b.establishmentIds);
        const centroid = (key: 'latitude' | 'longitude') =>
          Math.round((b.points.reduce((sum, p) => sum + p[key], 0) / b.points.length) * 1e6) / 1e6;
        return {
          id: b.id,
          name: b.name,
          district: b.district,
          latitude: b.known ? b.latitude : centroid('latitude'),
          longitude: b.known ? b.longitude : centroid('longitude'),
          establishmentCount: b.establishmentIds.length,
          doctorCount: doctors.filter(d => d.establishmentIds.some(id => ids.has(id))).length
        };
      })
      .sort((a, b) => b.doctorCount - a.doctorCount || a.name.localeCompare(b.name));

    const fallback = KNOWN_TOWNS.find(t => t.id === DEFAULT_TOWN_ID)!;
    const defaultLocation = { id: fallback.id, name: 'Medinipur', district: fallback.district, latitude: fallback.latitude, longitude: fallback.longitude };

    return c.json({ success: true, data: towns, defaultLocation });
  }
};
