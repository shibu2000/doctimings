export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export type Day = (typeof DAYS)[number];

export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const isRealDate = (value: string) => {
  if (!DATE_PATTERN.test(value)) return false;
  const year = Number(value.slice(0, 4));
  if (year < 2020 || year > 2100) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

export const daysApart = (from: string, to: string) =>
  Math.round((new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) / 86400000);

const istFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Kolkata',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  weekday: 'long'
});

export const istNow = (at = new Date()) => {
  const parts = Object.fromEntries(istFormatter.formatToParts(at).map(p => [p.type, p.value]));
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    dayOfWeek: parts.weekday as Day,
    minutes: Number(parts.hour) * 60 + Number(parts.minute)
  };
};

export const dayOfDate = (isoDate: string): Day => {
  const utcDay = new Date(`${isoDate}T00:00:00Z`).getUTCDay();
  return DAYS[(utcDay + 6) % 7];
};

export const addDays = (isoDate: string, days: number): string => {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

export const datesBetween = (from: string, to: string, max = 366): string[] => {
  const count = Math.min(daysApart(from, to) + 1, max);
  return Array.from({ length: Math.max(count, 0) }, (_, i) => addDays(from, i));
};

export const nextDateFor = (day: Day, fromDate: string): string => {
  const offset = (DAYS.indexOf(day) - DAYS.indexOf(dayOfDate(fromDate)) + 7) % 7;
  return addDays(fromDate, offset);
};

export const toMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

export const formatTo12Hour = (time: string): string => {
  if (!TIME_PATTERN.test(time)) return time;
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
};

export const shiftNameFor = (startTime: string): string => {
  const minutes = toMinutes(startTime);
  if (minutes < 12 * 60) return 'Morning';
  if (minutes < 16 * 60) return 'Afternoon';
  return 'Evening';
};
