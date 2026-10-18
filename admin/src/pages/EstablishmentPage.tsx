import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CheckCheck, DoorOpen, MapPin, Pencil, Phone, Plus, Trash2, UserPlus } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useAction, type Directory } from '../lib/directory';
import { mapsUrl } from '../lib/geo';
import { relativeTime } from '../lib/time';
import type { Doctor, Establishment } from '../lib/types';
import { WithDirectory } from '../components/layout/WithDirectory';
import { DoctorPicker } from '../components/doctors/DoctorPicker';
import { EstablishmentAccessCard } from '../components/access/EstablishmentAccessCard';
import { EstablishmentForm } from '../components/establishments/EstablishmentForm';
import { AvailabilityDialog, type AvailabilityPreset } from '../components/schedule/AvailabilityDialog';
import { SittingPanel } from '../components/schedule/SittingPanel';
import { WeekTimingEditor } from '../components/schedule/WeekTimingEditor';
import { newRow, rowsToSessions, validateRows, type TimingRow } from '../components/schedule/timing';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ConfirmDialog, Dialog } from '../components/ui/Dialog';
import { TextInput } from '../components/ui/Field';
import { Card, CardHeader, EmptyState, PageHeader } from '../components/ui/Layout';

const AddDoctorHere = ({ establishment, directory, onDone }: { establishment: Establishment; directory: Directory; onDone: () => void }) => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [rows, setRows] = useState<TimingRow[]>(() => [newRow({ roomId: directory.rooms(establishment.id)[0]?.id ?? '' })]);
  const [submitted, setSubmitted] = useState(false);
  const errors = validateRows(rows);
  const save = useAction(() => api.saveSitting(doctor!.id, establishment.id, rowsToSessions(rows)), {
    success: () => `${doctor?.fullName} added to ${establishment.name}`,
    onDone
  });
  const already = directory.doctors.filter(d => d.affiliatedEstablishmentIds.includes(establishment.id)).map(d => d.id);

  return (
    <div className="px-5 py-4 space-y-4 bg-teal-50/40">
      {doctor ? (
        <>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">{doctor.fullName}</p>
              <p className="text-sm text-slate-500">{doctor.specialty}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setDoctor(null)}>
              Change
            </Button>
          </div>
          <WeekTimingEditor rows={rows} onChange={setRows} rooms={directory.rooms(establishment.id)} errors={submitted ? errors : {}} />
          <div className="flex gap-2">
            <Button
              loading={save.isPending}
              onClick={() => {
                setSubmitted(true);
                if (!Object.keys(errors).length) save.mutate(undefined);
              }}
            >
              Save
            </Button>
            <Button variant="ghost" onClick={onDone}>
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold text-slate-900">Add a doctor who sits here</p>
          <DoctorPicker doctors={directory.doctors} exclude={already} onPick={setDoctor} />
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span>Not in the list?</span>
            <Button variant="secondary" size="sm" icon={<UserPlus className="w-3.5 h-3.5" />} onClick={() => navigate(`/doctors/new?establishment=${establishment.id}`)}>
              Add a new doctor
            </Button>
            <Button variant="ghost" size="sm" onClick={onDone}>
              Cancel
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

const RoomsCard = ({ establishment, directory }: { establishment: Establishment; directory: Directory }) => {
  const rooms = directory.rooms(establishment.id);
  const [name, setName] = useState('');
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const add = useAction(() => api.addRoom(establishment.id, name.trim()), { success: 'Room added', onDone: () => setName('') });
  const rename = useAction(() => api.renameRoom(establishment.id, editing!.id, editing!.name.trim()), { success: 'Room renamed', onDone: () => setEditing(null) });
  const remove = useAction((roomId: string) => api.deleteRoom(establishment.id, roomId), { success: 'Room removed' });

  return (
    <Card>
      <CardHeader title="Rooms" description="Only needed if doctors sit in different rooms here." />
      <ul className="px-5 space-y-1">
        {rooms.map(r => (
          <li key={r.id} className="flex items-center gap-2 py-1">
            {editing?.id === r.id ? (
              <form
                className="flex flex-1 gap-2"
                onSubmit={e => {
                  e.preventDefault();
                  if (editing.name.trim()) rename.mutate(undefined);
                }}
              >
                <TextInput wrapperClassName="flex-1" autoFocus value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} aria-label="Room name" />
                <Button type="submit" size="sm" className="h-10" loading={rename.isPending}>
                  Save
                </Button>
              </form>
            ) : (
              <>
                <DoorOpen className="w-4 h-4 text-slate-400" />
                <span className="flex-1 text-sm text-slate-800">{r.roomDesignation || r.name}</span>
                <Button variant="ghost" size="icon" aria-label={`Rename ${r.name}`} onClick={() => setEditing({ id: r.id, name: r.roomDesignation || r.name })}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                {rooms.length > 1 && (
                  <Button variant="danger-ghost" size="icon" aria-label={`Remove ${r.name}`} loading={remove.isPending && remove.variables === r.id} onClick={() => remove.mutate(r.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
      <form
        className="flex gap-2 px-5 py-4"
        onSubmit={e => {
          e.preventDefault();
          if (name.trim()) add.mutate(undefined);
        }}
      >
        <TextInput wrapperClassName="flex-1" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Room 2, First floor" aria-label="New room name" />
        <Button type="submit" variant="outline" className="h-10" icon={<Plus className="w-4 h-4" />} disabled={!name.trim()} loading={add.isPending}>
          Add
        </Button>
      </form>
    </Card>
  );
};

const EstablishmentView = ({ directory, id }: { directory: Directory; id: string }) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [params, setParams] = useSearchParams();
  const establishment = directory.establishment(id);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [availability, setAvailability] = useState<{ doctor: Doctor; preset: AvailabilityPreset } | null>(null);
  const adding = params.get('add') === 'doctor';
  const setAdding = (value: boolean) => setParams(value ? { add: 'doctor' } : {}, { replace: true });

  const update = useAction((input: Parameters<typeof api.updateEstablishment>[1]) => api.updateEstablishment(id, input), {
    success: 'Establishment saved',
    onDone: () => setEditing(false)
  });
  const markChecked = useAction(() => api.updateEstablishment(id, {}), { success: 'Marked as checked today' });
  const remove = useAction(() => api.deleteEstablishment(id), { success: 'Establishment deleted', onDone: () => navigate('/establishments') });

  if (!establishment) {
    return (
      <Card className="max-w-lg">
        <EmptyState title="Establishment not found" action={<Button onClick={() => navigate('/establishments')}>Back to establishments</Button>} />
      </Card>
    );
  }

  const sittings = directory.doctorsAt(establishment);

  return (
    <>
      <PageHeader
        back={{ to: '/establishments', label: 'Establishments' }}
        title={
          <span className="inline-flex flex-wrap items-center gap-2">
            {establishment.name}
            {!establishment.isActive && <Badge>Hidden from patients</Badge>}
          </span>
        }
        subtitle={
          <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>{establishment.type}</span>
            <a href={mapsUrl(establishment.latitude, establishment.longitude)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-teal-700">
              <MapPin className="w-3.5 h-3.5" />
              {[establishment.address, establishment.subDistrict, establishment.district, establishment.pinCode].filter(Boolean).join(', ')}
            </a>
            {establishment.phone && (
              <a href={`tel:${establishment.phone}`} className="inline-flex items-center gap-1 hover:text-teal-700">
                <Phone className="w-3.5 h-3.5" />
                {establishment.phone}
              </a>
            )}
          </span>
        }
        actions={
          <>
            <Button variant="outline" icon={<Pencil className="w-4 h-4" />} onClick={() => setEditing(true)}>
              Edit details
            </Button>
            {isAdmin && (
              <Button variant="danger-ghost" size="icon" aria-label="Delete establishment" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </>
        }
      />

      <div className="grid lg:grid-cols-[1fr_18rem] gap-6 items-start">
        <Card>
          <CardHeader
            title={`Doctors who sit here (${sittings.length})`}
            actions={
              !adding && (
                <Button variant="secondary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setAdding(true)}>
                  Add doctor here
                </Button>
              )
            }
          />
          <div className="divide-y divide-slate-100 border-t border-slate-100">
            {adding && <AddDoctorHere establishment={establishment} directory={directory} onDone={() => setAdding(false)} />}
            {sittings.map(s => (
              <SittingPanel
                key={s.doctor.id}
                sitting={s}
                directory={directory}
                heading={
                  <Link to={`/doctors/${s.doctor.id}`} className="hover:text-teal-700">
                    {s.doctor.fullName}
                  </Link>
                }
                subheading={s.doctor.specialty}
                onChangeDay={() => setAvailability({ doctor: s.doctor, preset: { establishmentId: establishment.id, mode: 'away' } })}
              />
            ))}
            {sittings.length === 0 && !adding && (
              <EmptyState
                title="No doctors added yet"
                description="Add the doctors who visit this place and their days and hours."
                action={<Button icon={<Plus className="w-4 h-4" />} onClick={() => setAdding(true)}>Add doctor here</Button>}
              />
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Last checked</p>
              <p className="text-sm text-slate-800">{relativeTime(establishment.updatedAt)}</p>
              <Button variant="secondary" size="sm" className="mt-2" icon={<CheckCheck className="w-3.5 h-3.5" />} loading={markChecked.isPending} onClick={() => markChecked.mutate(undefined)}>
                Details are still correct
              </Button>
              {(establishment.proprietorName || establishment.licenseNumber) && (
                <dl className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-sm">
                  {establishment.proprietorName && (
                    <div>
                      <dt className="text-xs text-slate-500">Owner / contact</dt>
                      <dd className="text-slate-800">{establishment.proprietorName}</dd>
                    </div>
                  )}
                  {establishment.licenseNumber && (
                    <div>
                      <dt className="text-xs text-slate-500">Licence</dt>
                      <dd className="text-slate-800">{establishment.licenseNumber}</dd>
                    </div>
                  )}
                </dl>
              )}
            </div>
          </Card>
          <EstablishmentAccessCard establishment={establishment} />
          <RoomsCard establishment={establishment} directory={directory} />
        </div>
      </div>

      <Dialog
        open={editing}
        onClose={() => setEditing(false)}
        title="Edit establishment"
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" form="edit-establishment" loading={update.isPending}>
              Save
            </Button>
          </>
        }
      >
        {editing && <EstablishmentForm formId="edit-establishment" initial={establishment} onSubmit={input => update.mutate(input)} />}
      </Dialog>
      {availability && (
        <AvailabilityDialog onClose={() => setAvailability(null)} doctor={availability.doctor} directory={directory} preset={availability.preset} />
      )}
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => remove.mutate(undefined)}
        loading={remove.isPending}
        title={`Delete ${establishment.name}?`}
        description={`This removes the establishment and the weekly timing of ${sittings.length} doctor${sittings.length === 1 ? '' : 's'} here. The doctors themselves are kept. This cannot be undone.`}
        confirmLabel="Delete permanently"
      />
    </>
  );
};

export const EstablishmentPage = () => {
  const { id = '' } = useParams();
  return <WithDirectory>{directory => <EstablishmentView directory={directory} id={id} />}</WithDirectory>;
};
