import { describe, it, expect } from 'vitest';
import { call, staffAuth } from '../helpers.js';
import { addDays, istNow, nextDateFor } from '../../src/lib/time.js';

const today = istNow().date;
const nextMonday = nextDateFor('Monday', addDays(today, 1));
const nextWednesday = nextDateFor('Wednesday', nextMonday);

describe('sittings (doctor at an establishment)', () => {
  it('adds a doctor to a new establishment with timing in one call', async () => {
    const res = await call('PUT', '/doctors/DOC-WB-01/sittings/EST-GHT-01', {
      headers: staffAuth(),
      body: { sessions: [{ dayOfWeek: 'Saturday', startTime: '10:00', endTime: '12:00' }] }
    });
    expect(res.status).toBe(200);
    expect(res.body.data.schedules).toHaveLength(1);

    const doctor = await call('GET', '/doctors/DOC-WB-01');
    expect(doctor.body.data.affiliatedEstablishmentIds).toContain('EST-GHT-01');
  });

  it('replaces weekly timing while keeping untouched sessions', async () => {
    const before = (await call('GET', '/schedules?doctorId=DOC-WB-01&establishmentId=EST-KHP-01')).body.data;
    const monday = before.find((s: { dayOfWeek: string }) => s.dayOfWeek === 'Monday');

    const res = await call('PUT', '/doctors/DOC-WB-01/sittings/EST-KHP-01', {
      headers: staffAuth(),
      body: {
        sessions: [
          { dayOfWeek: 'Monday', startTime: monday.startTime, endTime: monday.endTime, practiceLocationId: monday.practiceLocationId },
          { dayOfWeek: 'Wednesday', startTime: '10:00', endTime: '13:00' }
        ]
      }
    });
    expect(res.status).toBe(200);
    const after = res.body.data.schedules;
    expect(after).toHaveLength(2);
    expect(after.find((s: { id: string }) => s.id === monday.id)).toBeDefined();
    expect(after.find((s: { dayOfWeek: string }) => s.dayOfWeek === 'Wednesday').startTime).toBe('10:00');
  });

  it('marks leave only on days the doctor actually sits', async () => {
    const res = await call('POST', '/doctors/DOC-WB-01/leave', {
      headers: staffAuth(),
      body: { from: nextMonday, to: addDays(nextMonday, 6), establishmentIds: ['EST-KHP-01'], reason: 'On leave' }
    });
    expect(res.status).toBe(201);
    expect(res.body.data.map((o: { date: string }) => o.date).sort()).toEqual([nextMonday, nextWednesday]);

    const repeat = await call('POST', '/doctors/DOC-WB-01/leave', {
      headers: staffAuth(),
      body: { from: nextMonday, to: addDays(nextMonday, 6), establishmentIds: ['EST-KHP-01'], reason: 'On leave' }
    });
    expect(repeat.status).toBe(400);
  });

  it('shows leave and changed hours in search for that day', async () => {
    const monday = await call('GET', '/search?q=Niranjan&dayOfWeek=Monday');
    const mondayDoc = monday.body.data[0];
    if (nextDateFor('Monday', today) === nextMonday) {
      expect(mondayDoc.todayAvailability.isAvailable).toBe(false);
      expect(mondayDoc.todayAvailability.note).toBe('On leave');
    }

    const friday = nextDateFor('Friday', addDays(today, 1));
    const changed = await call('POST', '/schedules/overrides', {
      headers: staffAuth(),
      body: {
        doctorId: 'DOC-WB-01',
        establishmentId: 'EST-KHP-03',
        date: friday,
        overrideType: 'changed',
        newStartTime: '18:30',
        newEndTime: '21:00',
        publicReason: 'Starting late'
      }
    });
    expect(changed.status).toBe(201);
    expect(changed.body.data.dayOfWeek).toBe('Friday');
    expect(changed.body.data.standardShift).toBe('17:30-20:30');

    if (nextDateFor('Friday', today) === friday) {
      const search = await call('GET', '/search?q=Niranjan&dayOfWeek=Friday');
      expect(search.body.data[0].todayAvailability.shifts[0]).toContain('6:30 PM – 9:00 PM');
    }
  });

  it('removes a doctor from an establishment', async () => {
    const res = await call('DELETE', '/doctors/DOC-WB-01/sittings/EST-GHT-01', { headers: staffAuth() });
    expect(res.status).toBe(200);
    const doctor = await call('GET', '/doctors/DOC-WB-01');
    expect(doctor.body.data.affiliatedEstablishmentIds).not.toContain('EST-GHT-01');
    expect(doctor.body.data.schedules.some((s: { establishmentId: string }) => s.establishmentId === 'EST-GHT-01')).toBe(false);
    expect((await call('DELETE', '/doctors/DOC-WB-01/sittings/EST-GHT-01', { headers: staffAuth() })).status).toBe(404);
  });
});
