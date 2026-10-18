import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Search, Stethoscope } from 'lucide-react';
import { useDirectory } from '../../lib/directory';
import { cn } from '../../lib/cn';

export const QuickFind = () => {
  const { directory } = useDirectory();
  const navigate = useNavigate();
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const results = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q || !directory) return [];
    const doctors = directory.doctors
      .filter(d => d.fullName.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q) || d.primaryPhone.includes(q))
      .slice(0, 6)
      .map(d => ({ key: d.id, to: `/doctors/${d.id}`, title: d.fullName, meta: d.specialty, kind: 'doctor' as const }));
    const places = directory.establishments
      .filter(e => [e.name, e.subDistrict, e.district, e.pinCode, e.address].some(v => v.toLowerCase().includes(q)))
      .slice(0, 6)
      .map(e => ({ key: e.id, to: `/establishments/${e.id}`, title: e.name, meta: [e.subDistrict, e.district].filter(Boolean).join(', '), kind: 'place' as const }));
    return [...doctors, ...places];
  }, [term, directory]);

  const go = (to: string) => {
    navigate(to);
    setTerm('');
    setOpen(false);
    input.current?.blur();
  };

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        ref={input}
        value={term}
        onChange={e => {
          setTerm(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={e => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive(i => Math.min(i + 1, results.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive(i => Math.max(i - 1, 0));
          } else if (e.key === 'Enter' && results[active]) {
            go(results[active].to);
          } else if (e.key === 'Escape') {
            setTerm('');
            input.current?.blur();
          }
        }}
        placeholder="Find a doctor or place…  ( / )"
        className="w-full h-10 rounded-lg bg-slate-100 border border-transparent pl-9 pr-3 text-sm placeholder:text-slate-500 focus:bg-white focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
        aria-label="Find a doctor or place"
      />
      {open && term.trim() && (
        <div className="absolute z-40 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg py-1 max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <p className="px-3 py-3 text-sm text-slate-500">No match for “{term}”</p>
          ) : (
            results.map((r, i) => (
              <button
                key={r.key}
                onMouseDown={e => e.preventDefault()}
                onClick={() => go(r.to)}
                onMouseEnter={() => setActive(i)}
                className={cn('w-full flex items-center gap-3 px-3 py-2 text-left', i === active && 'bg-teal-50')}
              >
                {r.kind === 'doctor' ? (
                  <Stethoscope className="w-4 h-4 text-teal-700 shrink-0" />
                ) : (
                  <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-slate-900 truncate">{r.title}</span>
                  <span className="block text-xs text-slate-500 truncate">{r.meta}</span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
