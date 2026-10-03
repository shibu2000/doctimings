import { describe, it, expect } from 'vitest';
import { app } from '../../src/index.js';
import { getAdminAuthHeader } from '../helpers.js';

describe('Schedules & Overrides API Integration Tests', () => {
  it('should list schedules with joined doctor and establishment information', async () => {
    const res = await app.request('/api/v1/schedules');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0].doctorName).toBeDefined();
    expect(body.data[0].establishmentName).toBeDefined();
  });

  it('should create a new schedule slot with admin token', async () => {
    const res = await app.request('/api/v1/schedules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify({
        doctorId: 'DOC-BWN-101',
        establishmentId: 'EST-BWN-842',
        practiceLocationId: 'LOC-BWN-842-1',
        dayOfWeek: 'Friday',
        startTime: '17:00',
        endTime: '21:00',
        shiftName: 'Friday Evening Clinic',
        roomNumber: 'Chamber 1',
        tokenPolicy: 'First Come First Served',
        maxTokens: 25
      })
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.dayOfWeek).toBe('Friday');
    expect(body.data.shiftName).toBe('Friday Evening Clinic');
  });

  it('should list and create schedule overrides', async () => {
    const getRes = await app.request('/api/v1/schedules/overrides');
    expect(getRes.status).toBe(200);
    const getBody = await getRes.json();
    expect(getBody.success).toBe(true);
    expect(Array.isArray(getBody.data)).toBe(true);

    const createRes = await app.request('/api/v1/schedules/overrides', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify({
        doctorId: 'DOC-BWN-101',
        establishmentId: 'EST-BWN-842',
        date: '2026-10-15',
        dayOfWeek: 'Thursday',
        overrideType: 'unavailable',
        standardShift: '16:00 - 20:00',
        publicReason: 'Emergency hospital round at Burdwan Medical College'
      })
    });

    expect(createRes.status).toBe(201);
    const createBody = await createRes.json();
    expect(createBody.success).toBe(true);
    expect(createBody.data.overrideType).toBe('unavailable');
  });
});
