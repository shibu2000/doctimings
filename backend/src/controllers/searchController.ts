import type { Context } from 'hono';
import { db, memoryStore } from '../db/index.js';
import * as schema from '../db/schema.js';
import { SearchQueryParams } from '../validators/searchValidator.js';
import {
  DoctorRecord,
  EstablishmentRecord,
  ScheduleRecord,
  ScheduleOverrideRecord
} from '../types/index.js';

const calculateHaversineDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

const getDayName = (date: Date): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

const getISODate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const formatTo12Hour = (timeStr: string): string => {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();
  if (trimmed.includes('AM') || trimmed.includes('PM') || trimmed.includes('am') || trimmed.includes('pm')) {
    return trimmed;
  }
  const parts = trimmed.split(':');
  if (parts.length < 2) return trimmed;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes) || hours > 23 || minutes > 59) return trimmed;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${displayHours}:${displayMinutes} ${period}`;
};

export const searchController = {
  searchDoctors: async (c: Context) => {
    const query = c.req.query() as unknown as SearchQueryParams;
    const q = query.q ? query.q.toLowerCase().trim() : '';
    const lat = query.latitude ? Number(query.latitude) : undefined;
    const lon = query.longitude ? Number(query.longitude) : undefined;
    let radiusKm = query.radiusKm ? Number(query.radiusKm) : 15;
    const specialty = query.specialty;
    const requestedDay = query.dayOfWeek;
    const availableOnly = String(query.availableOnly) === 'true';
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const now = new Date();
    const todayDayName = requestedDay || getDayName(now);
    const todayIsoDate = getISODate(now);

    let doctorsList: DoctorRecord[];
    let establishmentsList: EstablishmentRecord[];
    let schedulesList: ScheduleRecord[];
    let overridesList: ScheduleOverrideRecord[];

    if (db) {
      try {
        const [docs, ests, schs, ovrs] = await Promise.all([
          db.select().from(schema.doctors),
          db.select().from(schema.establishments),
          db.select().from(schema.schedules),
          db.select().from(schema.scheduleOverrides)
        ]);
        doctorsList = docs as DoctorRecord[];
        establishmentsList = ests as EstablishmentRecord[];
        schedulesList = schs as ScheduleRecord[];
        overridesList = ovrs as ScheduleOverrideRecord[];
      } catch {
        doctorsList = memoryStore.doctors;
        establishmentsList = memoryStore.establishments;
        schedulesList = memoryStore.schedules;
        overridesList = memoryStore.overrides;
      }
    } else {
      doctorsList = memoryStore.doctors;
      establishmentsList = memoryStore.establishments;
      schedulesList = memoryStore.schedules;
      overridesList = memoryStore.overrides;
    }

    let candidates = doctorsList.filter(d => d.isActive);

    if (q) {
      candidates = candidates.filter(doc => {
        const matchesDoc =
          doc.fullName.toLowerCase().includes(q) ||
          doc.specialty.toLowerCase().includes(q) ||
          doc.qualifications.toLowerCase().includes(q) ||
          doc.registrationNumber.toLowerCase().includes(q);

        if (matchesDoc) return true;

        const affiliatedEsts = establishmentsList.filter(e =>
          doc.affiliatedEstablishmentIds.includes(e.id)
        );
        return affiliatedEsts.some(
          e =>
            e.name.toLowerCase().includes(q) ||
            e.district.toLowerCase().includes(q) ||
            (e.subDistrict && e.subDistrict.toLowerCase().includes(q)) ||
            (e.pinCode && e.pinCode.includes(q)) ||
            e.address.toLowerCase().includes(q)
        );
      });
    }

    if (specialty && specialty !== 'All') {
      candidates = candidates.filter(
        d => d.specialty.toLowerCase() === specialty.toLowerCase()
      );
    }

    let enriched = candidates.map(doctor => {
      const affiliatedEsts = establishmentsList.filter(e =>
        doctor.affiliatedEstablishmentIds.includes(e.id)
      );

      let minDistance = Infinity;
      let closestEstablishment = affiliatedEsts[0] || null;

      if (lat !== undefined && lon !== undefined) {
        for (const est of affiliatedEsts) {
          const d = calculateHaversineDistanceKm(lat, lon, est.latitude, est.longitude);
          if (d < minDistance) {
            minDistance = d;
            closestEstablishment = est;
          }
        }
      }

      const schedules = schedulesList.filter(s => s.doctorId === doctor.id && s.isActive);
      const todaySchedules = schedules.filter(s => s.dayOfWeek.toLowerCase() === todayDayName.toLowerCase());

      const todayOverride = overridesList.find(
        o => o.doctorId === doctor.id && o.date === todayIsoDate
      );

      let isAvailableToday = todaySchedules.length > 0;
      let availabilityNote = '';

      if (todayOverride) {
        if (todayOverride.overrideType === 'unavailable') {
          isAvailableToday = false;
          availabilityNote = todayOverride.publicReason;
        } else if (todayOverride.overrideType === 'changed') {
          isAvailableToday = true;
          availabilityNote = `Shift modified: ${todayOverride.publicReason}`;
        } else if (todayOverride.overrideType === 'additional') {
          isAvailableToday = true;
          availabilityNote = `Special session: ${todayOverride.publicReason}`;
        }
      }

      return {
        ...doctor,
        distanceKm: minDistance !== Infinity ? minDistance : undefined,
        primaryEstablishment: closestEstablishment,
        affiliatedEstablishments: affiliatedEsts,
        schedules,
        todayAvailability: {
          isAvailable: isAvailableToday,
          day: todayDayName,
          shifts: todaySchedules.map(s => `${formatTo12Hour(s.startTime)} – ${formatTo12Hour(s.endTime)} (${s.shiftName})`),
          note: availabilityNote
        }
      };
    });

    let autoExpanded = false;

    if (lat !== undefined && lon !== undefined) {
      let filteredByRadius = enriched.filter(
        d => d.distanceKm !== undefined && d.distanceKm <= radiusKm
      );

      if (filteredByRadius.length === 0 && enriched.length > 0) {
        radiusKm = Math.min(radiusKm * 3, 100);
        filteredByRadius = enriched.filter(
          d => d.distanceKm !== undefined && d.distanceKm <= radiusKm
        );
        autoExpanded = true;
      }

      enriched = filteredByRadius.sort(
        (a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
      );
    }

    if (availableOnly) {
      enriched = enriched.filter(d => d.todayAvailability.isAvailable);
    }

    const total = enriched.length;
    const startIndex = (page - 1) * limit;
    const pagedItems = enriched.slice(startIndex, startIndex + limit);

    return c.json({
      success: true,
      data: pagedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      searchMeta: {
        query: q || null,
        specialty: specialty || null,
        coordinates: lat !== undefined && lon !== undefined ? { latitude: lat, longitude: lon } : null,
        appliedRadiusKm: radiusKm,
        autoExpandedRadius: autoExpanded,
        targetDay: todayDayName
      }
    });
  }
};
