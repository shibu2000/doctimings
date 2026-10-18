import { DAYS, type Day, type Schedule, type Session } from '../../lib/types';
import { groupSchedules, SHORT_DAY, toMinutes } from '../../lib/time';

export interface TimingRow {
  key: string;
  days: Day[];
  startTime: string;
  endTime: string;
  roomId: string;
}

let counter = 0;
export const rowKey = () => `row-${++counter}`;

export const newRow = (preset?: Partial<TimingRow>): TimingRow => ({
  key: rowKey(),
  days: [],
  startTime: '17:00',
  endTime: '20:00',
  roomId: '',
  ...preset
});

export const rowsFromSchedules = (schedules: Schedule[]): TimingRow[] =>
  groupSchedules(schedules).map(g => ({ key: rowKey(), days: g.days, startTime: g.startTime, endTime: g.endTime, roomId: g.roomId }));

export const rowsToSessions = (rows: TimingRow[]): Session[] =>
  rows.flatMap(r =>
    r.days.map(dayOfWeek => ({
      dayOfWeek,
      startTime: r.startTime,
      endTime: r.endTime,
      ...(r.roomId ? { practiceLocationId: r.roomId } : {})
    }))
  );

export const validateRows = (rows: TimingRow[]): Record<string, string> => {
  const errors: Record<string, string> = {};
  for (const row of rows) {
    if (!row.startTime || !row.endTime) errors[row.key] = 'Set both times';
    else if (toMinutes(row.startTime) >= toMinutes(row.endTime)) errors[row.key] = 'End time must be after start time';
    else if (row.days.length === 0) errors[row.key] = 'Pick at least one day';
  }
  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      const a = rows[i];
      const b = rows[j];
      if (errors[a.key] || errors[b.key]) continue;
      const shared = a.days.filter(d => b.days.includes(d));
      const overlaps = toMinutes(a.startTime) < toMinutes(b.endTime) && toMinutes(b.startTime) < toMinutes(a.endTime);
      if (shared.length && overlaps) {
        errors[b.key] = `Overlaps another time on ${shared.map(d => SHORT_DAY[d]).join(', ')}`;
      }
    }
  }
  return errors;
};

export const sortDays = (days: Day[]) => [...days].sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b));
