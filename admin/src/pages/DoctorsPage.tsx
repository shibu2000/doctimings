import { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, Plus, Search, Stethoscope } from 'lucide-react';
import type { Directory } from '../lib/directory';
import { SPECIALTIES } from '../lib/constants';
import { formatDays, formatRange, groupSchedules, relativeTime } from '../lib/time';
import { WithDirectory } from '../components/layout/WithDirectory';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { inputClass } from '../components/ui/Field';
import { Card, EmptyState, PageHeader, Segmented } from '../components/ui/Layout';
import { cn } from '../lib/cn';

type Filter = 'all' | 'review' | 'no-timing' | 'inactive';

const DoctorsView = ({ directory }: { directory: Directory }) => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const term = params.get('q') ?? '';
  const specialty = params.get('specialty') ?? '';
  const filter = (params.get('filter') as Filter) || 'all';

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const counts = {
    all: directory.doctors.filter(d => d.isActive).length,
    review: directory.doctors.filter(d => d.verificationStatus !== 'Verified').length,
    'no-timing': directory.doctors.filter(d => d.isActive && directory.sessionCount(d.id) === 0).length,
    inactive: directory.doctors.filter(d => !d.isActive).length
  };

  const list = useMemo(() => {
    const q = term.trim().toLowerCase();
    return directory.doctors.filter(d => {
      if (filter === 'review') {
        if (d.verificationStatus === 'Verified') return false;
      } else if (filter === 'inactive' ? d.isActive : !d.isActive) return false;
      if (filter === 'no-timing' && directory.sessionCount(d.id) > 0) return false;
      if (specialty && d.specialty !== specialty) return false;
      if (!q) return true;
      const places = directory.sittingsOf(d).map(s => s.establishment.name.toLowerCase());
      return [d.fullName, d.specialty, d.primaryPhone, d.qualifications].some(v => v.toLowerCase().includes(q)) || places.some(p => p.includes(q));
    });
  }, [directory, term, specialty, filter]);

  return (
    <>
      <PageHeader
        title="Doctors"
        subtitle="Each doctor’s places and weekly timing."
        actions={
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/doctors/new')}>
            Add doctor
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            value={term}
            onChange={e => update('q', e.target.value)}
            placeholder="Search name, specialty, phone or place"
            className={cn(inputClass, 'h-10 pl-9')}
            aria-label="Search doctors"
          />
        </div>
        <select value={specialty} onChange={e => update('specialty', e.target.value)} className={cn(inputClass, 'h-10 w-auto')} aria-label="Specialty">
          <option value="">All specialties</option>
          {SPECIALTIES.map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <Segmented
          value={filter}
          onChange={v => update('filter', v === 'all' ? '' : v)}
          options={[
            { value: 'all', label: 'Active', count: counts.all },
            { value: 'review', label: 'Needs review', count: counts.review },
            { value: 'no-timing', label: 'No timing', count: counts['no-timing'] },
            { value: 'inactive', label: 'Inactive', count: counts.inactive }
          ]}
        />
      </div>

      <Card>
        {list.length === 0 ? (
          <EmptyState
            icon={<Stethoscope className="w-10 h-10" />}
            title={term || specialty || filter !== 'all' ? 'No doctors match' : 'No doctors yet'}
            description={term ? 'Try a different spelling, or add the doctor.' : undefined}
            action={
              <Button icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/doctors/new')}>
                Add doctor
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {list.map(d => {
              const sittings = directory.sittingsOf(d);
              return (
                <li key={d.id}>
                  <Link to={`/doctors/${d.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50">
                    <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-800 grid place-items-center text-sm font-semibold shrink-0">
                      {d.fullName.replace(/^dr\.?\s*/i, '').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 grid sm:grid-cols-[minmax(0,14rem)_1fr] gap-x-6 gap-y-1">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {d.fullName}
                          {d.verificationStatus !== 'Verified' && <Badge tone="amber" className="ml-2">Needs review</Badge>}
                          {directory.claimedDoctorIds.includes(d.id) && <Badge tone="teal" className="ml-2">Claimed</Badge>}
                        </p>
                        <p className="text-sm text-slate-500 truncate">{d.specialty}</p>
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        {sittings.length === 0 && <Badge tone="amber">No place added</Badge>}
                        {sittings.map(s => {
                          const groups = groupSchedules(s.sessions.filter(x => x.isActive));
                          return (
                            <p key={s.establishment.id} className="text-sm text-slate-700 truncate">
                              <span className="font-medium">{s.establishment.name}</span>
                              <span className="text-slate-500">
                                {' · '}
                                {groups.length
                                  ? groups.map(g => `${formatDays(g.days)} ${formatRange(g.startTime, g.endTime)}`).join('; ')
                                  : 'no timing'}
                              </span>
                            </p>
                          );
                        })}
                      </div>
                    </div>
                    <span className="hidden md:block text-xs text-slate-400 w-24 text-right">Updated {relativeTime(d.updatedAt)}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
};

export const DoctorsPage = () => <WithDirectory>{directory => <DoctorsView directory={directory} />}</WithDirectory>;
