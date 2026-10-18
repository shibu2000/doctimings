import { describe, it, expect } from 'vitest';
import { adminAuth, call, staffAuth } from '../helpers.js';

const pharmacy = {
  name: 'Maa Tara Pharmacy',
  type: 'Pharmacy',
  district: 'Paschim Medinipur',
  address: 'Station Road, Ghatal',
  pinCode: '721212',
  latitude: 22.66,
  longitude: 87.72
};

describe('establishments', () => {
  it('lists establishments with rooms and doctor counts', async () => {
    const res = await call('GET', '/establishments?limit=100');
    expect(res.body.pagination.total).toBe(38);
    const khirpai = res.body.data.find((e: { id: string }) => e.id === 'EST-KHP-01');
    expect(khirpai.practiceLocations).toHaveLength(2);
    expect(khirpai.doctorCount).toBeGreaterThan(0);
  });

  it('creates an establishment with a default room from the essentials only', async () => {
    const res = await call('POST', '/establishments', { headers: staffAuth(), body: pharmacy });
    expect(res.status).toBe(201);
    expect(res.body.data.practiceLocations[0].name).toBe('Main chamber');

    const bad = await call('POST', '/establishments', { headers: staffAuth(), body: { ...pharmacy, pinCode: '12' } });
    expect(bad.status).toBe(400);
    expect(bad.body.error.message).toBe('Enter a valid 6-digit PIN code');
  });

  it('manages rooms and moves sessions off a removed room', async () => {
    const add = await call('POST', '/establishments/EST-KHP-01/locations', { headers: staffAuth(), body: { name: 'Eye OPD' } });
    expect(add.status).toBe(201);
    expect(add.body.data.roomDesignation).toBe('Eye OPD');

    const renamed = await call('PUT', '/establishments/EST-KHP-01/locations/LOC-KHP-01-B', {
      headers: staffAuth(),
      body: { roomDesignation: 'Room 3A' }
    });
    expect(renamed.body.data.roomDesignation).toBe('Room 3A');

    await call('DELETE', '/establishments/EST-KHP-01/locations/LOC-KHP-01-A', { headers: staffAuth() });
    const sessions = (await call('GET', '/schedules?establishmentId=EST-KHP-01')).body.data;
    expect(sessions.length).toBeGreaterThan(0);
    expect(sessions.every((s: { practiceLocationId: string }) => s.practiceLocationId !== 'LOC-KHP-01-A')).toBe(true);
  });

  it('deletes an establishment and unlinks its doctors', async () => {
    const before = await call('GET', '/doctors?establishmentId=EST-RJB-02');
    expect(before.body.data.length).toBeGreaterThan(0);

    expect((await call('DELETE', '/establishments/EST-RJB-02', { headers: staffAuth() })).status).toBe(403);
    expect((await call('DELETE', '/establishments/EST-RJB-02', { headers: adminAuth() })).status).toBe(200);

    const after = await call('GET', '/doctors?establishmentId=EST-RJB-02');
    expect(after.body.data).toHaveLength(0);
    expect((await call('GET', '/schedules?establishmentId=EST-RJB-02')).body.data).toHaveLength(0);
  });
});
