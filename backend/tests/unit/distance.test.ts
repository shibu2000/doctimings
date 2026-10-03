import { describe, it, expect } from 'vitest';

const calculateHaversineDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

describe('Geographic Distance Calculation Unit Tests', () => {
  it('should return 0 km for identical coordinates', () => {
    const lat = 23.2324;
    const lon = 87.8615;
    const dist = calculateHaversineDistanceKm(lat, lon, lat, lon);
    expect(dist).toBe(0);
  });

  it('should accurately calculate distance between Burdwan and Kolkata within expected margin', () => {
    const burdwanLat = 23.2324;
    const burdwanLon = 87.8615;
    const kolkataLat = 22.5697;
    const kolkataLon = 88.3697;

    const dist = calculateHaversineDistanceKm(burdwanLat, burdwanLon, kolkataLat, kolkataLon);
    expect(dist).toBeGreaterThan(80);
    expect(dist).toBeLessThan(110);
  });

  it('should maintain mathematical symmetry between points A and B', () => {
    const p1 = { lat: 23.2324, lon: 87.8615 };
    const p2 = { lat: 23.2201, lon: 88.3644 };

    const distForward = calculateHaversineDistanceKm(p1.lat, p1.lon, p2.lat, p2.lon);
    const distBackward = calculateHaversineDistanceKm(p2.lat, p2.lon, p1.lat, p1.lon);

    expect(distForward).toBe(distBackward);
  });
});
