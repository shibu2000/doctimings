import type * as schema from '../db/schema.js';
import { dayOfDate } from './time.js';

type Schedule = typeof schema.schedules.$inferSelect;
type Override = typeof schema.scheduleOverrides.$inferSelect;

export interface DaySession {
  establishmentId: string;
  startTime: string;
  endTime: string;
  shiftName: string;
  kind: 'regular' | 'changed' | 'extra';
}

export const sessionsOnDate = (date: string, schedules: Schedule[], overrides: Override[]) => {
  const day = dayOfDate(date);
  const dayOverrides = overrides.filter(o => o.date === date);
  const cancelled = new Set(dayOverrides.filter(o => o.overrideType === 'unavailable').map(o => o.establishmentId));
  const changed = new Map(
    dayOverrides
      .filter(o => o.overrideType === 'changed' && o.newStartTime && o.newEndTime)
      .map(o => [o.establishmentId, o])
  );

  const sessions: DaySession[] = [];
  const regular = schedules.filter(s => s.isActive && s.dayOfWeek === day);

  for (const s of regular) {
    if (cancelled.has(s.establishmentId) || changed.has(s.establishmentId)) continue;
    sessions.push({ establishmentId: s.establishmentId, startTime: s.startTime, endTime: s.endTime, shiftName: s.shiftName, kind: 'regular' });
  }
  for (const o of changed.values()) {
    if (cancelled.has(o.establishmentId)) continue;
    sessions.push({ establishmentId: o.establishmentId, startTime: o.newStartTime!, endTime: o.newEndTime!, shiftName: 'Changed hours', kind: 'changed' });
  }
  for (const o of dayOverrides.filter(o => o.overrideType === 'additional' && o.newStartTime && o.newEndTime)) {
    sessions.push({ establishmentId: o.establishmentId, startTime: o.newStartTime!, endTime: o.newEndTime!, shiftName: 'Extra session', kind: 'extra' });
  }

  sessions.sort((a, b) => a.startTime.localeCompare(b.startTime));

  return {
    sessions,
    hadRegularSessions: regular.length > 0,
    notes: dayOverrides.map(o => o.publicReason).filter(Boolean)
  };
};
