import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type Tone = 'green' | 'amber' | 'red' | 'blue' | 'slate' | 'teal';

const tones: Record<Tone, string> = {
  green: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
  amber: 'bg-amber-50 text-amber-800 ring-amber-600/25',
  red: 'bg-rose-50 text-rose-800 ring-rose-600/20',
  blue: 'bg-blue-50 text-blue-800 ring-blue-600/20',
  slate: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  teal: 'bg-teal-50 text-teal-800 ring-teal-600/20'
};

export const Badge = ({ tone = 'slate', children, className }: { tone?: Tone; children: ReactNode; className?: string }) => (
  <span className={cn('inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap', tones[tone], className)}>
    {children}
  </span>
);
