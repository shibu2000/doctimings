import { useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarOff, ChevronLeft, ChevronRight, Clock4, MessageSquareWarning, Plus, Stethoscope, Undo2 } from 'lucide-react';
import { api } from '../lib/api';
import { useAction, type Directory } from '../lib/directory';
import { nowMinutesIst, sessionsOn, upcomingChanges, type DaySession } from '../lib/today';
import { addDays, formatDate, formatLongDate, formatRange, toMinutes } from '../lib/time';
import type { Doctor } from '../lib/types';
import { cn } from '../lib/cn';
import { WithDirectory } from '../components/layout/WithDirectory';
import { AvailabilityDialog, type AvailabilityPreset } from '../components/schedule/AvailabilityDialog';
import { ChangeList } from '../components/schedule/ChangeList';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, EmptyState, PageHeader } from '../components/ui/Layout';

const Stat = ({ label, value, to, tone = 'slate', icon }: { label: string; value: number; to?: string; tone?: 'slate' | 'amber' | 'red'; icon: ReactNode }) => {
  const body = (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 h-full hover:border-slate-300 transition-colors">
      <div className={cn('w-9 h-9 rounded-lg grid place-items-center', tone === 'amber' ? 'bg-amber-50 text-amber-600' : tone === 'red' ? 'bg-rose-50 text-rose-600' : 'bg-teal-50 text-teal-700')}>
        {icon}
      </div>
      <div>
        <p className="text-xl font-semibold text-slate-900 tabular-nums leading-tight">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
  return to ? <Link to={to}>{body}</Link> : body;
};

const SessionRow = ({
  session,
  isToday,
  now,
  onAway
}: {
  session: DaySession;
  isToday: boolean;
  now: number;
  onAway: (s: DaySession) => void;
}) => {
  const undo = useAction((id: string) => api.deleteOverride(id), { success: 'Back to regular timing' });
  const ended = isToday && toMinutes(session.endTime) <= now;
  const live = isToday && !ended && toMinutes(session.startTime) <= now && session.status !== 'away';

  return (
    <li className={cn('flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3', ended && 'opacity-55')}>
      <div className="w-28 shrink-0">
        <p className={cn('text-sm font-semibold tabular-nums', session.status === 'away' ? 'text-slate-400 line-through' : 'text-slate-900')}>
          {formatRange(session.startTime, session.endTime)}
        </p>
        {live && <p className="text-xs font-medium text-emerald-700">Sitting now</p>}
        {ended && <p className="text-xs text-slate-500">Finished</p>}
      </div>
      <div className="flex-1 min-w-48">
        <Link to={`/doctors/${session.doctor.id}`} className="text-sm font-medium text-slate-900 hover:text-teal-700">
          {session.doctor.fullName}
        </Link>
        <p className="text-sm text-slate-500">
          {session.doctor.specialty} ·{' '}
          <Link to={`/establishments/${session.establishment.id}`} className="hover:text-teal-700">
            {session.establishment.name}
          </Link>
        </p>
      </div>
      <div className="flex items-center gap-2">
        {session.status === 'away' && <Badge tone="red">Not available · {session.override?.publicReason}</Badge>}
        {session.status === 'changed' && session.regular && <Badge tone="amber">Changed from {formatRange(session.regular.startTime, session.regular.endTime)}</Badge>}
        {session.status === 'extra' && <Badge tone="blue">Extra session</Badge>}
        {session.override ? (
          <Button variant="ghost" size="sm" icon={<Undo2 className="w-3.5 h-3.5" />} loading={undo.isPending} onClick={() => undo.mutate(session.override!.id)}>
            Undo
          </Button>
        ) : (
          !ended && (
            <Button variant="outline" size="sm" icon={<CalendarOff className="w-3.5 h-3.5" />} onClick={() => onAway(session)}>
              Not available
            </Button>
          )
        )}
      </div>
    </li>
  );
};

const TodayView = ({ directory }: { directory: Directory }) => {
  const navigate = useNavigate();
  const today = directory.today.date;
  const [date, setDate] = useState(today);
  const [dialog, setDialog] = useState<{ doctor: Doctor; preset: AvailabilityPreset } | null>(null);

  const sessions = useMemo(() => sessionsOn(directory, date), [directory, date]);
  const todaySessions = useMemo(() => (date === today ? sessions : sessionsOn(directory, today)), [directory, sessions, date, today]);
  const upcoming = useMemo(() => upcomingChanges(directory, 14), [directory]);
  const noTiming = directory.doctors.filter(d => d.isActive && directory.sessionCount(d.id) === 0);
  const now = nowMinutesIst();
  const isToday = date === today;

  return (
    <>
      <PageHeader
        title={formatLongDate(today)}
        subtitle="Who is sitting where today. Mark changes as soon as you hear about them."
        actions={
          <>
            <Button variant="outline" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/establishments/new')}>
              Establishment
            </Button>
            <Button icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/doctors/new')}>
              Add doctor
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat label="Sessions today" value={todaySessions.filter(s => s.status !== 'away').length} icon={<Clock4 className="w-5 h-5" />} />
        <Stat label="Not available today" value={todaySessions.filter(s => s.status === 'away').length} tone="red" icon={<CalendarOff className="w-5 h-5" />} />
        <Stat label="Doctors without timing" value={noTiming.length} tone="amber" to="/doctors?filter=no-timing" icon={<Stethoscope className="w-5 h-5" />} />
        <Stat label="Reports & claims to check" value={directory.pendingReports + directory.pendingClaims} tone="amber" to="/reports" icon={<MessageSquareWarning className="w-5 h-5" />} />
      </div>

      <div className="grid lg:grid-cols-[1fr_20rem] gap-6 items-start">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">
              Sessions · {formatDate(date, today)}
              {!isToday && <span className="font-normal text-slate-500"> ({formatLongDate(date)})</span>}
            </h2>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" aria-label="Previous day" disabled={date <= today} onClick={() => setDate(addDays(date, -1))}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {!isToday && (
                <Button variant="ghost" size="sm" onClick={() => setDate(today)}>
                  Today
                </Button>
              )}
              <Button variant="ghost" size="icon" aria-label="Next day" onClick={() => setDate(addDays(date, 1))}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {sessions.length ? (
            <ul className="divide-y divide-slate-100">
              {sessions.map(s => (
                <SessionRow
                  key={s.key}
                  session={s}
                  isToday={isToday}
                  now={now}
                  onAway={session =>
                    setDialog({ doctor: session.doctor, preset: { establishmentId: session.establishment.id, date, mode: 'away' } })
                  }
                />
              ))}
            </ul>
          ) : (
            <EmptyState icon={<Clock4 className="w-10 h-10" />} title="No sessions on this day" description="No doctor has weekly timing for this day yet." />
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Coming up" description="Changes in the next 14 days" />
            <div className="px-5 pb-3">
              {upcoming.length ? (
                <ChangeList overrides={upcoming} directory={directory} show="doctor" />
              ) : (
                <p className="text-sm text-slate-500 pb-2">No changes planned.</p>
              )}
            </div>
          </Card>
          {noTiming.length > 0 && (
            <Card>
              <CardHeader title="Needs weekly timing" description="Patients can’t see when these doctors sit." />
              <ul className="px-5 pb-4 space-y-1.5">
                {noTiming.slice(0, 6).map(d => (
                  <li key={d.id}>
                    <Link to={`/doctors/${d.id}`} className="text-sm font-medium text-teal-700 hover:underline">
                      {d.fullName}
                    </Link>
                    <span className="text-sm text-slate-500"> · {d.specialty}</span>
                  </li>
                ))}
                {noTiming.length > 6 && (
                  <li>
                    <Link to="/doctors?filter=no-timing" className="text-sm text-slate-500 hover:text-teal-700">
                      and {noTiming.length - 6} more
                    </Link>
                  </li>
                )}
              </ul>
            </Card>
          )}
        </div>
      </div>

      {dialog && (
        <AvailabilityDialog onClose={() => setDialog(null)} doctor={dialog.doctor} directory={directory} preset={dialog.preset} />
      )}
    </>
  );
};

export const TodayPage = () => <WithDirectory>{directory => <TodayView directory={directory} />}</WithDirectory>;
