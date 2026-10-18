import { describe, it, expect, beforeAll } from 'vitest';
import { eq } from 'drizzle-orm';
import { adminAuth, call, patientAuth } from '../helpers.js';
import { getDb } from '../../src/db/index.js';
import * as schema from '../../src/db/schema.js';
import { addDays, istNow, nextDateFor } from '../../src/lib/time.js';

const OWN = 'EST-GHT-03';
const OTHER = 'EST-KHP-01';
const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });
const nextFriday = nextDateFor('Friday', addDays(istNow().date, 1));

const activate = (code: string, email: string, extra: Record<string, string> = {}) =>
  call('POST', '/auth/activate', { body: { code, name: 'Rakesh Das', email, phone: '9876500001', password: 'owner-pass-1', ...extra } });

let ownerToken = '';
let staffToken = '';
let ownerCode = '';

describe('establishment handover', () => {
  beforeAll(async () => {
    const invite = await call('POST', `/establishments/${OWN}/invitations`, { headers: adminAuth(), body: { role: 'Owner', name: 'Rakesh Das', phone: '9876500001' } });
    expect(invite.status).toBe(201);
    ownerCode = invite.body.data.code;
    expect(ownerCode).toMatch(/^[A-Z2-9]{5}-[A-Z2-9]{5}$/);
    expect(JSON.stringify(invite.body.data.invitation)).not.toContain('codeHash');
  });

  it('marks the establishment as waiting for the owner', async () => {
    const est = await call('GET', `/establishments/${OWN}`);
    expect(est.body.data.accountStatus).toBe('Invitation Pending');
  });

  it('rejects wrong codes', async () => {
    expect((await activate('AAAAA-BBBBB', 'nobody@example.com')).status).toBe(400);
  });

  it('activates once, then the code is dead', async () => {
    const res = await activate(ownerCode.toLowerCase().replace('-', ' '), 'owner@maamedical.in');
    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe('Partner');
    ownerToken = res.body.data.token;

    expect((await activate(ownerCode, 'second@example.com')).status).toBe(400);
    const est = await call('GET', `/establishments/${OWN}`);
    expect(est.body.data.accountStatus).toBe('Account Active');
  });

  it('shows the partner only their own establishments', async () => {
    const me = await call('GET', '/auth/partner', { headers: bearer(ownerToken) });
    expect(me.body.data.establishments.map((e: { id: string }) => e.id)).toEqual([OWN]);
    expect(me.body.data.establishments[0].memberRole).toBe('Owner');
    expect((await call('GET', '/auth/partner', { headers: patientAuth() })).status).toBe(403);
  });

  it('lets a partner edit their establishment but not anyone else’s', async () => {
    const own = await call('PUT', `/establishments/${OWN}`, { headers: bearer(ownerToken), body: { phone: '+91 90000 11111', verificationStatus: 'Verified', accountStatus: 'Platform Managed' } });
    expect(own.status).toBe(200);
    expect(own.body.data.phone).toBe('+91 90000 11111');
    expect(own.body.data.accountStatus).toBe('Account Active');

    expect((await call('PUT', `/establishments/${OTHER}`, { headers: bearer(ownerToken), body: { phone: '1' } })).status).toBe(403);
    expect((await call('POST', `/establishments/${OTHER}/locations`, { headers: bearer(ownerToken), body: { name: 'Hijack' } })).status).toBe(403);
    expect((await call('POST', '/establishments', { headers: bearer(ownerToken), body: {} })).status).toBe(403);
    expect((await call('DELETE', `/establishments/${OWN}`, { headers: bearer(ownerToken) })).status).toBe(403);
  });

  it('keeps platform-only data away from partners', async () => {
    for (const path of ['/admin/snapshot', '/reports', '/audit', '/auth/users', '/admin/claims']) {
      expect((await call('GET', path, { headers: bearer(ownerToken) })).status).toBe(403);
    }
    expect((await call('DELETE', '/doctors/DOC-WB-06', { headers: bearer(ownerToken) })).status).toBe(403);
  });

  it('lets a partner add doctors only to their own place, pending review', async () => {
    const created = await call('POST', '/doctors', {
      headers: bearer(ownerToken),
      body: { fullName: 'Dr. New Partner Doctor', specialty: 'ENT', verificationStatus: 'Verified', sittings: [{ establishmentId: OWN, sessions: [{ dayOfWeek: 'Friday', startTime: '17:00', endTime: '19:00' }] }] }
    });
    expect(created.status).toBe(201);
    expect(created.body.data.verificationStatus).toBe('Needs Review');

    const elsewhere = await call('POST', '/doctors', {
      headers: bearer(ownerToken),
      body: { fullName: 'Dr. Sneaky', specialty: 'ENT', sittings: [{ establishmentId: OTHER, sessions: [] }] }
    });
    expect(elsewhere.status).toBe(403);
    expect((await call('POST', '/doctors', { headers: bearer(ownerToken), body: { fullName: 'Dr. Nowhere', specialty: 'ENT' } })).status).toBe(403);
  });

  it('limits timing changes to the partner’s own establishment', async () => {
    const own = await call('PUT', `/doctors/DOC-WB-06/sittings/${OWN}`, { headers: bearer(ownerToken), body: { sessions: [{ dayOfWeek: 'Friday', startTime: '10:00', endTime: '12:00' }] } });
    expect(own.status).toBe(200);
    const other = await call('PUT', '/doctors/DOC-WB-06/sittings/EST-CHK-02', { headers: bearer(ownerToken), body: { sessions: [] } });
    expect(other.status).toBe(403);
    expect((await call('DELETE', '/doctors/DOC-WB-06/sittings/EST-CHK-02', { headers: bearer(ownerToken) })).status).toBe(403);

    const otherSchedule = (await call('GET', '/schedules?doctorId=DOC-WB-06&establishmentId=EST-CHK-02')).body.data[0];
    expect((await call('PUT', `/schedules/${otherSchedule.id}`, { headers: bearer(ownerToken), body: { startTime: '06:00' } })).status).toBe(403);
    expect((await call('DELETE', `/schedules/${otherSchedule.id}`, { headers: bearer(ownerToken) })).status).toBe(403);

    const leave = await call('POST', '/doctors/DOC-WB-06/leave', { headers: bearer(ownerToken), body: { from: nextFriday, to: nextFriday, reason: 'On leave' } });
    expect(leave.status).toBe(201);
    expect(leave.body.data.every((o: { establishmentId: string }) => o.establishmentId === OWN)).toBe(true);
    expect(
      (await call('POST', '/doctors/DOC-WB-06/leave', { headers: bearer(ownerToken), body: { from: nextFriday, to: nextFriday, establishmentIds: ['EST-CHK-02'], reason: 'On leave' } })).status
    ).toBe(403);

    const otherOverride = await call('POST', '/schedules/overrides', {
      headers: bearer(ownerToken),
      body: { doctorId: 'DOC-WB-06', establishmentId: 'EST-CHK-02', date: nextFriday, overrideType: 'unavailable', publicReason: 'Fake leave' }
    });
    expect(otherOverride.status).toBe(403);
  });

  it('does not let a partner rewrite a doctor shared with other places', async () => {
    expect((await call('PUT', '/doctors/DOC-WB-06', { headers: bearer(ownerToken), body: { qualifications: 'Fake' } })).status).toBe(403);
  });

  it('lets the owner invite staff but not hand out ownership', async () => {
    expect((await call('POST', `/establishments/${OWN}/invitations`, { headers: bearer(ownerToken), body: { role: 'Owner', name: 'Cousin', phone: '9876500009' } })).status).toBe(403);
    expect((await call('POST', `/establishments/${OTHER}/invitations`, { headers: bearer(ownerToken), body: { role: 'Staff', name: 'Outsider', phone: '9876500009' } })).status).toBe(403);

    const invite = await call('POST', `/establishments/${OWN}/invitations`, { headers: bearer(ownerToken), body: { role: 'Staff', name: 'Counter Staff', phone: '9876500002' } });
    expect(invite.status).toBe(201);
    const staff = await activate(invite.body.data.code, 'staff@maamedical.in', { name: 'Counter Staff', phone: '9876500002' });
    expect(staff.status).toBe(200);
    staffToken = staff.body.data.token;

    expect((await call('GET', `/establishments/${OWN}/access`, { headers: bearer(staffToken) })).status).toBe(403);
    expect((await call('POST', `/establishments/${OWN}/invitations`, { headers: bearer(staffToken), body: { role: 'Staff', name: 'Another', phone: '9876500010' } })).status).toBe(403);
    expect((await call('PUT', `/doctors/DOC-WB-09/sittings/${OWN}`, { headers: bearer(staffToken), body: { sessions: [{ dayOfWeek: 'Monday', startTime: '09:00', endTime: '11:00' }] } })).status).toBe(200);
  });

  it('cuts off removed staff immediately', async () => {
    const team = await call('GET', `/establishments/${OWN}/access`, { headers: bearer(ownerToken) });
    const staff = team.body.data.members.find((m: { role: string }) => m.role === 'Staff');
    const owner = team.body.data.members.find((m: { role: string }) => m.role === 'Owner');
    expect((await call('DELETE', `/establishments/${OWN}/members/${owner.id}`, { headers: bearer(ownerToken) })).status).toBe(403);
    expect((await call('DELETE', `/establishments/${OWN}/members/${staff.id}`, { headers: bearer(ownerToken) })).status).toBe(200);
    const after = await call('PUT', `/doctors/DOC-WB-09/sittings/${OWN}`, { headers: bearer(staffToken), body: { sessions: [] } });
    expect([401, 403]).toContain(after.status);
  });

  it('expires and revokes invites', async () => {
    const invite = await call('POST', `/establishments/${OWN}/invitations`, { headers: bearer(ownerToken), body: { role: 'Staff', name: 'Late', phone: '9876500003' } });
    await getDb().update(schema.invitations).set({ expiresAt: new Date(Date.now() - 1000) }).where(eq(schema.invitations.id, invite.body.data.invitation.id));
    expect((await activate(invite.body.data.code, 'late@example.com')).status).toBe(400);

    const revoked = await call('POST', `/establishments/${OWN}/invitations`, { headers: bearer(ownerToken), body: { role: 'Staff', name: 'Gone', phone: '9876500004' } });
    expect((await call('DELETE', `/admin/invitations/${revoked.body.data.invitation.id}`, { headers: bearer(ownerToken) })).status).toBe(200);
    expect((await activate(revoked.body.data.code, 'gone@example.com')).status).toBe(400);
  });

  it('will not attach an invite to a platform or patient account', async () => {
    const invite = await call('POST', `/establishments/${OWN}/invitations`, { headers: bearer(ownerToken), body: { role: 'Staff', name: 'Admin', phone: '9876500005' } });
    const res = await activate(invite.body.data.code, 'shibudhara147@gmail.com', { password: 'owner-password-123' });
    expect(res.status).toBe(409);
  });
});

describe('doctor profile claim', () => {
  let doctorToken = '';

  it('accepts a public claim request once per phone number', async () => {
    const body = { claimantName: 'Dr. Sekendar Ali', phone: '+91 94334 98112', registrationNumber: 'wbmc 56112', message: 'This is me' };
    const res = await call('POST', '/doctors/DOC-WB-09/claims', { body });
    expect(res.status).toBe(201);
    expect((await call('POST', '/doctors/DOC-WB-09/claims', { body })).status).toBe(409);
  });

  it('shows admins whether the request matches the record', async () => {
    expect((await call('GET', '/admin/claims', { headers: patientAuth() })).status).toBe(403);
    const list = await call('GET', '/admin/claims', { headers: adminAuth() });
    const claim = list.body.data.find((c: { doctorId: string }) => c.doctorId === 'DOC-WB-09');
    expect(claim.checks).toEqual({ registrationMatches: true, phoneMatches: true });
  });

  it('turns an approved claim into a one-time doctor code', async () => {
    const list = await call('GET', '/admin/claims', { headers: adminAuth() });
    const claim = list.body.data.find((c: { doctorId: string }) => c.doctorId === 'DOC-WB-09');
    const review = await call('POST', `/admin/claims/${claim.id}/review`, { headers: adminAuth(), body: { decision: 'approve', note: 'Called the number on record' } });
    expect(review.status).toBe(200);

    const res = await activate(review.body.data.invite.code, 'dr.sekendar@example.com', { name: 'Dr. Sekendar Ali', phone: '9433498112' });
    expect(res.status).toBe(200);
    doctorToken = res.body.data.token;

    const me = await call('GET', '/auth/partner', { headers: bearer(doctorToken) });
    expect(me.body.data.doctor.id).toBe('DOC-WB-09');
    expect(me.body.data.establishments).toHaveLength(0);

    expect((await call('POST', '/doctors/DOC-WB-09/claims', { body: { claimantName: 'Imposter', phone: '9000000099', registrationNumber: 'X123' } })).status).toBe(409);
    expect((await call('POST', '/doctors/DOC-WB-09/invitations', { headers: adminAuth(), body: {} })).status).toBe(409);
  });

  it('lets the doctor manage their own profile and timing only', async () => {
    const profile = await call('PUT', '/doctors/DOC-WB-09', { headers: bearer(doctorToken), body: { qualifications: 'MBBS, MD', registrationNumber: 'CHANGED', verificationStatus: 'Verified' } });
    expect(profile.status).toBe(200);
    expect(profile.body.data.qualifications).toBe('MBBS, MD');
    expect(profile.body.data.registrationNumber).toBe('WBMC-56112');

    const leave = await call('POST', '/doctors/DOC-WB-09/leave', { headers: bearer(doctorToken), body: { from: istNow().date, to: addDays(istNow().date, 13), reason: 'On leave' } });
    expect(leave.status).toBe(201);

    expect((await call('PUT', '/doctors/DOC-WB-10', { headers: bearer(doctorToken), body: { qualifications: 'X' } })).status).toBe(403);
    expect((await call('PUT', '/doctors/DOC-WB-09/sittings/EST-KHP-01', { headers: bearer(doctorToken), body: { sessions: [] } })).status).toBe(403);
    expect((await call('PUT', `/establishments/${OWN}`, { headers: bearer(doctorToken), body: { phone: '1' } })).status).toBe(403);
  });

  it('stops establishments from editing a claimed doctor’s profile', async () => {
    const solo = await call('POST', '/doctors', {
      headers: bearer(ownerToken),
      body: { fullName: 'Dr. Solo', specialty: 'ENT', sittings: [{ establishmentId: OWN, sessions: [] }] }
    });
    const soloId = solo.body.data.id;
    expect((await call('PUT', `/doctors/${soloId}`, { headers: bearer(ownerToken), body: { qualifications: 'MBBS' } })).status).toBe(200);

    const invite = await call('POST', `/doctors/${soloId}/invitations`, { headers: adminAuth(), body: {} });
    expect(invite.status).toBe(201);
    expect((await activate(invite.body.data.code, 'dr.solo@example.com', { name: 'Dr. Solo' })).status).toBe(200);
    expect((await call('PUT', `/doctors/${soloId}`, { headers: bearer(ownerToken), body: { qualifications: 'MBBS, MS' } })).status).toBe(403);
    expect((await call('PUT', `/doctors/${soloId}/sittings/${OWN}`, { headers: bearer(ownerToken), body: { sessions: [{ dayOfWeek: 'Tuesday', startTime: '10:00', endTime: '11:00' }] } })).status).toBe(200);
  });

  it('lets admins detach a wrong account', async () => {
    expect((await call('DELETE', '/doctors/DOC-WB-09/account', { headers: adminAuth() })).status).toBe(200);
    const after = await call('PUT', '/doctors/DOC-WB-09', { headers: bearer(doctorToken), body: { qualifications: 'Y' } });
    expect([401, 403]).toContain(after.status);
  });
});

describe('session safety', () => {
  it('invalidates old tokens after a password change', async () => {
    await new Promise(r => setTimeout(r, 2100));
    const changed = await call('POST', '/auth/change-password', { headers: bearer(ownerToken), body: { currentPassword: 'owner-pass-1', newPassword: 'owner-pass-2' } });
    expect(changed.status).toBe(200);
    expect((await call('GET', '/auth/me', { headers: bearer(ownerToken) })).status).toBe(401);
    expect((await call('GET', '/auth/me', { headers: bearer(changed.body.data.token) })).status).toBe(200);
    expect((await call('POST', '/auth/change-password', { headers: bearer(changed.body.data.token), body: { currentPassword: 'wrong', newPassword: 'owner-pass-3' } })).status).toBe(400);
  });

  it('blocks suspended accounts straight away', async () => {
    const login = await call('POST', '/auth/login', { body: { email: 'owner@maamedical.in', password: 'owner-pass-2' } });
    const token = login.body.data.token;
    const user = login.body.data.user;
    await new Promise(r => setTimeout(r, 2100));
    await call('PATCH', `/auth/users/${user.id}`, { headers: adminAuth(), body: { status: 'Suspended' } });
    expect((await call('GET', '/auth/partner', { headers: bearer(token) })).status).toBe(401);
  });

  it('rejects forged tokens', async () => {
    const forged = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVU1ItT1dORVItU0hJQlUiLCJyb2xlIjoiU3VwZXIgQWRtaW4ifQ.c2lnbmF0dXJl';
    expect((await call('GET', '/admin/snapshot', { headers: bearer(forged) })).status).toBe(401);
  });
});
