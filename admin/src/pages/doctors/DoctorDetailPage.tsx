import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Building2,
  CalendarDays,
  CalendarClock,
  Phone,
  CheckCircle2,
  Globe,
  Clock,
  ArrowRight,
  ExternalLink,
  Camera,
  Upload,
  Check
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { formatTimeRange12h } from '../../utils/time';

const PRESET_AVATARS = [
  {
    name: 'Senior Physician',
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Pediatrician',
    url: 'https://images.unsplash.com/photo-1594824813576-9f4460592b23?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Surgeon',
    url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Physician',
    url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'
  }
];

export const DoctorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { doctors, establishments, scheduleSlots, overrides, updateDoctor } = useAdmin();
  const navigate = useNavigate();

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoInput, setPhotoInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const doctor = doctors.find(d => d.id === id) || doctors[0];

  if (!doctor) {
    return <div className="p-8 text-slate-500">Doctor record not found.</div>;
  }

  const affiliatedEstablishments = establishments.filter(e =>
    doctor.affiliatedEstablishmentIds.includes(e.id)
  );

  const doctorSlots = scheduleSlots.filter(s => s.doctorId === doctor.id);
  const doctorOverrides = overrides.filter(o => o.doctorId === doctor.id);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoInput(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setPhotoInput(urlInput.trim());
      setUrlInput('');
    }
  };

  const handleSavePhoto = () => {
    updateDoctor(doctor.id, { photoUrl: photoInput.trim() || undefined });
    setIsPhotoModalOpen(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 font-semibold animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Doctor photograph updated successfully.</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <span
            onClick={() => navigate('/doctors')}
            className="hover:text-teal-700 cursor-pointer"
          >
            Doctors
          </span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-slate-900">{doctor.fullName}</span>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setPhotoInput(doctor.photoUrl || '');
              setIsPhotoModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-slate-500" />
            <span>Update Photo</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/schedules/overrides')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <CalendarClock className="w-3.5 h-3.5 text-slate-500" />
            <span>Temporary Overrides ({doctorOverrides.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (affiliatedEstablishments.length > 0) {
                navigate(`/schedules/doctor/${doctor.id}/establishment/${affiliatedEstablishments[0].id}`);
              } else {
                navigate('/schedules');
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            <CalendarDays className="w-4 h-4" />
            <span>Manage Weekly Schedule</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative group shrink-0">
              <img
                src={
                  doctor.photoUrl ||
                  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300'
                }
                alt={doctor.fullName}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm"
              />
              <button
                type="button"
                onClick={() => {
                  setPhotoInput(doctor.photoUrl || '');
                  setIsPhotoModalOpen(true);
                }}
                className="absolute inset-0 bg-slate-900/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity cursor-pointer"
                title="Change photo"
              >
                <Camera className="w-4 h-4 mb-0.5" />
                <span className="text-[9px] font-bold uppercase tracking-tight">Edit</span>
              </button>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900">{doctor.fullName}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {doctor.verificationStatus}
                </span>
                <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {doctor.registrationNumber}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {doctor.specialty} · {doctor.qualifications} ({doctor.experienceYears} Years Experience)
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{doctor.primaryPhone}</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>{doctor.languages.join(', ')}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Medical Council</span>
            <span className="text-xs font-semibold text-slate-800">{doctor.council}</span>
            <span className="text-[10px] text-slate-400 font-mono">
              Affiliated to {affiliatedEstablishments.length} Active Chambers
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-700" />
            <span>Affiliated Chambers & Weekly Rosters ({affiliatedEstablishments.length})</span>
          </h2>
          <button
            type="button"
            onClick={() => navigate('/establishments')}
            className="text-xs text-teal-700 hover:underline font-semibold"
          >
            Attach to Another Chamber
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {affiliatedEstablishments.map(est => {
            const chamberSlots = doctorSlots.filter(s => s.establishmentId === est.id);

            return (
              <div
                key={est.id}
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">{est.name}</span>
                      <span className="text-xs text-slate-500">
                        {est.subDistrict}, {est.district} · {est.type}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      {est.verificationStatus}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Weekly Schedule at this Chamber
                    </span>
                    {chamberSlots.length > 0 ? (
                      <div className="space-y-1.5">
                        {chamberSlots.map(slot => (
                          <div
                            key={slot.id}
                            className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800 w-20">{slot.dayOfWeek}</span>
                              <span className="font-mono text-teal-800 font-semibold">
                                {formatTimeRange12h(slot.startTime, slot.endTime)}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {slot.roomNumber}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No weekly slots configured yet.</p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => navigate(`/establishments/${est.id}`)}
                    className="text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1"
                  >
                    <span>Inspect Chamber</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/schedules/doctor/${doctor.id}/establishment/${est.id}`)}
                    className="text-teal-700 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Edit Chamber Roster</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>Active Date Overrides for this Doctor</span>
        </h3>
        {doctorOverrides.length > 0 ? (
          <div className="divide-y divide-slate-100 text-xs">
            {doctorOverrides.map(ovr => (
              <div key={ovr.id} className="py-2.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-900">{ovr.date} ({ovr.dayOfWeek})</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ovr.overrideType === 'unavailable'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {ovr.overrideType}
                  </span>
                  <span className="text-slate-600 truncate max-w-md">{ovr.publicReason}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">By {ovr.reportedBy}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No temporary overrides currently registered.</p>
        )}
      </div>

      <Modal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        title="Update Practitioner Photograph"
        subtitle={`Manage public directory photo for ${doctor.fullName}.`}
        maxWidth="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            {photoInput ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-rose-600 hover:bg-rose-50"
                onClick={() => setPhotoInput('')}
              >
                Clear Photo
              </Button>
            ) : <div />}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPhotoModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSavePhoto}
              >
                Save Photo
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center gap-5">
            <div className="relative group shrink-0">
              {photoInput ? (
                <img
                  src={photoInput}
                  alt="Doctor Preview"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-teal-600 shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-teal-100 text-teal-800 flex flex-col items-center justify-center font-bold text-lg border-2 border-dashed border-teal-300">
                  <Camera className="w-8 h-8 text-teal-700 mb-1" />
                  <span className="text-[10px] uppercase font-mono tracking-tight text-teal-700">No Photo</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3 w-full">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={<Upload className="w-3.5 h-3.5" />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload New Photo
                </Button>

                <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                  <Input
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    placeholder="Or paste web image URL..."
                    className="h-8 text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleApplyUrl}
                    disabled={!urlInput.trim()}
                  >
                    Apply
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-500">Preset Avatars:</span>
                {PRESET_AVATARS.map((preset, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setPhotoInput(preset.url)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] transition-all cursor-pointer ${
                      photoInput === preset.url
                        ? 'bg-teal-50 border-teal-600 text-teal-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-4 h-4 rounded-full object-cover shrink-0"
                    />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 leading-relaxed bg-teal-50/60 border border-teal-200/70 rounded-lg p-3">
            Photograph changes are immediately syndicated across directory search, appointment slips, and clinic chamber badges.
          </div>
        </div>
      </Modal>
    </div>
  );
};
