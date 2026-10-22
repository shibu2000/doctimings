import { KNOWN_TOWNS } from '../data/knownTowns.js';

const MATCH_RADIUS_KM = 6;

export interface TownEstablishment {
  id: string;
  name: string;
  address: string;
  district: string;
  subDistrict: string;
  latitude: number;
  longitude: number;
}

export interface Town {
  id: string;
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  establishmentIds: string[];
}

export const calculateHaversineDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
};

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const round6 = (value: number) => Math.round(value * 1e6) / 1e6;

export const groupTowns = (establishments: TownEstablishment[]): Town[] => {
  const buckets = new Map<string, Town & { points: { latitude: number; longitude: number }[]; known: boolean }>();
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

  return [...buckets.values()].map(({ points, known, ...town }) => {
    if (known) return town;
    const centroid = (key: 'latitude' | 'longitude') => round6(points.reduce((sum, p) => sum + p[key], 0) / points.length);
    return { ...town, latitude: centroid('latitude'), longitude: centroid('longitude') };
  });
};

export const findTown = (establishments: TownEstablishment[], townId: string): Town | null => {
  const grouped = groupTowns(establishments).find(t => t.id === townId);
  if (grouped) return grouped;
  const known = KNOWN_TOWNS.find(t => t.id === townId);
  return known ? { ...known, establishmentIds: [] } : null;
};
