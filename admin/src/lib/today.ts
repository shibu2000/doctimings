import type { Directory } from './directory';
import type { Doctor, Establishment, Override } from './types';
import { addDays, dayOfDate } from './time';

export type SessionStatus = 'scheduled' | 'changed' | 'extra' | 'away';

export interface DaySession {
  key: string;
  doctor: Doctor;
  establishment: Establishment;
  startTime: string;
  endTime: string;
  regular?: { startTime: string; endTime: string };
  status: SessionStatus;
  override?: Override;
}

export const sessionsOn = (directory: Directory, date: string): DaySession[] => {
  const day = dayOfDate(date);
  const list: DaySession[] = [];
  for (const doctor of directory.doctors.filter(d => d.isActive)) {
    for (const sitting of directory.sittingsOf(doctor)) {
      const overrides = sitting.overrides.filter(o => o.date === date);
      const away = overrides.find(o => o.overrideType === 'unavailable');
      const changed = overrides.find(o => o.overrideType === 'changed');
      const regular = sitting.sessions.filter(s => s.isActive && s.dayOfWeek === day);
      for (const s of regular) {
        const base = { doctor, establishment: sitting.establishment, regular: { startTime: s.startTime, endTime: s.endTime } };
        if (away) list.push({ ...base, key: `${s.id}-away`, startTime: s.startTime, endTime: s.endTime, status: 'away', override: away });
        else if (changed?.newStartTime && changed.newEndTime)
          list.push({ ...base, key: `${s.id}-changed`, startTime: changed.newStartTime, endTime: changed.newEndTime, status: 'changed', override: changed });
        else list.push({ ...base, key: s.id, startTime: s.startTime, endTime: s.endTime, status: 'scheduled', override: changed });
      }
      for (const extra of overrides.filter(o => o.overrideType === 'additional' && o.newStartTime && o.newEndTime)) {
        list.push({
          key: extra.id,
          doctor,
          establishment: sitting.establishment,
          startTime: extra.newStartTime!,
          endTime: extra.newEndTime!,
          status: 'extra',
          override: extra
        });
      }
    }
  }
  return list.sort((a, b) => a.startTime.localeCompare(b.startTime) || a.doctor.fullName.localeCompare(b.doctor.fullName));
};

export const upcomingChanges = (directory: Directory, days: number) => {
  const until = addDays(directory.today.date, days);
  return directory.overrides.filter(o => o.date > directory.today.date && o.date <= until);
};

const istMinutes = () => {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const get = (type: string) => Number(parts.find(p => p.type === type)?.value ?? 0);
  return get('hour') * 60 + get('minute');
};

export const nowMinutesIst = istMinutes;
