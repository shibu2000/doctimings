import { describe, it, expect } from 'vitest';
import { app } from '../../src/index.js';

describe('Auth API Integration Tests', () => {
  it('should authenticate admin user and return JWT token', async () => {
    const res = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@docnear.internal',
        password: 'password123'
      })
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.token).toBeDefined();
    expect(body.data.user.email).toBe('admin@docnear.internal');
    expect(body.data.user.role).toBe('Super Admin');
  });

  it('should reject invalid credentials with 401 code', async () => {
    const res = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@docnear.internal',
        password: 'completely_wrong_pass'
      })
    });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('should register a new patient user and issue a valid session token', async () => {
    const uniqueEmail = `test_patient_${Date.now()}@example.com`;
    const res = await app.request('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sourav Banerjee',
        email: uniqueEmail,
        phone: '+91 98321 00099',
        password: 'patientSecret123',
        role: 'Patient'
      })
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.token).toBeDefined();
    expect(body.data.user.name).toBe('Sourav Banerjee');
    expect(body.data.user.email).toBe(uniqueEmail);
  });

  it('should reject registration when email already exists', async () => {
    const res = await app.request('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Admin',
        email: 'admin@docnear.internal',
        phone: '+91 98321 00099',
        password: 'somePassword123'
      })
    });

    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('EMAIL_ALREADY_EXISTS');
  });

  it('should reject /me when no authorization header is provided', async () => {
    const res = await app.request('/api/v1/auth/me', {
      method: 'GET'
    });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('should return user profile on /me when valid Bearer token is provided', async () => {
    const loginRes = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@docnear.internal',
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.data.token;

    const meRes = await app.request('/api/v1/auth/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(meRes.status).toBe(200);
    const meData = await meRes.json();
    expect(meData.success).toBe(true);
    expect(meData.data.email).toBe('admin@docnear.internal');
  });
});
