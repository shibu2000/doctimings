import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BadgeCheck, CalendarOff, CheckCheck, MoreHorizontal, Pencil, Phone, Plus, Power, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useAction, type Directory } from '../lib/directory';
import { daysSince, relativeTime } from '../lib/time';
import type { Doctor } from '../lib/types';
import { WithDirectory } from '../components/layout/WithDirectory';
import { DoctorAccessCard } from '../components/access/DoctorAccessCard';
import { DoctorFields, draftFromDoctor, draftToInput, validateDoctor } from '../components/doctors/DoctorFields';
import { EstablishmentPicker } from '../components/establishments/EstablishmentPicker';
import { NewEstablishmentDialog } from '../components/establishments/NewEstablishmentDialog';
import { AvailabilityDialog, type AvailabilityPreset } from '../components/schedule/AvailabilityDialog';
import { ChangeList } from '../components/schedule/ChangeList';
import { SittingPanel } from '../components/schedule/SittingPanel';
import { WeekTimingEditor } from '../components/schedule/WeekTimingEditor';
import { newRow, rowsToSessions, validateRows, type TimingRow } from '../components/schedule/timing';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ConfirmDialog, Dialog } from '../components/ui/Dialog';
import { Card, CardHeader, EmptyState, PageHeader } from '../components/ui/Layout';

const EditDoctorDialog = ({ doctor, directory, onClose }: { doctor: Doctor; directory: Directory; onClose: () => void }) => {
  const [draft, setDraft] = useState(() => draftFromDoctor(doctor));
  const [submitted, setSubmitted] = useState(false);
  const errors = validateDoctor(draft);
  const save = useAction(() => api.updateDoctor(doctor.id, draftToInput(draft)), { success: 'Doctor details saved', onDone: onClose });
  const duplicateName = directory.doctors.some(d => d.id !== doctor.id && d.fullName.toLowerCase() === draft.fullName.trim().toLowerCase());

  return (
    <Dialog
      open
      onClose={onClose}
      title="Edit doctor details"
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={save.isPending}
            onClick={() => {
              setSubmitted(true);
              if (!Object.values(errors).some(Boolean)) save.mutate(undefined);
            }}
          >
            Save
          </Button>
        </>
      }
    >
      <DoctorFields value={draft} onChange={setDraft} errors={submitted ? errors : {}} />
      {duplicateName && <p className="mt-3 text-sm text-amber-700">Another doctor already has this exact name.</p>}
    </Dialog>
  );
};

const AddPlace = ({ doctor, directory, onDone }: { doctor: Doctor; directory: Directory; onDone: () => void }) => {
  const [establishmentId, setEstablishmentId] = useState('');
  const [rows, setRows] = useState<TimingRow[]>([newRow()]);
  const [submitted, setSubmitted] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);
  const errors = validateRows(rows);
  const save = useAction(() => api.saveSitting(doctor.id, establishmentId, rowsToSessions(rows)), {
    success: 'Place and timing added',
    onDone
  });
  const anchor = directory.sittingsOf(doctor)[0]?.establishment;

  return (
    <div className="px-5 py-4 space-y-4 bg-teal-50/40">
      <p className="text-sm font-semibold text-slate-900">Add a place</p>
      <EstablishmentPicker
        establishments={directory.establishments}
        value={establishmentId}
        exclude={doctor.affiliatedEstablishmentIds}
        onChange={id => {
          setEstablishmentId(id);
          setRows(r => r.map(x => ({ ...x, roomId: directory.rooms(id)[0]?.id ?? '' })));
        }}
        onCreate={name => setCreating(name)}
        autoFocus
      />
      {establishmentId && (
        <WeekTimingEditor rows={rows} onChange={setRows} rooms={directory.rooms(establishmentId)} errors={submitted ? errors : {}} />
      )}
      <div className="flex gap-2">
        <Button
          disabled={!establishmentId}
          loading={save.isPending}
          onClick={() => {
            setSubmitted(true);
            if (!Object.keys(errors).length) save.mutate(undefined);
          }}
        >
          Save place
        </Button>
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
      <NewEstablishmentDialog
        open={creating !== null}
        onClose={() => setCreating(null)}
        initialName={creating ?? ''}
        defaults={anchor ? { district: anchor.district, subDistrict: anchor.subDistrict } : undefined}
        onCreated={e => setEstablishmentId(e.id)}
      />
    </div>
  );
};

const DoctorView = ({ directory, id }: { directory: Directory; id: string }) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const doctor = directory.doctor(id);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [menu, setMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityPreset | null>(null);

  const markChecked = useAction(() => api.updateDoctor(id, {}), { success: 'Marked as checked today' });
  const toggleActive = useAction(() => api.updateDoctor(id, { isActive: !doctor?.isActive }), {
    success: () => (doctor?.isActive ? 'Doctor hidden from patients' : 'Doctor visible to patients again')
  });
  const verify = useAction(() => api.updateDoctor(id, { verificationStatus: 'Verified' }), { success: 'Marked as verified' });
  const remove = useAction(() => api.deleteDoctor(id), { success: 'Doctor deleted', onDone: () => navigate('/doctors') });

  if (!doctor) {
    return (
      <Card className="max-w-lg">
        <EmptyState title="Doctor not found" description="They may have been deleted." action={<Button onClick={() => navigate('/doctors')}>Back to doctors</Button>} />
      </Card>
    );
  }

  const sittings = directory.sittingsOf(doctor);
  const changes = directory.overridesOf(doctor.id);
  const stale = daysSince(doctor.updatedAt) > 45;

  return (
    <>
      <PageHeader
        back={{ to: '/doctors', label: 'Doctors' }}
        title={
          <span className="inline-flex flex-wrap items-center gap-2">
            {doctor.fullName}
            {!doctor.isActive && <Badge tone="slate">Hidden from patients</Badge>}
            {doctor.verificationStatus !== 'Verified' && (
              <Badge tone="amber">
                {doctor.verificationStatus === 'Needs Review' ? 'Needs review · hidden from patients until verified' : doctor.verificationStatus}
              </Badge>
            )}
          </span>
        }
        subtitle={
          <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>{[doctor.specialty, doctor.qualifications].filter(Boolean).join(' · ')}</span>
            {doctor.primaryPhone && (
              <a href={`tel:${doctor.primaryPhone}`} className="inline-flex items-center gap-1 hover:text-teal-700">
                <Phone className="w-3.5 h-3.5" />
                {doctor.primaryPhone}
              </a>
            )}
          </span>
        }
        actions={
          <>
            <Button icon={<CalendarOff className="w-4 h-4" />} onClick={() => setAvailability({ mode: 'away' })} disabled={!sittings.some(s => s.sessions.length)}>
              Mark not available
            </Button>
            <Button variant="outline" icon={<Pencil className="w-4 h-4" />} onClick={() => setEditing(true)}>
              Edit details
            </Button>
            <div className="relative">
              <Button variant="outline" size="icon" aria-label="More actions" onClick={() => setMenu(m => !m)}>
                <MoreHorizontal className="w-4 h-4" />
              </Button>
              {menu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                  <div className="absolute right-0 z-20 mt-1 w-56 rounded-xl border border-slate-200 bg-white shadow-lg py-1">
                    {doctor.verificationStatus !== 'Verified' && (
                      <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => { setMenu(false); verify.mutate(undefined); }}>
                        <BadgeCheck className="w-4 h-4" /> Mark as verified
                      </button>
                    )}
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => { setMenu(false); toggleActive.mutate(undefined); }}>
                      <Power className="w-4 h-4" /> {doctor.isActive ? 'Hide from patients' : 'Show to patients'}
                    </button>
                    {isAdmin && (
                      <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-700 hover:bg-rose-50" onClick={() => { setMenu(false); setConfirmDelete(true); }}>
                        <Trash2 className="w-4 h-4" /> Delete doctor
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        }
      />

      <div className="grid lg:grid-cols-[1fr_18rem] gap-6 items-start">
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Where and when"
              description="Regular weekly timing at each place."
              actions={
                !adding && (
                  <Button variant="secondary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setAdding(true)}>
                    Add place
                  </Button>
                )
              }
            />
            <div className="divide-y divide-slate-100 border-t border-slate-100">
              {sittings.map(s => (
                <SittingPanel
                  key={s.establishment.id}
                  sitting={s}
                  directory={directory}
                  heading={
                    <Link to={`/establishments/${s.establishment.id}`} className="hover:text-teal-700">
                      {s.establishment.name}
                    </Link>
                  }
                  subheading={`${s.establishment.type} · ${[s.establishment.subDistrict, s.establishment.district].filter(Boolean).join(', ')}`}
                  onChangeDay={() => setAvailability({ establishmentId: s.establishment.id, mode: 'away' })}
                />
              ))}
              {sittings.length === 0 && !adding && (
                <EmptyState
                  title="No place added yet"
                  description="Add the pharmacy or chamber where this doctor sits, with their days and hours."
                  action={<Button icon={<Plus className="w-4 h-4" />} onClick={() => setAdding(true)}>Add place</Button>}
                />
              )}
              {adding && <AddPlace doctor={doctor} directory={directory} onDone={() => setAdding(false)} />}
            </div>
          </Card>

          <Card>
            <CardHeader title="Upcoming changes" description="Leave, changed hours and extra sessions." />
            <div className="px-5 pb-3">
              {changes.length ? (
                <ChangeList overrides={changes} directory={directory} show={sittings.length > 1 ? 'establishment' : 'none'} />
              ) : (
                <p className="text-sm text-slate-500 pb-2">Nothing planned. Regular timing applies.</p>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
        <Card>
          <div className="px-5 py-4 space-y-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Last checked</p>
              <p className={stale ? 'text-sm font-medium text-amber-700' : 'text-sm text-slate-800'}>{relativeTime(doctor.updatedAt)}</p>
              <Button variant="secondary" size="sm" className="mt-2" icon={<CheckCheck className="w-3.5 h-3.5" />} loading={markChecked.isPending} onClick={() => markChecked.mutate(undefined)}>
                Details are still correct
              </Button>
            </div>
            <dl className="space-y-2 text-sm border-t border-slate-100 pt-3">
              {[
                ['Registration', [doctor.registrationNumber, doctor.registrationNumber && doctor.council].filter(Boolean).join(' · ')],
                ['Experience', doctor.experienceYears ? `${doctor.experienceYears} years` : ''],
                ['Languages', doctor.languages.join(', ')],
                ['Email', doctor.email ?? '']
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="text-slate-800 break-words">{value || <span className="text-slate-400">Not added</span>}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Card>
        <DoctorAccessCard doctor={doctor} />
        </div>
      </div>

      {editing && <EditDoctorDialog doctor={doctor} directory={directory} onClose={() => setEditing(false)} />}
      {availability && (
        <AvailabilityDialog onClose={() => setAvailability(null)} doctor={doctor} directory={directory} preset={availability} />
      )}
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => remove.mutate(undefined)}
        loading={remove.isPending}
        title={`Delete ${doctor.fullName}?`}
        description="This removes the doctor, their weekly timing at every place, and all planned changes. This cannot be undone. To stop showing them temporarily, use “Hide from patients” instead."
        confirmLabel="Delete permanently"
      />
    </>
  );
};

export const DoctorPage = () => {
  const { id = '' } = useParams();
  return <WithDirectory>{directory => <DoctorView directory={directory} id={id} />}</WithDirectory>;
};
