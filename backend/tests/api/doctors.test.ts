import { describe, it, expect } from 'vitest';
import { adminAuth, call, patientAuth, staffAuth } from '../helpers.js';

const newDoctor = {
  fullName: 'Dr. Test Mondal',
  specialty: 'Pediatrics',
  sittings: [
    {
      establishmentId: 'EST-KHP-01',
      sessions: [
        { dayOfWeek: 'Monday', startTime: '17:00', endTime: '20:00' },
        { dayOfWeek: 'Thursday', startTime: '17:00', endTime: '20:00', practiceLocationId: 'LOC-KHP-01-B' }
      ]
    }
  ]
};

describe('doctors', () => {
  it('lists and filters seeded doctors', async () => {
    const res = await call('GET', '/doctors?limit=100');
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(33);

    const byEstablishment = await call('GET', '/doctors?establishmentId=EST-KHP-01');
    expect(byEstablishment.body.data.some((d: { id: string }) => d.id === 'DOC-WB-01')).toBe(true);
  });

  it('returns a doctor with places, sessions and changes', async () => {
    const res = await call('GET', '/doctors/DOC-WB-01');
    expect(res.status).toBe(200);
    expect(res.body.data.affiliatedEstablishments.map((e: { id: string }) => e.id).sort()).toEqual(['EST-KHP-01', 'EST-KHP-03']);
    expect(res.body.data.schedules).toHaveLength(3);
    expect((await call('GET', '/doctors/DOC-NOPE')).status).toBe(404);
  });

  it('creates a doctor with only a name, specialty and weekly timing', async () => {
    const res = await call('POST', '/doctors', { headers: staffAuth(), body: newDoctor });
    expect(res.status).toBe(201);
    const id = res.body.data.id;
    expect(res.body.data.affiliatedEstablishmentIds).toEqual(['EST-KHP-01']);

    const saved = await call('GET', `/doctors/${id}`);
    const sessions = saved.body.data.schedules;
    expect(sessions).toHaveLength(2);
    expect(sessions.find((s: { dayOfWeek: string }) => s.dayOfWeek === 'Thursday').roomNumber).toBe('Room 3');
    expect(sessions.find((s: { dayOfWeek: string }) => s.dayOfWeek === 'Monday').practiceLocationId).toBe('LOC-KHP-01-A');
    expect(sessions[0].shiftName).toBe('Evening');
  });

  it('accepts the legacy gynecology label and stores the canonical one', async () => {
    const res = await call('POST', '/doctors', {
      headers: staffAuth(),
      body: { fullName: 'Dr. Legacy Label', specialty: 'Gynecology & Obs' }
    });
    expect(res.status).toBe(201);
    expect(res.body.data.specialty).toBe('Gynecology & Obstetrics');
  });

  it('rejects bad input with a readable message', async () => {
    const overlap = await call('POST', '/doctors', {
      headers: staffAuth(),
      body: {
        ...newDoctor,
        sittings: [
          {
            establishmentId: 'EST-KHP-01',
            sessions: [
              { dayOfWeek: 'Monday', startTime: '17:00', endTime: '20:00' },
              { dayOfWeek: 'Monday', startTime: '19:00', endTime: '21:00' }
            ]
          }
        ]
      }
    });
    expect(overlap.status).toBe(400);
    expect(overlap.body.error.message).toContain('overlap on Monday');

    const backwards = await call('POST', '/doctors', {
      headers: staffAuth(),
      body: { ...newDoctor, sittings: [{ establishmentId: 'EST-KHP-01', sessions: [{ dayOfWeek: 'Monday', startTime: '20:00', endTime: '17:00' }] }] }
    });
    expect(backwards.status).toBe(400);
    expect(backwards.body.error.message).toBe('End time must be after start time');

    const ghost = await call('POST', '/doctors', {
      headers: staffAuth(),
      body: { ...newDoctor, sittings: [{ establishmentId: 'EST-GONE', sessions: [] }] }
    });
    expect(ghost.status).toBe(400);
  });

  it('ignores fields that are not part of the doctor profile', async () => {
    const res = await call('PUT', '/doctors/DOC-WB-02', {
      headers: staffAuth(),
      body: { id: 'HIJACKED', qualifications: 'MBBS, MD' }
    });
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('DOC-WB-02');
    expect(res.body.data.qualifications).toBe('MBBS, MD');
  });

  it('records a confirmation when saved without changes', async () => {
    const before = (await call('GET', '/doctors/DOC-WB-03')).body.data.updatedAt;
    await new Promise(r => setTimeout(r, 5));
    const res = await call('PUT', '/doctors/DOC-WB-03', { headers: staffAuth(), body: {} });
    expect(new Date(res.body.data.updatedAt).getTime()).toBeGreaterThan(new Date(before).getTime());
  });

  it('restricts writes by role', async () => {
    expect((await call('POST', '/doctors', { body: newDoctor })).status).toBe(401);
    expect((await call('POST', '/doctors', { headers: patientAuth(), body: newDoctor })).status).toBe(403);
    expect((await call('DELETE', '/doctors/DOC-WB-04', { headers: staffAuth() })).status).toBe(403);
  });

  it('deletes a doctor together with their sessions', async () => {
    const res = await call('DELETE', '/doctors/DOC-WB-04', { headers: adminAuth() });
    expect(res.status).toBe(200);
    expect((await call('GET', '/doctors/DOC-WB-04')).status).toBe(404);
    const schedules = await call('GET', '/schedules?doctorId=DOC-WB-04');
    expect(schedules.body.data).toHaveLength(0);
  });
});
