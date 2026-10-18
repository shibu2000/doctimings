const istDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' });

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const todayInIndia = () => istDate.format(new Date());

export const addDaysIso = (iso: string, days: number) => {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

export const dayNameOf = (iso: string) => DAYS[(new Date(`${iso}T00:00:00Z`).getUTCDay() + 6) % 7];

export const formatTime12 = (time: string) => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return time;
  const h = Number(match[1]);
  return `${h % 12 === 0 ? 12 : h % 12}:${match[2]} ${h >= 12 ? 'PM' : 'AM'}`;
};

export const formatDayLabel = (iso: string, today = todayInIndia()) => {
  if (iso === today) return 'Today';
  if (iso === addDaysIso(today, 1)) return 'Tomorrow';
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
};
