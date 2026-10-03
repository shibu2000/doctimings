import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  User,
  PhoneCall,
  Save,
  Building2,
  Languages,
  Award,
  Camera,
  Upload,
  Trash2
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { DoctorSpecialty, VerificationStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';

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

export const AddDoctorPage: React.FC = () => {
  const { addDoctor, establishments } = useAdmin();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [urlInputValue, setUrlInputValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [specialty, setSpecialty] = useState<DoctorSpecialty>('General Medicine');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [experienceYears, setExperienceYears] = useState(10);
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState(establishments[0]?.id || '');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('Verified');
  const [languages, setLanguages] = useState<string[]>(['Bengali', 'English']);
  const [newLang, setNewLang] = useState('');

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
          setPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyUrl = () => {
    if (urlInputValue.trim()) {
      setPhotoUrl(urlInputValue.trim());
      setUrlInputValue('');
    }
  };

  const handleAddLanguage = () => {
    if (newLang.trim() && !languages.includes(newLang.trim())) {
      setLanguages([...languages, newLang.trim()]);
      setNewLang('');
    }
  };

  const handleRemoveLanguage = (lang: string) => {
    setLanguages(languages.filter(l => l !== lang));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    try {
      const newDoc = await addDoctor({
        fullName: fullName.trim(),
        specialty,
        registrationNumber: registrationNumber.trim() || 'WBMC-PENDING',
        council: 'West Bengal Medical Council',
        qualifications: qualifications.trim() || 'MBBS',
        experienceYears: Number(experienceYears) || 0,
        primaryPhone: primaryPhone.trim() || '+91 90000 00000',
        languages,
        photoUrl: photoUrl.trim() || undefined,
        verificationStatus,
        isPracticingToday: false,
        affiliatedEstablishmentIds: selectedEstablishmentId ? [selectedEstablishmentId] : []
      });

      navigate(`/doctors/${newDoc.id}`);
    } catch (err: any) {
      alert(err?.message || 'Failed to save doctor to backend');
    }
  };

  const specialtyOptions = [
    { value: 'General Medicine', label: 'General Medicine' },
    { value: 'Pediatrics', label: 'Pediatrics' },
    { value: 'Dermatology', label: 'Dermatology' },
    { value: 'Orthopedics', label: 'Orthopedics' },
    { value: 'Gynecology & Obs', label: 'Gynecology & Obs' },
    { value: 'Cardiology', label: 'Cardiology' },
    { value: 'ENT', label: 'ENT' },
    { value: 'Ophthalmology', label: 'Ophthalmology' },
    { value: 'Dentistry', label: 'Dentistry' },
    { value: 'General Surgery', label: 'General Surgery' },
    { value: 'Pulmonology', label: 'Pulmonology' }
  ];

  const establishmentOptions = [
    { value: '', label: '-- No initial chamber (Catalog profile only) --' },
    ...establishments.map(est => ({
      value: est.id,
      label: `${est.name} (${est.subDistrict}, ${est.district})`
    }))
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex flex-col gap-1">
          <nav className="flex items-center gap-2 text-xs text-slate-500">
            <span
              onClick={() => navigate('/doctors')}
              className="hover:text-teal-700 cursor-pointer"
            >
              Doctors
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-slate-900">Add Doctor</span>
          </nav>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Add Doctor</h1>
            <Badge variant="warning">Draft Record</Badge>
          </div>
          <p className="text-xs text-slate-500">
            Add basic practitioner identity first. You can attach multiple chambers, pharmacies, and weekly rosters later.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/doctors')}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Save className="w-4 h-4" />}
            onClick={handleSave}
          >
            Save Doctor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <form onSubmit={handleSave} className="lg:col-span-8 space-y-6">
          <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-4 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0 mt-0.5">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">Fast Intake Mode</span>
                <span className="text-xs text-teal-700">• Field & Chemist Desk Sourced</span>
              </div>
              <p className="text-xs text-teal-800/80 mt-0.5 leading-relaxed">
                Only <strong>Doctor Full Name</strong> and <strong>Primary Specialty</strong> are mandatory to initialize the master record. Council registration numbers and weekly schedules can be enriched later.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-teal-700" />
                <span>1. Doctor Information</span>
              </h2>
              <span className="text-[10px] uppercase font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                Basic Identity
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative group shrink-0">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Doctor Avatar"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-teal-600 shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-teal-100 text-teal-800 flex flex-col items-center justify-center font-bold text-lg border-2 border-dashed border-teal-300">
                    <Camera className="w-6 h-6 text-teal-700 mb-0.5" />
                    <span className="text-[10px] uppercase font-mono tracking-tight text-teal-700">Photo</span>
                  </div>
                )}
                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    title="Remove photo"
                    className="absolute -top-2 -right-2 w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-rose-700 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
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
                    Upload Photo
                  </Button>

                  <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                    <Input
                      value={urlInputValue}
                      onChange={e => setUrlInputValue(e.target.value)}
                      placeholder="Paste image URL..."
                      className="h-8 text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleApplyUrl}
                      disabled={!urlInputValue.trim()}
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 flex-wrap">
                  <span className="text-[11px] font-semibold text-slate-500">Presets:</span>
                  {PRESET_AVATARS.map((preset, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setPhotoUrl(preset.url)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] transition-all cursor-pointer ${
                        photoUrl === preset.url
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

            <Input
              label="Doctor Full Name"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Dr. Amit Das"
              helperText="As displayed on state medical council registration or chamber prescription pad."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Primary Specialty"
                required
                value={specialty}
                onChange={e => setSpecialty(e.target.value as DoctorSpecialty)}
                options={specialtyOptions}
              />

              <Input
                label="WBMC Registration ID"
                value={registrationNumber}
                onChange={e => setRegistrationNumber(e.target.value)}
                placeholder="e.g. WBMC-49201"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Academic Qualifications"
                value={qualifications}
                onChange={e => setQualifications(e.target.value)}
                placeholder="e.g. MBBS, MD, DCH, MS"
              />

              <Input
                label="Clinical Experience (Years)"
                type="number"
                min="0"
                max="60"
                value={experienceYears}
                onChange={e => setExperienceYears(Number(e.target.value))}
              />
            </div>

            <Input
              label="Primary Contact Phone"
              type="tel"
              value={primaryPhone}
              onChange={e => setPrimaryPhone(e.target.value)}
              placeholder="+91 98320 00000"
              helperText="Direct mobile or compounder desk line used for telephonic shift verification."
            />

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-teal-700" />
                <span>Languages Spoken</span>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {languages.map(lang => (
                  <span
                    key={lang}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold"
                  >
                    <span>{lang}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLanguage(lang)}
                      className="hover:text-red-600 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={newLang}
                  onChange={e => setNewLang(e.target.value)}
                  placeholder="Add another language..."
                  className="w-56"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddLanguage}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-700" />
                <span>2. Initial Chamber Affiliation</span>
              </h2>
              <span className="text-[10px] text-slate-400 font-medium">Can add more chambers later</span>
            </div>

            <Select
              label="Primary Healthcare Establishment"
              value={selectedEstablishmentId}
              onChange={e => setSelectedEstablishmentId(e.target.value)}
              options={establishmentOptions}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">
                Initial Verification Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Verified', 'Needs Review', 'Pending'] as VerificationStatus[]).map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setVerificationStatus(status)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                      verificationStatus === status
                        ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Directory Card Preview
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-3">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={fullName || 'Doctor'}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-base shadow-2xs shrink-0">
                    {fullName ? fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'DR'}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    {fullName || 'Doctor Full Name'}
                  </h4>
                  <p className="text-xs text-teal-700 font-semibold">{specialty}</p>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {registrationNumber || 'WBMC-XXXXX'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-600 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Experience:</span>
                  <span className="font-semibold">{experienceYears} Years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Degrees:</span>
                  <span className="font-medium truncate max-w-[160px]">{qualifications || 'MBBS'}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Badge
                  variant={
                    verificationStatus === 'Verified'
                      ? 'success'
                      : verificationStatus === 'Needs Review'
                      ? 'warning'
                      : 'neutral'
                  }
                  hasDot
                >
                  {verificationStatus}
                </Badge>
                <span className="text-[10px] text-slate-400 font-mono">ID: AUTO-ASSIGNED</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-3 text-xs">
            <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-teal-700" />
              <span>Identity Verification Axiom</span>
            </h3>
            <p className="text-slate-500 leading-relaxed">
              Every doctor is treated as an autonomous regional practitioner. Schedules belong to the doctor-chamber pair, preventing schedule conflicts across overlapping locations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
