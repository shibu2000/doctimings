import { useMemo, useRef, useState } from 'react';
import { Building2, Plus, Search } from 'lucide-react';
import type { Establishment } from '../../lib/types';
import { cn } from '../../lib/cn';
import { inputClass } from '../ui/Field';

interface Props {
  establishments: Establishment[];
  value: string;
  onChange: (id: string) => void;
  onCreate?: (name: string) => void;
  exclude?: string[];
  autoFocus?: boolean;
}

export const EstablishmentPicker = ({ establishments, value, onChange, onCreate, exclude = [], autoFocus }: Props) => {
  const selected = establishments.find(e => e.id === value);
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => {
    const q = term.trim().toLowerCase();
    return establishments
      .filter(e => !exclude.includes(e.id))
      .filter(e => !q || [e.name, e.subDistrict, e.district, e.pinCode, e.address].some(v => v.toLowerCase().includes(q)))
      .slice(0, 8);
  }, [term, establishments, exclude]);

  if (selected && !open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setTerm('');
          setTimeout(() => input.current?.focus());
        }}
        className="w-full flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-3 py-2 text-left hover:border-slate-400"
      >
        <Building2 className="w-4 h-4 text-teal-700 shrink-0" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-slate-900 truncate">{selected.name}</span>
          <span className="block text-xs text-slate-500 truncate">
            {selected.type} · {[selected.subDistrict, selected.district].filter(Boolean).join(', ')}
          </span>
        </span>
        <span className="text-xs font-semibold text-teal-700">Change</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
      <input
        ref={input}
        autoFocus={autoFocus}
        value={term}
        onChange={e => {
          setTerm(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search pharmacy, chamber or town…"
        className={cn(inputClass, 'h-10 pl-9')}
        aria-label="Search establishments"
      />
      {open && (
        <div className="absolute z-30 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg py-1 max-h-80 overflow-y-auto">
          {matches.map(e => (
            <button
              key={e.id}
              type="button"
              onMouseDown={ev => ev.preventDefault()}
              onClick={() => {
                onChange(e.id);
                setOpen(false);
                setTerm('');
              }}
              className="w-full px-3 py-2 text-left hover:bg-teal-50"
            >
              <span className="block text-sm font-medium text-slate-900">{e.name}</span>
              <span className="block text-xs text-slate-500">
                {e.type} · {[e.subDistrict, e.district].filter(Boolean).join(', ')} {e.pinCode}
              </span>
            </button>
          ))}
          {matches.length === 0 && <p className="px-3 py-2 text-sm text-slate-500">No establishment matches “{term}”.</p>}
          {onCreate && (
            <button
              type="button"
              onMouseDown={ev => ev.preventDefault()}
              onClick={() => {
                onCreate(term.trim());
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm font-semibold text-teal-700 border-t border-slate-100 hover:bg-teal-50"
            >
              <Plus className="w-4 h-4" />
              {term.trim() ? `Add “${term.trim()}” as a new establishment` : 'Add a new establishment'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
