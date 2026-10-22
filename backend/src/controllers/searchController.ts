import type { Context } from 'hono';
import { gte } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import * as schema from '../db/schema.js';
import { SearchQueryParams } from '../validators/searchValidator.js';
import { sessionsOnDate } from '../lib/availability.js';
import { validQuery } from '../lib/http.js';
import { isPubliclyListed } from '../lib/access.js';
import { DAYS, Day, formatTo12Hour, istNow, nextDateFor } from '../lib/time.js';
import { calculateHaversineDistanceKm, findTown } from '../lib/towns.js';

const asDay = (value?: string): Day | undefined =>
  DAYS.find(d => d.toLowerCase() === value?.toLowerCase());

export const searchController = {
  searchDoctors: async (c: Context) => {
    const query = validQuery<SearchQueryParams>(c);
    const q = query.q?.toLowerCase().trim() ?? '';
    const { specialty, townId, page, limit } = query;
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
    const activeEstablishments = establishmentsList.filter(e => e.isActive);
    const establishmentMap = new Map(activeEstablishments.map(e => [e.id, e]));
    const town = townId ? findTown(activeEstablishments, townId) : null;
    const townEstablishmentIds = new Set(town?.establishmentIds);
    const lat = query.latitude ?? town?.latitude;
    const lon = query.longitude ?? town?.longitude;

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
        inTown: town ? affiliatedEsts.some(e => townEstablishmentIds.has(e.id)) : undefined,
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

    if (availableOnly) {
      enriched = enriched.filter(d => d.todayAvailability.isAvailable);
    }

    if (lat !== undefined && lon !== undefined) {
      enriched.sort(
        (a, b) => Number(Boolean(b.inTown)) - Number(Boolean(a.inTown)) || (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
      );
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
        town: town
          ? { id: town.id, name: town.name, district: town.district, doctorCount: enriched.filter(d => d.inTown).length }
          : null,
        targetDay,
        targetDate
      }
    });
  }
};
