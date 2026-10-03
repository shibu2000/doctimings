import { describe, it, expect } from 'vitest';
import { app } from '../../src/index.js';
import { getAdminAuthHeader } from '../helpers.js';

describe('Establishments API Integration Tests', () => {
  it('should list establishments with doctor counts', async () => {
    const res = await app.request('/api/v1/establishments?page=1&limit=10');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0].doctorCount).toBeDefined();
  });

  it('should get establishment details by ID', async () => {
    const res = await app.request('/api/v1/establishments/EST-BWN-842');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe('EST-BWN-842');
    expect(body.data.name).toBe('Roy Pharmacy & Polyclinic');
    expect(Array.isArray(body.data.practiceLocations)).toBe(true);
  });

  it('should allow admin to create an establishment and add a practice location', async () => {
    const createRes = await app.request('/api/v1/establishments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify({
        name: 'Kolkata Diagnostic & Polyclinic',
        type: 'Polyclinic',
        district: 'Kolkata',
        subDistrict: 'Park Circus',
        address: '14 Syed Amir Ali Avenue, Park Circus, Kolkata',
        pinCode: '700017',
        phone: '+91 33 2287 4000',
        proprietorName: 'Amitava Mukherjee',
        licenseNumber: `WB-DL-KOL-${Date.now().toString().slice(-4)}`,
        latitude: 22.5401,
        longitude: 88.3654,
        verificationStatus: 'Verified',
        accountStatus: 'Platform Managed'
      })
    });

    expect(createRes.status).toBe(201);
    const created = await createRes.json();
    expect(created.success).toBe(true);
    const estId = created.data.id;

    const locRes = await app.request(`/api/v1/establishments/${estId}/locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify({
        establishmentId: estId,
        name: 'Cardiology Bay 1',
        roomDesignation: 'Chamber 101',
        floor: '1st Floor'
      })
    });

    expect(locRes.status).toBe(201);
    const locBody = await locRes.json();
    expect(locBody.data.roomDesignation).toBe('Chamber 101');

    const getLocsRes = await app.request(`/api/v1/establishments/${estId}/locations`);
    expect(getLocsRes.status).toBe(200);
    const getLocsBody = await getLocsRes.json();
    expect(getLocsBody.data.length).toBeGreaterThan(0);
  });
});
