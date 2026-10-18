import { describe, it, expect, beforeAll } from 'vitest';
import { adminAuth, call } from '../helpers.js';
import { addDays, istNow, nextDateFor } from '../../src/lib/time.js';

const OWN = 'EST-GHT-03';
const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });
let partner = '';

beforeAll(async () => {
  const invite = await call('POST', `/establishments/${OWN}/invitations`, { headers: adminAuth(), body: { role: 'Owner', name: 'Audit Owner', phone: '9876511111' } });
  const res = await call('POST', '/auth/activate', {
    body: { code: invite.body.data.code, name: 'Audit Owner', email: 'audit-owner@example.com', phone: '9876511111', password: 'audit-pass-1' }
  });
  partner = res.body.data.token;
});

describe('fixes from the security review', () => {
  it('rejects far-future and impossible leave dates quickly', async () => {
    const started = Date.now();
    const far = await call('POST', '/doctors/DOC-WB-06/leave', { headers: bearer(partner), body: { from: '2026-10-20', to: '9999-12-31', reason: 'xxx' } });
    expect(far.status).toBe(400);
    const impossible = await call('POST', '/doctors/DOC-WB-06/leave', { headers: bearer(partner), body: { from: '2026-13-01', to: '2026-13-02', reason: 'xxx' } });
    expect(impossible.status).toBe(400);
    const tooLong = await call('POST', '/doctors/DOC-WB-06/leave', { headers: bearer(partner), body: { from: istNow().date, to: addDays(istNow().date, 200), reason: 'xxx' } });
    expect(tooLong.status).toBe(400);
    expect(Date.now() - started).toBeLessThan(2000);
    const override = await call('POST', '/schedules/overrides', {
      headers: bearer(partner),
      body: { doctorId: 'DOC-WB-06', establishmentId: OWN, date: '2026-02-30', overrideType: 'unavailable', publicReason: 'On leave' }
    });
    expect(override.status).toBe(400);
  });

  it('checks permission before doing any leave work', async () => {
    const res = await call('POST', '/doctors/DOC-WB-01/leave', { headers: bearer(partner), body: { from: istNow().date, to: istNow().date, reason: 'xxx' } });
    expect(res.status).toBe(403);
  });

  it('never lets a partner change a doctor’s contact details', async () => {
    const created = await call('POST', '/doctors', {
      headers: bearer(partner),
      body: { fullName: 'Dr. Contact Test', specialty: 'ENT', primaryPhone: '9000000001', sittings: [{ establishmentId: OWN, sessions: [] }] }
    });
    const id = created.body.data.id;
    const res = await call('PUT', `/doctors/${id}`, { headers: bearer(partner), body: { primaryPhone: '9999999999', email: 'attacker@example.com', qualifications: 'MBBS' } });
    expect(res.status).toBe(200);
    expect(res.body.data.primaryPhone).toBe('9000000001');
    expect(res.body.data.email).toBeNull();
    expect(res.body.data.qualifications).toBe('MBBS');
  });

  it('keeps unreviewed and hidden doctors out of public listings', async () => {
    const created = await call('POST', '/doctors', {
      headers: bearer(partner),
      body: { fullName: 'Dr. Unreviewed Person', specialty: 'ENT', sittings: [{ establishmentId: OWN, sessions: [{ dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:00' }] }] }
    });
    const id = created.body.data.id;
    expect((await call('GET', `/doctors/${id}`)).status).toBe(404);
    expect((await call('GET', `/doctors/${id}`, { headers: bearer(partner) })).status).toBe(200);
    expect((await call('GET', `/doctors/${id}`, { headers: adminAuth() })).status).toBe(200);
    const search = await call('GET', '/search?q=Unreviewed');
    expect(search.body.data).toHaveLength(0);
    const roster = await call('GET', `/doctors?establishmentId=${OWN}&limit=200`, { headers: bearer(partner) });
    expect(roster.body.data.some((d: { id: string }) => d.id === id)).toBe(true);
    const publicRoster = await call('GET', `/doctors?establishmentId=${OWN}&limit=200`);
    expect(publicRoster.body.data.some((d: { id: string }) => d.id === id)).toBe(false);

    await call('PUT', `/doctors/${id}`, { headers: adminAuth(), body: { verificationStatus: 'Verified' } });
    expect((await call('GET', `/doctors/${id}`)).status).toBe(200);
    await call('PUT', `/doctors/${id}`, { headers: adminAuth(), body: { isActive: false } });
    expect((await call('GET', `/doctors/${id}`)).status).toBe(404);
  });

  it('does not let partners sign changes as DocTimings', async () => {
    const date = nextDateFor('Friday', addDays(istNow().date, 1));
    const res = await call('POST', '/schedules/overrides', {
      headers: bearer(partner),
      body: { doctorId: 'DOC-WB-06', establishmentId: OWN, date, overrideType: 'unavailable', publicReason: 'On leave', reportedBy: 'DocTimings Verification Team' }
    });
    expect(res.status).toBe(201);
    expect(res.body.data.reportedBy).toBe('Audit Owner');
  });

  it('refuses rooms from another establishment', async () => {
    const own = (await call('GET', `/schedules?doctorId=DOC-WB-06&establishmentId=${OWN}`)).body.data[0];
    const res = await call('PUT', `/schedules/${own.id}`, { headers: bearer(partner), body: { practiceLocationId: 'LOC-KHP-01-A' } });
    expect(res.status).toBe(400);
  });

  it('approves a claim only once', async () => {
    await call('POST', '/doctors/DOC-WB-10/claims', { body: { claimantName: 'Dr. Jayanta Sasmal', phone: '9434172054', registrationNumber: 'WBMC-48190' } });
    const claim = (await call('GET', '/admin/claims', { headers: adminAuth() })).body.data.find((c: { doctorId: string }) => c.doctorId === 'DOC-WB-10');
    const [a, b] = await Promise.all([
      call('POST', `/admin/claims/${claim.id}/review`, { headers: adminAuth(), body: { decision: 'approve' } }),
      call('POST', `/admin/claims/${claim.id}/review`, { headers: adminAuth(), body: { decision: 'approve' } })
    ]);
    expect([a.status, b.status].sort()).toEqual([200, 404]);
  });

  it('limits claim requests per device across all doctors', async () => {
    const doctors = (await call('GET', '/doctors?limit=200')).body.data.slice(0, 12);
    const statuses: number[] = [];
    for (const [i, d] of doctors.entries()) {
      const res = await call('POST', `/doctors/${d.id}/claims`, { body: { claimantName: 'Spammer', phone: `90000${String(i).padStart(5, '0')}`, registrationNumber: 'XX123' } });
      statuses.push(res.status);
    }
    expect(statuses).toContain(429);
  });
});
