import { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, ChevronRight, Plus, Search } from 'lucide-react';
import type { Directory } from '../lib/directory';
import { ESTABLISHMENT_TYPES } from '../lib/constants';
import { cn } from '../lib/cn';
import { WithDirectory } from '../components/layout/WithDirectory';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { inputClass } from '../components/ui/Field';
import { Card, EmptyState, PageHeader } from '../components/ui/Layout';

const EstablishmentsView = ({ directory }: { directory: Directory }) => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const term = params.get('q') ?? '';
  const type = params.get('type') ?? '';
  const district = params.get('district') ?? '';

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const districts = [...new Set(directory.establishments.map(e => e.district))].sort();
  const doctorCount = useMemo(() => {
    const counts = new Map<string, number>();
    for (const d of directory.doctors) for (const id of d.affiliatedEstablishmentIds) counts.set(id, (counts.get(id) ?? 0) + 1);
    return counts;
  }, [directory]);

  const list = directory.establishments.filter(e => {
    const q = term.trim().toLowerCase();
    if (type && e.type !== type) return false;
    if (district && e.district !== district) return false;
    return !q || [e.name, e.address, e.subDistrict, e.district, e.pinCode, e.phone].some(v => v.toLowerCase().includes(q));
  });

  return (
    <>
      <PageHeader
        title="Establishments"
        subtitle="Pharmacies, chambers, clinics and hospitals where doctors sit."
        actions={
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/establishments/new')}>
            Add establishment
          </Button>
        }
      />
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input value={term} onChange={e => update('q', e.target.value)} placeholder="Search name, town, PIN or phone" className={cn(inputClass, 'h-10 pl-9')} aria-label="Search establishments" />
        </div>
        <select value={type} onChange={e => update('type', e.target.value)} className={cn(inputClass, 'h-10 w-auto')} aria-label="Type">
          <option value="">All types</option>
          {ESTABLISHMENT_TYPES.map(t => (
            <option key={t}>{t}</option>
          ))}
        </select>
        {districts.length > 1 && (
          <select value={district} onChange={e => update('district', e.target.value)} className={cn(inputClass, 'h-10 w-auto')} aria-label="District">
            <option value="">All districts</option>
            {districts.map(d => (
              <option key={d}>{d}</option>
            ))}
          </select>
        )}
      </div>
      <Card>
        {list.length === 0 ? (
          <EmptyState
            icon={<Building2 className="w-10 h-10" />}
            title="No establishments match"
            action={<Button icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/establishments/new')}>Add establishment</Button>}
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {list.map(e => {
              const count = doctorCount.get(e.id) ?? 0;
              return (
                <li key={e.id}>
                  <Link to={`/establishments/${e.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-500 grid place-items-center shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {e.name}
                        {!e.isActive && <Badge className="ml-2">Hidden</Badge>}
                      </p>
                      <p className="text-sm text-slate-500 truncate">
                        {e.type} · {[e.subDistrict, e.district].filter(Boolean).join(', ')} {e.pinCode}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {count ? (
                        <p className="text-sm text-slate-700">
                          {count} doctor{count === 1 ? '' : 's'}
                        </p>
                      ) : (
                        <Badge tone="amber">No doctors</Badge>
                      )}
                      {e.phone && <p className="hidden sm:block text-xs text-slate-500">{e.phone}</p>}
                    </div>
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

export const EstablishmentsPage = () => <WithDirectory>{directory => <EstablishmentsView directory={directory} />}</WithDirectory>;
