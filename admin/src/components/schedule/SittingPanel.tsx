import { useState, type ReactNode } from 'react';
import { CalendarCog, Pencil, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useAction, type Directory, type Sitting } from '../../lib/directory';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/Dialog';
import { ChangeList } from './ChangeList';
import { TimingSummary } from './TimingSummary';
import { WeekTimingEditor } from './WeekTimingEditor';
import { rowsFromSchedules, rowsToSessions, validateRows, type TimingRow } from './timing';

interface Props {
  sitting: Sitting;
  directory: Directory;
  heading: ReactNode;
  subheading?: ReactNode;
  onChangeDay: () => void;
}

export const SittingPanel = ({ sitting, directory, heading, subheading, onChangeDay }: Props) => {
  const { doctor, establishment, sessions, overrides } = sitting;
  const rooms = directory.rooms(establishment.id);
  const [editing, setEditing] = useState(sessions.length === 0);
  const [rows, setRows] = useState<TimingRow[]>(() => rowsFromSchedules(sessions));
  const [showErrors, setShowErrors] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const errors = validateRows(rows);
  const hasErrors = Object.keys(errors).length > 0;

  const save = useAction(() => api.saveSitting(doctor.id, establishment.id, rowsToSessions(rows)), {
    success: 'Weekly timing saved',
    onDone: () => setEditing(false)
  });
  const remove = useAction(() => api.removeSitting(doctor.id, establishment.id), {
    success: `${doctor.fullName} removed from ${establishment.name}`
  });

  const startEditing = () => {
    setRows(rowsFromSchedules(sessions));
    setShowErrors(false);
    setEditing(true);
  };

  return (
    <div className="px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-base font-semibold text-slate-900">{heading}</div>
          {subheading && <div className="text-sm text-slate-500">{subheading}</div>}
        </div>
        {!editing && (
          <div className="flex flex-wrap gap-1.5">
            <Button variant="outline" size="sm" icon={<Pencil className="w-3.5 h-3.5" />} onClick={startEditing}>
              Edit timing
            </Button>
            <Button variant="outline" size="sm" icon={<CalendarCog className="w-3.5 h-3.5" />} onClick={onChangeDay} disabled={!sessions.length}>
              Change a day
            </Button>
            <Button variant="danger-ghost" size="icon" onClick={() => setConfirmRemove(true)} aria-label="Remove">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="mt-3">
        {editing ? (
          <div className="space-y-4">
            <WeekTimingEditor rows={rows} onChange={setRows} rooms={rooms} errors={showErrors ? errors : {}} />
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                loading={save.isPending}
                onClick={() => {
                  setShowErrors(true);
                  if (!hasErrors) save.mutate(undefined);
                }}
              >
                Save timing
              </Button>
              {sessions.length > 0 && (
                <Button variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        ) : (
          <TimingSummary sessions={sessions} rooms={rooms} />
        )}
      </div>

      {overrides.length > 0 && !editing && (
        <div className="mt-3 rounded-lg bg-slate-50 px-3">
          <ChangeList overrides={overrides} directory={directory} show="none" />
        </div>
      )}

      <ConfirmDialog
        open={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        onConfirm={() => remove.mutate(undefined)}
        loading={remove.isPending}
        title="Remove from this place?"
        description={`${doctor.fullName} will no longer be listed at ${establishment.name}. Their weekly timing and upcoming changes there will be deleted.`}
        confirmLabel="Remove"
      />
    </div>
  );
};
