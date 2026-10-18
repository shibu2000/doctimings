import { DAYS, type Day, type Schedule } from './types';

export const SHORT_DAY: Record<Day, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun'
};

export const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const parts = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return { hour: h % 12 === 0 ? 12 : h % 12, minute: m, pm: h >= 12 };
};

export const formatTime = (time: string) => {
  const { hour, minute, pm } = parts(time);
  return `${hour}${minute ? `:${String(minute).padStart(2, '0')}` : ''} ${pm ? 'PM' : 'AM'}`;
};

export const formatRange = (start: string, end: string) => {
  const a = parts(start);
  const b = parts(end);
  const clock = (p: ReturnType<typeof parts>) => `${p.hour}${p.minute ? `:${String(p.minute).padStart(2, '0')}` : ''}`;
  if (a.pm === b.pm) return `${clock(a)}–${clock(b)} ${b.pm ? 'PM' : 'AM'}`;
  return `${formatTime(start)}–${formatTime(end)}`;
};

export const formatDays = (days: Day[]) => {
  const sorted = [...days].sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b));
  if (sorted.length === 7) return 'Every day';
  if (sorted.length === 6 && !sorted.includes('Sunday')) return 'Mon–Sat';
  const indices = sorted.map(d => DAYS.indexOf(d));
  const consecutive = indices.every((v, i) => i === 0 || v === indices[i - 1] + 1);
  if (consecutive && sorted.length >= 3) return `${SHORT_DAY[sorted[0]]}–${SHORT_DAY[sorted[sorted.length - 1]]}`;
  return sorted.map(d => SHORT_DAY[d]).join(', ');
};

export interface TimingGroup {
  days: Day[];
  startTime: string;
  endTime: string;
  roomId: string;
}

export const groupSchedules = (schedules: Pick<Schedule, 'dayOfWeek' | 'startTime' | 'endTime' | 'practiceLocationId'>[]) => {
  const groups = new Map<string, TimingGroup>();
  for (const s of schedules) {
    const key = `${s.startTime}|${s.endTime}|${s.practiceLocationId}`;
    const group = groups.get(key) ?? { days: [], startTime: s.startTime, endTime: s.endTime, roomId: s.practiceLocationId };
    if (!group.days.includes(s.dayOfWeek)) group.days.push(s.dayOfWeek);
    groups.set(key, group);
  }
  return [...groups.values()]
    .map(g => ({ ...g, days: g.days.sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b)) }))
    .sort((a, b) => DAYS.indexOf(a.days[0]) - DAYS.indexOf(b.days[0]) || a.startTime.localeCompare(b.startTime));
};

const utcDate = (iso: string) => new Date(`${iso}T00:00:00Z`);

export const addDays = (iso: string, days: number) => {
  const date = utcDate(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

export const dayOfDate = (iso: string): Day => DAYS[(utcDate(iso).getUTCDay() + 6) % 7];

export const formatDate = (iso: string, today?: string) => {
  if (today) {
    if (iso === today) return 'Today';
    if (iso === addDays(today, 1)) return 'Tomorrow';
  }
  return utcDate(iso).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
};

export const formatLongDate = (iso: string) =>
  utcDate(iso).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });

export const nextDateFor = (day: Day, fromIso: string) => {
  const offset = (DAYS.indexOf(day) - DAYS.indexOf(dayOfDate(fromIso)) + 7) % 7;
  return addDays(fromIso, offset);
};

export const relativeTime = (timestamp: string | null) => {
  if (!timestamp) return 'never';
  const then = new Date(timestamp).getTime();
  if (Number.isNaN(then)) return timestamp;
  const days = Math.floor((Date.now() - then) / 86400000);
  if (days <= 0) {
    const hours = Math.floor((Date.now() - then) / 3600000);
    return hours <= 0 ? 'just now' : `${hours}h ago`;
  }
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? 'a month ago' : `${months} months ago`;
};

export const daysSince = (timestamp: string) => Math.floor((Date.now() - new Date(timestamp).getTime()) / 86400000);
