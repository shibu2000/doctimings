import { describe, it, expect } from 'vitest';
import { adminAuth, call, OWNER_EMAIL, OWNER_PASSWORD, patientAuth } from '../helpers.js';

describe('auth', () => {
  it('signs in with the real password, case-insensitively', async () => {
    const res = await call('POST', '/auth/login', { body: { email: OWNER_EMAIL.toUpperCase(), password: OWNER_PASSWORD } });
    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe('Super Admin');
    expect(res.body.data.token).toBeTypeOf('string');
  });

  it('rejects the old shared master passwords', async () => {
    for (const password of ['admin123', 'password123', 'partner123', 'HealthcareSecure2025']) {
      const res = await call('POST', '/auth/login', { body: { email: OWNER_EMAIL, password } });
      expect(res.status).toBe(401);
    }
  });

  it('always registers public sign-ups as patients', async () => {
    const res = await call('POST', '/auth/register', {
      body: { name: 'Mallory', email: 'mallory@example.com', phone: '9876543210', password: 'longpassword', role: 'Super Admin' }
    });
    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('Patient');

    const again = await call('POST', '/auth/register', {
      body: { name: 'Mallory', email: 'MALLORY@example.com', phone: '9876543210', password: 'longpassword' }
    });
    expect(again.status).toBe(409);
  });

  it('keeps the user directory and audit log away from patients', async () => {
    expect((await call('GET', '/auth/users', { headers: patientAuth() })).status).toBe(403);
    expect((await call('GET', '/audit', { headers: patientAuth() })).status).toBe(403);
    expect((await call('POST', '/audit', { headers: patientAuth(), body: {} })).status).toBe(404);
  });

  it('lets the super admin add, suspend and reset team members', async () => {
    const created = await call('POST', '/auth/users', {
      headers: adminAuth(),
      body: { name: 'Field Staff', email: 'staff@example.com', phone: '9000000001', password: 'staffpass1', role: 'Staff' }
    });
    expect(created.status).toBe(201);
    const id = created.body.data.id;

    expect((await call('POST', '/auth/login', { body: { email: 'staff@example.com', password: 'staffpass1' } })).status).toBe(200);

    await call('PATCH', `/auth/users/${id}`, { headers: adminAuth(), body: { status: 'Suspended' } });
    expect((await call('POST', '/auth/login', { body: { email: 'staff@example.com', password: 'staffpass1' } })).status).toBe(403);

    await call('PATCH', `/auth/users/${id}`, { headers: adminAuth(), body: { status: 'Active', password: 'newpass123' } });
    expect((await call('POST', '/auth/login', { body: { email: 'staff@example.com', password: 'newpass123' } })).status).toBe(200);
  });

  it('prevents an admin from suspending themselves', async () => {
    const res = await call('PATCH', '/auth/users/USR-OWNER-SHIBU', { headers: adminAuth(), body: { status: 'Suspended' } });
    expect(res.status).toBe(400);
  });

  it('returns the current user', async () => {
    expect((await call('GET', '/auth/me')).status).toBe(401);
    const res = await call('GET', '/auth/me', { headers: adminAuth() });
    expect(res.body.data.email).toBe(OWNER_EMAIL);
  });
});
