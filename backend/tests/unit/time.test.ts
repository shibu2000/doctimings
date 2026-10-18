import { describe, it, expect } from 'vitest';
import { istNow, dayOfDate, nextDateFor, formatTo12Hour, datesBetween, shiftNameFor } from '../../src/lib/time.js';
import { calculateHaversineDistanceKm } from '../../src/controllers/searchController.js';

describe('time helpers', () => {
  it('uses India time, not UTC, for the current date', () => {
    const lateUtcEvening = new Date('2026-10-18T20:00:00Z');
    expect(istNow(lateUtcEvening)).toEqual({ date: '2026-10-19', dayOfWeek: 'Monday', minutes: 90 });
  });

  it('resolves weekdays and next occurrences', () => {
    expect(dayOfDate('2026-10-18')).toBe('Sunday');
    expect(nextDateFor('Wednesday', '2026-10-18')).toBe('2026-10-21');
    expect(nextDateFor('Sunday', '2026-10-18')).toBe('2026-10-18');
    expect(datesBetween('2026-10-30', '2026-11-02')).toEqual(['2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02']);
  });

  it('formats times for display', () => {
    expect(formatTo12Hour('00:15')).toBe('12:15 AM');
    expect(formatTo12Hour('17:30')).toBe('5:30 PM');
    expect(shiftNameFor('09:00')).toBe('Morning');
    expect(shiftNameFor('18:00')).toBe('Evening');
  });

  it('computes distances in kilometres', () => {
    expect(calculateHaversineDistanceKm(22.5726, 88.3639, 22.5726, 88.3639)).toBe(0);
    const ghatalToKhirpai = calculateHaversineDistanceKm(22.6602, 87.7247, 22.7078, 87.6199);
    expect(ghatalToKhirpai).toBeGreaterThan(10);
    expect(ghatalToKhirpai).toBeLessThan(13);
  });
});

describe('time validation', () => {
  it('accepts single-digit hours from older clients', async () => {
    const { timeString } = await import('../../src/validators/scheduleValidator.js');
    expect(timeString.parse('9:30')).toBe('09:30');
    expect(timeString.safeParse('25:00').success).toBe(false);
    expect(timeString.safeParse('5 PM').success).toBe(false);
  });
});
