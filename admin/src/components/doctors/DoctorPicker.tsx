import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { Doctor } from '../../lib/types';
import { cn } from '../../lib/cn';
import { inputClass } from '../ui/Field';

export const DoctorPicker = ({ doctors, onPick, exclude = [] }: { doctors: Doctor[]; onPick: (doctor: Doctor) => void; exclude?: string[] }) => {
  const [term, setTerm] = useState('');
  const matches = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return [];
    return doctors
      .filter(d => !exclude.includes(d.id))
      .filter(d => d.fullName.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q))
      .slice(0, 8);
  }, [term, doctors, exclude]);

  return (
    <div>
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        <input
          autoFocus
          value={term}
          onChange={e => setTerm(e.target.value)}
          placeholder="Search existing doctors by name or specialty…"
          className={cn(inputClass, 'h-10 pl-9')}
          aria-label="Search doctors"
        />
      </div>
      {matches.length > 0 && (
        <ul className="mt-2 rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
          {matches.map(d => (
            <li key={d.id}>
              <button type="button" onClick={() => onPick(d)} className="w-full px-3 py-2 text-left hover:bg-teal-50">
                <span className="block text-sm font-medium text-slate-900">{d.fullName}</span>
                <span className="block text-xs text-slate-500">{d.specialty}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {term.trim() && matches.length === 0 && <p className="mt-2 text-sm text-slate-500">No existing doctor matches “{term}”.</p>}
    </div>
  );
};
