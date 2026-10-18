import { describe, it, expect } from 'vitest';
import { adminAuth, call, patientAuth, staffAuth } from '../helpers.js';

describe('search', () => {
  it('sorts nearby doctors by distance', async () => {
    const res = await call('GET', '/search?latitude=22.66&longitude=87.72&radiusKm=25');
    expect(res.status).toBe(200);
    const distances = res.body.data.map((d: { distanceKm: number }) => d.distanceKm);
    expect(distances.length).toBeGreaterThan(0);
    expect([...distances].sort((a, b) => a - b)).toEqual(distances);
  });

  it('expands the radius only when it helps', async () => {
    const res = await call('GET', '/search?latitude=22.95&longitude=87.95&radiusKm=2');
    expect(res.body.searchMeta.autoExpandedRadius).toBe(true);
    expect(res.body.searchMeta.appliedRadiusKm).toBe(6);

    const wide = await call('GET', '/search?latitude=10&longitude=70&radiusKm=150');
    expect(wide.body.searchMeta.appliedRadiusKm).toBe(150);
  });

  it('matches specialty chips by prefix', async () => {
    const res = await call('GET', '/search?specialty=Gynecology');
    expect(res.body.data.length).toBe(4);
  });
});

describe('reports', () => {
  it('stores a public report and lets admins resolve it', async () => {
    const submitted = await call('POST', '/reports', {
      body: { doctorId: 'DOC-WB-02', issueType: 'doc_unavailable', issueTitle: 'Doctor absent', description: 'Chamber was closed on Monday evening' }
    });
    expect(submitted.status).toBe(201);
    const id = submitted.body.data.id;

    expect((await call('GET', '/reports', { headers: patientAuth() })).status).toBe(403);
    const list = await call('GET', '/reports?status=pending', { headers: adminAuth() });
    expect(list.body.data[0].doctorName).toBe('Dr. Subrata Kumar Roy');

    const resolved = await call('PUT', `/reports/${id}/status`, { headers: adminAuth(), body: { status: 'resolved', resolutionNotes: 'Called chamber' } });
    expect(resolved.body.data.status).toBe('resolved');
  });
});

describe('admin snapshot and audit', () => {
  it('returns everything the admin panel needs in one call', async () => {
    expect((await call('GET', '/admin/snapshot', { headers: patientAuth() })).status).toBe(403);
    const res = await call('GET', '/admin/snapshot', { headers: staffAuth() });
    expect(res.status).toBe(200);
    expect(res.body.data.today.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(res.body.data.doctors.length).toBe(33);
    expect(res.body.data.locations.length).toBeGreaterThan(0);
  });

  it('records changes in the audit log', async () => {
    await call('PUT', '/doctors/DOC-WB-05', { headers: adminAuth(), body: { experienceYears: 12 } });
    const res = await call('GET', '/audit?entityId=DOC-WB-05', { headers: adminAuth() });
    expect(res.body.data[0].action).toBe('Updated doctor');
  });

  it('reports database health', async () => {
    const res = await call('GET', '/health');
    expect(res.body.status).toBe('ok');
    expect(res.body.database.records.doctors).toBe(33);
  });
});

describe('towns', () => {
  it('lists towns that actually have establishments, busiest first', async () => {
    const res = await call('GET', '/locations/towns');
    expect(res.status).toBe(200);
    const names = res.body.data.map((t: { name: string }) => t.name);
    expect(names).toEqual(expect.arrayContaining(['Ghatal', 'Khirpai', 'Chandrakona Town', 'Ramjibanpur', 'Daspur']));
    expect(names).not.toContain('Gopiballavpur');
    expect(res.body.data.every((t: { establishmentCount: number }) => t.establishmentCount > 0)).toBe(true);
    expect(res.body.defaultLocation.name).toBe('Medinipur');
    expect(res.body.defaultLocation.district).toBe('Paschim Medinipur');
    const counts = res.body.data.map((t: { doctorCount: number }) => t.doctorCount);
    expect([...counts].sort((a, b) => b - a)).toEqual(counts);
  });

  it('reports a clear availability status in search', async () => {
    const res = await call('GET', '/search?limit=50');
    const statuses = new Set(res.body.data.map((d: { todayAvailability: { status: string } }) => d.todayAvailability.status));
    for (const s of statuses) expect(['available', 'cancelled', 'not_today', 'no_schedule']).toContain(s);
  });
});
