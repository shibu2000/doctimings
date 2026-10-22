import { PracticeLocation, ScheduleItem } from '../types';
import { istToday } from './doctorMapper';

const HORIZON_DAYS = 14;

export interface NextSitting {
  practice: PracticeLocation;
  schedule: ScheduleItem;
  dayOffset: number;
  date: string;
  isOngoing: boolean;
}

const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

export const findNextSitting = (practices: PracticeLocation[]): NextSitting | null => {
  const today = istToday();
  const todayDow = ((new Date(`${today.date}T00:00:00Z`).getUTCDay() + 6) % 7) + 1;

  for (let dayOffset = 0; dayOffset < HORIZON_DAYS; dayOffset++) {
    const dow = ((todayDow - 1 + dayOffset) % 7) + 1;
    const candidates = practices.flatMap((practice) =>
      practice.schedules
        .filter((s) => s.dayOfWeek === dow)
        .filter((s) => dayOffset > 0 || (practice.availability !== 'not_available' && toMinutes(s.endTime) > today.minutes))
        .map((schedule) => ({ practice, schedule }))
    );
    if (!candidates.length) continue;
    const next = candidates.sort(
      (a, b) =>
        a.schedule.startTime.localeCompare(b.schedule.startTime) ||
        (a.practice.distanceKm ?? Infinity) - (b.practice.distanceKm ?? Infinity)
    )[0];
    const date = new Date(`${today.date}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + dayOffset);
    return {
      ...next,
      dayOffset,
      date: date.toISOString().slice(0, 10),
      isOngoing: dayOffset === 0 && toMinutes(next.schedule.startTime) <= today.minutes,
    };
  }
  return null;
};
