import { describe, it, expect } from 'vitest';
import { app } from '../../src/index.js';

describe('Search & Proximity API Integration Tests', () => {
  it('should find doctors by text search query', async () => {
    const res = await app.request('/api/v1/search?q=Amit');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0].fullName).toContain('Amit');
  });

  it('should sort doctors by geographic proximity and calculate distance in km', async () => {
    const burdwanLat = 23.2324;
    const burdwanLon = 87.8615;

    const res = await app.request(`/api/v1/search?latitude=${burdwanLat}&longitude=${burdwanLon}&radiusKm=25`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0].distanceKm).toBeDefined();

    for (let i = 0; i < body.data.length - 1; i++) {
      expect(body.data[i].distanceKm).toBeLessThanOrEqual(body.data[i + 1].distanceKm);
    }
  });

  it('should auto-expand radius when initial radius yields zero matches', async () => {
    const remoteLat = 23.35;
    const remoteLon = 87.50;

    const res = await app.request(`/api/v1/search?latitude=${remoteLat}&longitude=${remoteLon}&radiusKm=2`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.searchMeta.appliedRadiusKm).toBeGreaterThan(2);
    expect(body.searchMeta.autoExpandedRadius).toBe(true);
  });

  it('should filter doctors by specialty and include real-time availability', async () => {
    const res = await app.request('/api/v1/search?specialty=Pediatrics');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    body.data.forEach((doc: any) => {
      expect(doc.specialty).toBe('Pediatrics');
      expect(doc.todayAvailability).toBeDefined();
    });
  });
});
