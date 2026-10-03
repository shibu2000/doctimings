import { describe, it, expect } from 'vitest';
import { app } from '../../src/index.js';
import { getAdminAuthHeader, getPatientAuthHeader } from '../helpers.js';

describe('Doctors API Integration Tests', () => {
  it('should list doctors with pagination', async () => {
    const res = await app.request('/api/v1/doctors?page=1&limit=10');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.pagination.page).toBe(1);
    expect(body.pagination.total).toBeGreaterThan(0);
  });

  it('should filter doctors by specialty', async () => {
    const res = await app.request('/api/v1/doctors?specialty=Dermatology');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    body.data.forEach((doc: any) => {
      expect(doc.specialty).toBe('Dermatology');
    });
  });

  it('should get doctor details by ID with affiliated establishments and schedules', async () => {
    const res = await app.request('/api/v1/doctors/DOC-BWN-101');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe('DOC-BWN-101');
    expect(body.data.fullName).toContain('Amit Das');
    expect(Array.isArray(body.data.affiliatedEstablishments)).toBe(true);
    expect(Array.isArray(body.data.schedules)).toBe(true);
  });

  it('should return 404 for unknown doctor ID', async () => {
    const res = await app.request('/api/v1/doctors/DOC-NON-EXISTENT-999');
    expect(res.status).toBe(404);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('should prevent unauthenticated requests from creating doctors', async () => {
    const res = await app.request('/api/v1/doctors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Dr. Unauth User',
        specialty: 'Cardiology',
        registrationNumber: 'WB-TEST-000',
        qualifications: 'MBBS',
        primaryPhone: '+91 99999 88888'
      })
    });

    expect(res.status).toBe(401);
  });

  it('should forbid patients from creating doctors', async () => {
    const res = await app.request('/api/v1/doctors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getPatientAuthHeader()
      },
      body: JSON.stringify({
        fullName: 'Dr. Patient Hack',
        specialty: 'Cardiology',
        registrationNumber: 'WB-HACK-000',
        qualifications: 'MBBS',
        primaryPhone: '+91 99999 88888'
      })
    });

    expect(res.status).toBe(403);
  });

  it('should allow admin to create, update, and delete a doctor', async () => {
    const createRes = await app.request('/api/v1/doctors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify({
        fullName: 'Dr. Test Specialist',
        specialty: 'Cardiology',
        registrationNumber: `WB-MC-TEST-${Date.now()}`,
        council: 'West Bengal Medical Council',
        qualifications: 'MBBS, MD (Cardiology)',
        experienceYears: 12,
        primaryPhone: '+91 94333 11122',
        languages: ['Bengali', 'English', 'Hindi'],
        verificationStatus: 'Verified',
        affiliatedEstablishmentIds: ['EST-BWN-842']
      })
    });

    expect(createRes.status).toBe(201);
    const created = await createRes.json();
    expect(created.success).toBe(true);
    expect(created.data.id).toBeDefined();

    const createdId = created.data.id;

    const updateRes = await app.request(`/api/v1/doctors/${createdId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify({
        experienceYears: 14
      })
    });

    expect(updateRes.status).toBe(200);
    const updated = await updateRes.json();
    expect(updated.data.experienceYears).toBe(14);

    const deleteRes = await app.request(`/api/v1/doctors/${createdId}`, {
      method: 'DELETE',
      headers: getAdminAuthHeader()
    });

    expect(deleteRes.status).toBe(200);
    const deleted = await deleteRes.json();
    expect(deleted.success).toBe(true);
  });
});
