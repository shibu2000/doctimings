import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { useAction, type Directory } from '../lib/directory';
import { useToast } from '../components/ui/Toast';
import { WithDirectory } from '../components/layout/WithDirectory';
import { DoctorFields, draftToInput, emptyDoctor, similarDoctors, validateDoctor, type DoctorDraft } from '../components/doctors/DoctorFields';
import { EstablishmentPicker } from '../components/establishments/EstablishmentPicker';
import { NewEstablishmentDialog } from '../components/establishments/NewEstablishmentDialog';
import { WeekTimingEditor } from '../components/schedule/WeekTimingEditor';
import { newRow, rowKey, rowsToSessions, validateRows, type TimingRow } from '../components/schedule/timing';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, PageHeader } from '../components/ui/Layout';

interface PlaceDraft {
  key: string;
  establishmentId: string;
  rows: TimingRow[];
}

const newPlace = (establishmentId = '', roomId = ''): PlaceDraft => ({ key: rowKey(), establishmentId, rows: [newRow({ roomId })] });

const NewDoctorView = ({ directory }: { directory: Directory }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [params] = useSearchParams();
  const preset = params.get('establishment') ?? '';
  const firstRoom = (id: string) => directory.rooms(id)[0]?.id ?? '';

  const [draft, setDraft] = useState<DoctorDraft>(emptyDoctor);
  const [places, setPlaces] = useState<PlaceDraft[]>(() => [newPlace(directory.establishment(preset) ? preset : '', firstRoom(preset))]);
  const [submitted, setSubmitted] = useState(false);
  const [creatingFor, setCreatingFor] = useState<{ key: string; name: string } | null>(null);
  const [addAnother, setAddAnother] = useState(false);

  const doctorErrors = validateDoctor(draft);
  const rowErrors = places.map(p => validateRows(p.rows));
  const placeErrors = places.map((p, i) => {
    if (!p.establishmentId && p.rows.some(r => r.days.length)) return 'Choose where the doctor sits';
    if (p.establishmentId && places.findIndex(o => o.establishmentId === p.establishmentId) !== i) return 'This place is already added above';
    return '';
  });
  const invalid =
    Object.values(doctorErrors).some(Boolean) || placeErrors.some(Boolean) || rowErrors.some(e => Object.keys(e).length > 0);
  const duplicates = similarDoctors(draft.fullName, directory.doctors);

  const setPlace = (key: string, patch: Partial<PlaceDraft>) => setPlaces(list => list.map(p => (p.key === key ? { ...p, ...patch } : p)));

  const save = useAction(
    () =>
      api.createDoctor({
        ...draftToInput(draft),
        sittings: places.filter(p => p.establishmentId).map(p => ({ establishmentId: p.establishmentId, sessions: rowsToSessions(p.rows) }))
      }),
    {
      onDone: doctor => {
        if (addAnother) {
          toast.success(`${doctor.fullName} saved. Add the next doctor.`);
          setDraft(emptyDoctor());
          setPlaces(list => {
            const kept = list.filter(p => p.establishmentId).slice(0, 1);
            return kept.length ? kept.map(p => newPlace(p.establishmentId, firstRoom(p.establishmentId))) : [newPlace()];
          });
          setSubmitted(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          toast.success(`${doctor.fullName} added`);
          navigate(`/doctors/${doctor.id}`);
        }
      }
    }
  );

  const submit = (another: boolean) => {
    setSubmitted(true);
    setAddAnother(another);
    if (!invalid) save.mutate(undefined);
  };

  const used = places.map(p => p.establishmentId).filter(Boolean);
  const anchor = directory.establishment(used[0] ?? '');

  return (
    <>
      <PageHeader title="Add doctor" subtitle="Only the name and specialty are required. Add where and when they sit so patients can find them." back={{ to: '/doctors', label: 'Doctors' }} />

      <div className="space-y-6 max-w-3xl">
        <Card>
          <CardHeader title="Doctor" />
          <div className="px-5 pb-5 space-y-4">
            <DoctorFields value={draft} onChange={setDraft} errors={submitted ? doctorErrors : {}} autoFocus />
            {duplicates.length > 0 && (
              <div className="flex gap-2.5 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                <div>
                  <p className="font-medium">This doctor may already be listed:</p>
                  <ul className="mt-0.5">
                    {duplicates.map(d => (
                      <li key={d.id}>
                        <Link to={`/doctors/${d.id}`} className="underline hover:text-amber-950">
                          {d.fullName}
                        </Link>{' '}
                        · {d.specialty} · {directory.sittingsOf(d).map(s => s.establishment.name).join(', ') || 'no place'}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-1 text-amber-800">If it’s the same person, open their page and add the new place there instead.</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {places.map((place, index) => {
          const rooms = directory.rooms(place.establishmentId);
          return (
            <Card key={place.key}>
              <CardHeader
                title={index === 0 ? 'Where and when' : `Another place`}
                description={index === 0 ? 'The usual weekly timing. Leave and one-off changes are added later.' : undefined}
                actions={
                  places.length > 1 && (
                    <Button variant="danger-ghost" size="icon" aria-label="Remove place" onClick={() => setPlaces(list => list.filter(p => p.key !== place.key))}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )
                }
              />
              <div className="px-5 pb-5 space-y-4">
                <div className="space-y-1.5">
                  <EstablishmentPicker
                    establishments={directory.establishments}
                    value={place.establishmentId}
                    exclude={used.filter(id => id !== place.establishmentId)}
                    onChange={id => setPlace(place.key, { establishmentId: id, rows: place.rows.map(r => ({ ...r, roomId: firstRoom(id) })) })}
                    onCreate={name => setCreatingFor({ key: place.key, name })}
                  />
                  {submitted && placeErrors[index] && <p className="text-xs font-medium text-rose-600">{placeErrors[index]}</p>}
                </div>
                <WeekTimingEditor
                  rows={place.rows}
                  onChange={rows => setPlace(place.key, { rows })}
                  rooms={rooms}
                  errors={submitted ? rowErrors[index] : {}}
                />
              </div>
            </Card>
          );
        })}

        <button
          type="button"
          onClick={() => setPlaces(list => [...list, newPlace()])}
          className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-600 hover:border-teal-600 hover:text-teal-700"
        >
          <Plus className="w-4 h-4" />
          The doctor also sits at another place
        </button>

        <div className="sticky bottom-0 -mx-4 sm:mx-0 bg-slate-50/95 backdrop-blur border-t border-slate-200 sm:border-0 sm:bg-transparent px-4 sm:px-0 py-3 flex flex-wrap gap-2 justify-end">
          {submitted && invalid && <p className="w-full sm:w-auto sm:mr-auto text-sm text-rose-700 self-center">Please fix the highlighted fields.</p>}
          <Button variant="outline" size="lg" onClick={() => submit(true)} loading={save.isPending && addAnother}>
            Save and add another
          </Button>
          <Button size="lg" onClick={() => submit(false)} loading={save.isPending && !addAnother}>
            Save doctor
          </Button>
        </div>
      </div>

      <NewEstablishmentDialog
        open={Boolean(creatingFor)}
        onClose={() => setCreatingFor(null)}
        initialName={creatingFor?.name}
        defaults={anchor ? { district: anchor.district, subDistrict: anchor.subDistrict } : undefined}
        onCreated={est => creatingFor && setPlace(creatingFor.key, { establishmentId: est.id })}
      />
    </>
  );
};

export const DoctorNewPage = () => <WithDirectory>{directory => <NewDoctorView directory={directory} />}</WithDirectory>;
