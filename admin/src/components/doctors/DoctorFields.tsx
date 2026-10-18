import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { DoctorInput } from '../../lib/api';
import { LANGUAGES, SPECIALTIES } from '../../lib/constants';
import type { Doctor } from '../../lib/types';
import { cn } from '../../lib/cn';
import { SelectInput, TextInput } from '../ui/Field';

export interface DoctorDraft {
  fullName: string;
  specialty: string;
  primaryPhone: string;
  qualifications: string;
  registrationNumber: string;
  experienceYears: string;
  email: string;
  languages: string[];
}

export const emptyDoctor = (): DoctorDraft => ({
  fullName: 'Dr. ',
  specialty: '',
  primaryPhone: '',
  qualifications: '',
  registrationNumber: '',
  experienceYears: '',
  email: '',
  languages: ['Bengali', 'English']
});

export const draftFromDoctor = (d: Doctor): DoctorDraft => ({
  fullName: d.fullName,
  specialty: d.specialty,
  primaryPhone: d.primaryPhone,
  qualifications: d.qualifications,
  registrationNumber: d.registrationNumber,
  experienceYears: d.experienceYears ? String(d.experienceYears) : '',
  email: d.email ?? '',
  languages: d.languages
});

export const validateDoctor = (d: DoctorDraft) => ({
  fullName: d.fullName.replace(/^dr\.?\s*/i, '').trim().length < 2 ? 'Enter the doctor’s name' : '',
  specialty: d.specialty ? '' : 'Choose a specialty',
  email: d.email && !/^\S+@\S+\.\S+$/.test(d.email) ? 'Enter a valid email or leave it empty' : '',
  experienceYears: d.experienceYears && !(Number(d.experienceYears) >= 0 && Number(d.experienceYears) <= 65) ? 'Enter years between 0 and 65' : ''
});

export const draftToInput = (d: DoctorDraft): DoctorInput => ({
  fullName: d.fullName.trim(),
  specialty: d.specialty,
  primaryPhone: d.primaryPhone.trim(),
  qualifications: d.qualifications.trim(),
  registrationNumber: d.registrationNumber.trim(),
  experienceYears: d.experienceYears ? Number(d.experienceYears) : 0,
  email: d.email.trim(),
  languages: d.languages
});

interface Props {
  value: DoctorDraft;
  onChange: (value: DoctorDraft) => void;
  errors: Partial<Record<keyof DoctorDraft, string>>;
  autoFocus?: boolean;
}

export const DoctorFields = ({ value, onChange, errors, autoFocus }: Props) => {
  const [showMore, setShowMore] = useState(Boolean(value.registrationNumber || value.email || value.experienceYears));
  const set = <K extends keyof DoctorDraft>(key: K, v: DoctorDraft[K]) => onChange({ ...value, [key]: v });

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <TextInput label="Doctor’s name" required autoFocus={autoFocus} value={value.fullName} onChange={e => set('fullName', e.target.value)} error={errors.fullName} />
        <SelectInput label="Specialty" required value={value.specialty} onChange={e => set('specialty', e.target.value)} error={errors.specialty}>
          <option value="" disabled>
            Choose…
          </option>
          {SPECIALTIES.map(s => (
            <option key={s}>{s}</option>
          ))}
        </SelectInput>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <TextInput label="Qualifications" value={value.qualifications} onChange={e => set('qualifications', e.target.value)} placeholder="e.g. MBBS, MD (Paediatrics)" />
        <TextInput label="Phone" type="tel" value={value.primaryPhone} onChange={e => set('primaryPhone', e.target.value)} placeholder="Optional" />
      </div>
      <fieldset>
        <legend className="text-sm font-medium text-slate-700 mb-1.5">Languages spoken</legend>
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGES.map(l => {
            const on = value.languages.includes(l);
            return (
              <button
                key={l}
                type="button"
                aria-pressed={on}
                onClick={() => set('languages', on ? value.languages.filter(x => x !== l) : [...value.languages, l])}
                className={cn('h-8 px-3 rounded-full text-sm border', on ? 'bg-teal-700 border-teal-700 text-white' : 'border-slate-300 text-slate-700 hover:border-teal-600')}
              >
                {l}
              </button>
            );
          })}
        </div>
      </fieldset>
      <button type="button" onClick={() => setShowMore(v => !v)} className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ChevronDown className={cn('w-4 h-4 transition-transform', showMore && 'rotate-180')} />
        Registration, experience and email (optional)
      </button>
      {showMore && (
        <div className="grid sm:grid-cols-3 gap-3">
          <TextInput label="Registration no." value={value.registrationNumber} onChange={e => set('registrationNumber', e.target.value)} placeholder="e.g. WBMC-57842" />
          <TextInput label="Years of experience" inputMode="numeric" value={value.experienceYears} onChange={e => set('experienceYears', e.target.value.replace(/\D/g, ''))} error={errors.experienceYears} />
          <TextInput label="Email" type="email" value={value.email} onChange={e => set('email', e.target.value)} error={errors.email} />
        </div>
      )}
    </div>
  );
};

export const similarDoctors = (name: string, doctors: Doctor[], excludeId?: string) => {
  const core = name.replace(/^dr\.?\s*/i, '').trim().toLowerCase();
  if (core.length < 3) return [];
  const tokens = core.split(/\s+/).filter(t => t.length > 1);
  return doctors
    .filter(d => d.id !== excludeId)
    .filter(d => {
      const other = d.fullName.replace(/^dr\.?\s*/i, '').toLowerCase();
      return other.includes(core) || (tokens.length > 1 && tokens.every(t => other.includes(t)));
    })
    .slice(0, 3);
};
