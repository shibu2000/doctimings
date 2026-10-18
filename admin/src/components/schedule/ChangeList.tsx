import { Undo2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useAction, type Directory } from '../../lib/directory';
import type { Override } from '../../lib/types';
import { formatDate, formatRange } from '../../lib/time';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const changeLabel = (o: Override) =>
  o.overrideType === 'unavailable'
    ? { tone: 'red' as const, text: 'Not available' }
    : o.overrideType === 'changed'
      ? { tone: 'amber' as const, text: o.newStartTime && o.newEndTime ? formatRange(o.newStartTime, o.newEndTime) : 'Hours changed' }
      : { tone: 'blue' as const, text: `Extra ${o.newStartTime && o.newEndTime ? formatRange(o.newStartTime, o.newEndTime) : ''}` };

export const ChangeList = ({
  overrides,
  directory,
  show
}: {
  overrides: Override[];
  directory: Directory;
  show: 'doctor' | 'establishment' | 'both' | 'none';
}) => {
  const undo = useAction((id: string) => api.deleteOverride(id), { success: 'Change removed. Regular timing applies again.' });

  return (
    <ul className="divide-y divide-slate-100">
      {overrides.map(o => {
        const label = changeLabel(o);
        const doctor = directory.doctor(o.doctorId);
        const place = directory.establishment(o.establishmentId);
        return (
          <li key={o.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
            <span className="w-24 shrink-0 text-sm font-medium text-slate-900">{formatDate(o.date, directory.today.date)}</span>
            <Badge tone={label.tone}>{label.text}</Badge>
            <span className="flex-1 min-w-40 text-sm text-slate-600">
              {(show === 'doctor' || show === 'both') && <span className="font-medium text-slate-800">{doctor?.fullName} </span>}
              {(show === 'establishment' || show === 'both') && <span>{show === 'both' ? 'at ' : ''}{place?.name} </span>}
              <span className="text-slate-500">· {o.publicReason}</span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              icon={<Undo2 className="w-3.5 h-3.5" />}
              loading={undo.isPending && undo.variables === o.id}
              onClick={() => undo.mutate(o.id)}
            >
              Undo
            </Button>
          </li>
        );
      })}
    </ul>
  );
};
