import type { Context } from 'hono';
import { gte } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import * as schema from '../db/schema.js';
import { SearchQueryParams } from '../validators/searchValidator.js';
import { sessionsOnDate } from '../lib/availability.js';
import { validQuery } from '../lib/http.js';
import { isPubliclyListed } from '../lib/access.js';
import { DAYS, Day, formatTo12Hour, istNow, nextDateFor } from '../lib/time.js';

export const calculateHaversineDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
};

const asDay = (value?: string): Day | undefined =>
  DAYS.find(d => d.toLowerCase() === value?.toLowerCase());

export const searchController = {
  searchDoctors: async (c: Context) => {
    const query = validQuery<SearchQueryParams>(c);
    const q = query.q?.toLowerCase().trim() ?? '';
    const { latitude: lat, longitude: lon, specialty, page, limit } = query;
    const availableOnly = query.availableOnly === 'true';

    const today = istNow();
    const targetDay = asDay(query.dayOfWeek) ?? today.dayOfWeek;
    const targetDate = targetDay === today.dayOfWeek ? today.date : nextDateFor(targetDay, today.date);

    const db = getDb();
    const [doctorsList, establishmentsList, schedulesList, overridesList] = await Promise.all([
      db.select().from(schema.doctors),
      db.select().from(schema.establishments),
      db.select().from(schema.schedules),
      db.select().from(schema.scheduleOverrides).where(gte(schema.scheduleOverrides.date, today.date))
    ]);
    const establishmentMap = new Map(establishmentsList.filter(e => e.isActive).map(e => [e.id, e]));

    let candidates = doctorsList.filter(isPubliclyListed);

    if (q) {
      candidates = candidates.filter(doc => {
        if ([doc.fullName, doc.specialty, doc.qualifications, doc.registrationNumber].some(v => v.toLowerCase().includes(q))) {
          return true;
        }
        return doc.affiliatedEstablishmentIds.some(id => {
          const e = establishmentMap.get(id);
          return e && [e.name, e.district, e.subDistrict, e.pinCode, e.address].some(v => v.toLowerCase().includes(q));
        });
      });
    }

    if (specialty && specialty !== 'All') {
      const wanted = specialty.toLowerCase();
      candidates = candidates.filter(d => d.specialty.toLowerCase().startsWith(wanted));
    }

    let enriched = candidates.map(doctor => {
      const affiliatedEsts = doctor.affiliatedEstablishmentIds
        .map(id => establishmentMap.get(id))
        .filter((e): e is NonNullable<typeof e> => Boolean(e));

      let distanceKm: number | undefined;
      let primaryEstablishment = affiliatedEsts[0] ?? null;
      if (lat !== undefined && lon !== undefined) {
        for (const est of affiliatedEsts) {
          const d = calculateHaversineDistanceKm(lat, lon, est.latitude, est.longitude);
          if (distanceKm === undefined || d < distanceKm) {
            distanceKm = d;
            primaryEstablishment = est;
          }
        }
      }

      const schedules = schedulesList.filter(s => s.doctorId === doctor.id && s.isActive);
      const overrides = overridesList.filter(o => o.doctorId === doctor.id).map(({ internalNote: _, ...o }) => o);
      const day = sessionsOnDate(targetDate, schedules, overridesList.filter(o => o.doctorId === doctor.id));

      return {
        ...doctor,
        distanceKm,
        primaryEstablishment,
        affiliatedEstablishments: affiliatedEsts,
        schedules,
        overrides,
        todayAvailability: {
          isAvailable: day.sessions.length > 0,
          status: day.sessions.length
            ? 'available'
            : day.hadRegularSessions
              ? 'cancelled'
              : schedules.length
                ? 'not_today'
                : 'no_schedule',
          day: targetDay,
          date: targetDate,
          shifts: day.sessions.map(s => {
            const place = affiliatedEsts.length > 1 ? `, ${establishmentMap.get(s.establishmentId)?.name ?? ''}` : '';
            return `${formatTo12Hour(s.startTime)} – ${formatTo12Hour(s.endTime)} (${s.shiftName}${place})`;
          }),
          note: day.notes.join(' · ')
        }
      };
    });

    let radiusKm = query.radiusKm;
    let autoExpanded = false;

    if (lat !== undefined && lon !== undefined) {
      const within = (r: number) => enriched.filter(d => d.distanceKm !== undefined && d.distanceKm <= r);
      let filtered = within(radiusKm);
      const expanded = Math.min(radiusKm * 3, 100);
      if (filtered.length === 0 && expanded > radiusKm) {
        radiusKm = expanded;
        filtered = within(radiusKm);
        autoExpanded = true;
      }
      enriched = filtered.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    }

    if (availableOnly) {
      enriched = enriched.filter(d => d.todayAvailability.isAvailable);
    }

    const total = enriched.length;
    return c.json({
      success: true,
      data: enriched.slice((page - 1) * limit, page * limit),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      searchMeta: {
        query: q || null,
        specialty: specialty || null,
        coordinates: lat !== undefined && lon !== undefined ? { latitude: lat, longitude: lon } : null,
        appliedRadiusKm: radiusKm,
        autoExpandedRadius: autoExpanded,
        targetDay,
        targetDate
      }
    });
  }
};
