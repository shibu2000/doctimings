import { Plus, Trash2 } from 'lucide-react';
import { DAYS, type Day, type Room } from '../../lib/types';
import { SHORT_DAY } from '../../lib/time';
import { cn } from '../../lib/cn';
import { inputClass } from '../ui/Field';
import { newRow, sortDays, type TimingRow } from './timing';

const PRESETS = [
  { label: 'Morning', startTime: '09:00', endTime: '13:00' },
  { label: 'Afternoon', startTime: '13:00', endTime: '16:00' },
  { label: 'Evening', startTime: '17:00', endTime: '20:00' }
];

interface Props {
  rows: TimingRow[];
  onChange: (rows: TimingRow[]) => void;
  rooms?: Room[];
  errors?: Record<string, string>;
}

const DayChips = ({ value, onChange }: { value: Day[]; onChange: (days: Day[]) => void }) => (
  <div className="flex flex-wrap gap-1" role="group" aria-label="Days">
    {DAYS.map(day => {
      const on = value.includes(day);
      return (
        <button
          key={day}
          type="button"
          aria-pressed={on}
          onClick={() => onChange(on ? value.filter(d => d !== day) : sortDays([...value, day]))}
          className={cn(
            'h-9 min-w-11 px-2 rounded-lg text-sm font-medium border transition-colors',
            on ? 'bg-teal-700 border-teal-700 text-white' : 'bg-white border-slate-300 text-slate-600 hover:border-teal-600 hover:text-teal-800'
          )}
        >
          {SHORT_DAY[day]}
        </button>
      );
    })}
  </div>
);

export const WeekTimingEditor = ({ rows, onChange, rooms = [], errors = {} }: Props) => {
  const update = (key: string, patch: Partial<TimingRow>) => onChange(rows.map(r => (r.key === key ? { ...r, ...patch } : r)));
  const showRooms = rooms.length > 1;

  return (
    <div className="space-y-3">
      {rows.length === 0 && (
        <p className="text-sm text-slate-500 rounded-lg border border-dashed border-slate-300 px-4 py-3">
          No weekly timing yet. Add the days and hours the doctor normally sits here.
        </p>
      )}
      {rows.map((row, index) => (
        <div
          key={row.key}
          className={cn('rounded-xl border p-3 sm:p-4 space-y-3', errors[row.key] ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200 bg-slate-50/60')}
        >
          <div className="flex items-start justify-between gap-2">
            <DayChips value={row.days} onChange={days => update(row.key, { days })} />
            <button
              type="button"
              onClick={() => onChange(rows.filter(r => r.key !== row.key))}
              className="p-2 -m-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
              aria-label={`Remove time ${index + 1}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="time"
              step={300}
              value={row.startTime}
              onChange={e => update(row.key, { startTime: e.target.value })}
              className={cn(inputClass, 'h-10 w-32')}
              aria-label="Start time"
            />
            <span className="text-sm text-slate-500">to</span>
            <input
              type="time"
              step={300}
              value={row.endTime}
              onChange={e => update(row.key, { endTime: e.target.value })}
              className={cn(inputClass, 'h-10 w-32')}
              aria-label="End time"
            />
            <div className="flex gap-1 ml-auto sm:ml-2">
              {PRESETS.map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => update(row.key, { startTime: p.startTime, endTime: p.endTime })}
                  className="h-8 px-2.5 rounded-md text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:border-teal-600 hover:text-teal-800"
                >
                  {p.label}
                </button>
              ))}
            </div>
            {showRooms && (
              <select
                value={row.roomId || rooms[0].id}
                onChange={e => update(row.key, { roomId: e.target.value })}
                className={cn(inputClass, 'h-10 w-full sm:w-auto sm:min-w-44')}
                aria-label="Room"
              >
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.roomDesignation || r.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          {errors[row.key] && <p className="text-xs font-medium text-rose-600">{errors[row.key]}</p>}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...rows, newRow({ roomId: rooms[0]?.id ?? '' })])}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-900"
      >
        <Plus className="w-4 h-4" />
        {rows.length ? 'Add another time' : 'Add timing'}
      </button>
    </div>
  );
};
