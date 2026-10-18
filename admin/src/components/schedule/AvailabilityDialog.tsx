import { useState } from 'react';
import { CalendarOff, CalendarClock, CalendarPlus, Info } from 'lucide-react';
import { api } from '../../lib/api';
import { useAction, type Directory } from '../../lib/directory';
import { AWAY_REASONS } from '../../lib/constants';
import type { Doctor } from '../../lib/types';
import { addDays, dayOfDate, formatDate, formatRange, nextDateFor, SHORT_DAY, toMinutes } from '../../lib/time';
import { cn } from '../../lib/cn';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { SelectInput, TextInput, inputClass } from '../ui/Field';

export type AvailabilityMode = 'away' | 'changed' | 'extra';

export interface AvailabilityPreset {
  establishmentId?: string;
  date?: string;
  mode?: AvailabilityMode;
}

interface Props {
  onClose: () => void;
  doctor: Doctor;
  directory: Directory;
  preset?: AvailabilityPreset;
}

const MODES: { value: AvailabilityMode; label: string; icon: typeof CalendarOff; hint: string }[] = [
  { value: 'away', label: 'Not available', icon: CalendarOff, hint: 'Leave, illness, holiday' },
  { value: 'changed', label: 'Different hours', icon: CalendarClock, hint: 'Same day, new time' },
  { value: 'extra', label: 'Extra session', icon: CalendarPlus, hint: 'A day they normally don’t sit' }
];

export const AvailabilityDialog = ({ onClose, doctor, directory, preset }: Props) => {
  const today = directory.today.date;
  const sittings = directory.sittingsOf(doctor);

  const regularOn = (establishmentId: string, iso: string) =>
    sittings.find(s => s.establishment.id === establishmentId)?.sessions.filter(s => s.isActive && s.dayOfWeek === dayOfDate(iso)) ?? [];

  const initial = (() => {
    const chosen = preset?.establishmentId ? [preset.establishmentId] : sittings.map(s => s.establishment.id);
    const upcoming = sittings
      .filter(s => chosen.includes(s.establishment.id))
      .flatMap(s => s.sessions.map(x => nextDateFor(x.dayOfWeek, today)))
      .sort();
    const date = preset?.date ?? upcoming[0] ?? today;
    const place = preset?.establishmentId ?? sittings[0]?.establishment.id ?? '';
    const regular = place ? regularOn(place, date)[0] : undefined;
    return { chosen, date, place, startTime: regular?.startTime ?? '17:00', endTime: regular?.endTime ?? '20:00' };
  })();

  const [mode, setMode] = useState<AvailabilityMode>(preset?.mode ?? 'away');
  const [places, setPlaces] = useState<string[]>(initial.chosen);
  const [from, setFrom] = useState(initial.date);
  const [to, setTo] = useState(initial.date);
  const [reason, setReason] = useState(AWAY_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [place, setPlace] = useState(initial.place);
  const [date, setDate] = useState(initial.date);
  const [startTime, setStartTime] = useState(initial.startTime);
  const [endTime, setEndTime] = useState(initial.endTime);
  const [note, setNote] = useState('');

  const pickDay = (nextPlace: string, nextDate: string) => {
    setPlace(nextPlace);
    setDate(nextDate);
    const regular = regularOn(nextPlace, nextDate)[0];
    if (regular) {
      setStartTime(regular.startTime);
      setEndTime(regular.endTime);
    }
  };

  const affected: { date: string; name: string; range: string }[] = [];
  if (mode === 'away' && from && to && to >= from) {
    for (let d = from < today ? today : from; d <= to && affected.length < 200; d = addDays(d, 1)) {
      for (const id of places) {
        for (const s of regularOn(id, d)) {
          affected.push({ date: d, name: directory.establishment(id)?.name ?? '', range: formatRange(s.startTime, s.endTime) });
        }
      }
    }
  }

  const close = () => onClose();
  const awayAction = useAction(
    () => api.markAway(doctor.id, { from, to, establishmentIds: places, reason: reason === 'Other' ? customReason : reason }),
    { success: created => `${doctor.fullName} marked not available for ${created.length} session day${created.length === 1 ? '' : 's'}`, onDone: close }
  );
  const overrideAction = useAction(
    () =>
      api.createOverride({
        doctorId: doctor.id,
        establishmentId: place,
        date,
        overrideType: mode === 'changed' ? 'changed' : 'additional',
        newStartTime: startTime,
        newEndTime: endTime,
        publicReason: note.trim() || (mode === 'changed' ? 'Timing changed for this day' : 'Extra session')
      }),
    { success: mode === 'changed' ? 'Hours changed for that day' : 'Extra session added', onDone: close }
  );

  const regular = place ? regularOn(place, date) : [];
  const timeError = startTime && endTime && toMinutes(startTime) >= toMinutes(endTime) ? 'End time must be after start time' : '';
  const awayReason = reason === 'Other' ? customReason.trim() : reason;

  const awayInvalid = !places.length || !from || !to || to < from || affected.length === 0 || awayReason.length < 3;
  const overrideInvalid = !place || !date || date < today || Boolean(timeError);

  if (!sittings.length) {
    return (
      <Dialog open onClose={onClose} title="Change availability" size="md">
        <p className="text-sm text-slate-600">Add at least one place and weekly timing for this doctor first.</p>
      </Dialog>
    );
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={`Change availability · ${doctor.fullName}`}
      description="Weekly timing stays the same. This only changes specific dates."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {mode === 'away' ? (
            <Button onClick={() => awayAction.mutate(undefined)} loading={awayAction.isPending} disabled={awayInvalid}>
              Mark not available
            </Button>
          ) : (
            <Button onClick={() => overrideAction.mutate(undefined)} loading={overrideAction.isPending} disabled={overrideInvalid}>
              {mode === 'changed' ? 'Save new hours' : 'Add extra session'}
            </Button>
          )}
        </>
      }
    >
      <div className="grid grid-cols-3 gap-2 mb-5">
        {MODES.map(m => (
          <button
            key={m.value}
            type="button"
            onClick={() => {
              setMode(m.value);
              if (m.value === 'changed') pickDay(place, date);
            }}
            aria-pressed={mode === m.value}
            className={cn(
              'rounded-xl border p-3 text-left transition-colors',
              mode === m.value ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600' : 'border-slate-200 hover:border-slate-300'
            )}
          >
            <m.icon className={cn('w-5 h-5 mb-1.5', mode === m.value ? 'text-teal-700' : 'text-slate-400')} />
            <span className="block text-sm font-semibold text-slate-900">{m.label}</span>
            <span className="hidden sm:block text-xs text-slate-500">{m.hint}</span>
          </button>
        ))}
      </div>

      {mode === 'away' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <TextInput
              label="From"
              type="date"
              min={today}
              value={from}
              onChange={e => {
                setFrom(e.target.value);
                if (e.target.value > to) setTo(e.target.value);
              }}
            />
            <TextInput label="To" type="date" min={from || today} value={to} onChange={e => setTo(e.target.value)} />
          </div>

          {sittings.length > 1 && (
            <fieldset>
              <legend className="text-sm font-medium text-slate-700 mb-1.5">Where</legend>
              <div className="space-y-1.5">
                {sittings.map(s => (
                  <label key={s.establishment.id} className="flex items-center gap-2.5 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-teal-700"
                      checked={places.includes(s.establishment.id)}
                      onChange={e =>
                        setPlaces(list => (e.target.checked ? [...list, s.establishment.id] : list.filter(id => id !== s.establishment.id)))
                      }
                    />
                    {s.establishment.name}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <fieldset>
            <legend className="text-sm font-medium text-slate-700 mb-1.5">Reason shown to patients</legend>
            <div className="flex flex-wrap gap-1.5">
              {[...AWAY_REASONS, 'Other'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  aria-pressed={reason === r}
                  className={cn(
                    'h-8 px-3 rounded-full text-sm border',
                    reason === r ? 'bg-teal-700 border-teal-700 text-white' : 'border-slate-300 text-slate-700 hover:border-teal-600'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
            {reason === 'Other' && (
              <TextInput
                wrapperClassName="mt-2"
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
                placeholder="e.g. Back after Durga Puja"
                maxLength={200}
              />
            )}
          </fieldset>

          <div className={cn('rounded-lg px-3 py-2.5 text-sm', affected.length ? 'bg-amber-50 text-amber-900' : 'bg-slate-100 text-slate-600')}>
            {affected.length ? (
              <>
                <p className="font-medium">
                  {affected.length} session{affected.length === 1 ? '' : 's'} will show as not available:
                </p>
                <ul className="mt-1 space-y-0.5">
                  {affected.slice(0, 6).map(a => (
                    <li key={`${a.date}-${a.name}-${a.range}`}>
                      {formatDate(a.date, today)} · {a.range}
                      {places.length > 1 && <span className="text-amber-800/80"> · {a.name}</span>}
                    </li>
                  ))}
                  {affected.length > 6 && <li>and {affected.length - 6} more</li>}
                </ul>
              </>
            ) : (
              'The doctor has no regular sessions in this period at the selected places.'
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <SelectInput label="Where" value={place} onChange={e => pickDay(e.target.value, date)}>
              {sittings.map(s => (
                <option key={s.establishment.id} value={s.establishment.id}>
                  {s.establishment.name}
                </option>
              ))}
            </SelectInput>
            <TextInput label="Date" type="date" min={today} value={date} onChange={e => pickDay(place, e.target.value)} />
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-slate-100 px-3 py-2.5 text-sm text-slate-700">
            <Info className="w-4 h-4 mt-0.5 text-slate-500 shrink-0" />
            {regular.length ? (
              <span>
                Normally on {SHORT_DAY[dayOfDate(date)]}: {regular.map(s => formatRange(s.startTime, s.endTime)).join(', ')}
              </span>
            ) : (
              <span>
                No regular session on {SHORT_DAY[dayOfDate(date)]}.
                {mode === 'changed' && ' Use “Extra session” to add one.'}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 mb-1.5">{mode === 'changed' ? 'New hours' : 'Hours'}</p>
            <div className="flex items-center gap-2">
              <input type="time" step={300} value={startTime} onChange={e => setStartTime(e.target.value)} className={cn(inputClass, 'h-10 w-32')} aria-label="Start time" />
              <span className="text-sm text-slate-500">to</span>
              <input type="time" step={300} value={endTime} onChange={e => setEndTime(e.target.value)} className={cn(inputClass, 'h-10 w-32')} aria-label="End time" />
            </div>
            {timeError && <p className="mt-1.5 text-xs font-medium text-rose-600">{timeError}</p>}
          </div>
          <TextInput
            label="Note for patients (optional)"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={mode === 'changed' ? 'e.g. Starting late due to hospital duty' : 'e.g. Special Sunday clinic'}
            maxLength={300}
          />
        </div>
      )}
    </Dialog>
  );
};
