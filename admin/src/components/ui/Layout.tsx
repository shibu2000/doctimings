import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from './Button';

export const PageHeader = ({
  title,
  subtitle,
  back,
  actions
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  back?: { to: string; label: string };
  actions?: ReactNode;
}) => (
  <div className="mb-6">
    {back && (
      <Link to={back.to} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-700 mb-2">
        <ChevronLeft className="w-4 h-4" />
        {back.label}
      </Link>
    )}
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 break-words">{title}</h1>
        {subtitle && <div className="mt-1 text-sm text-slate-500">{subtitle}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  </div>
);

export const Card = ({ children, className }: { children: ReactNode; className?: string }) => (
  <section className={cn('bg-white rounded-xl border border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)]', className)}>{children}</section>
);

export const CardHeader = ({ title, description, actions }: { title: ReactNode; description?: ReactNode; actions?: ReactNode }) => (
  <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4 pb-3">
    <div>
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

export const EmptyState = ({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: ReactNode; action?: ReactNode }) => (
  <div className="flex flex-col items-center text-center px-6 py-10">
    {icon && <div className="mb-3 text-slate-300">{icon}</div>}
    <p className="text-sm font-semibold text-slate-800">{title}</p>
    {description && <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const Loading = ({ label = 'Loading…' }: { label?: string }) => (
  <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-500">
    <Loader2 className="w-5 h-5 animate-spin text-teal-700" />
    {label}
  </div>
);

export const LoadError = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
  <Card className="max-w-lg mx-auto mt-10">
    <EmptyState
      icon={<AlertTriangle className="w-10 h-10 text-amber-400" />}
      title="Could not load data"
      description={error.message}
      action={<Button onClick={onRetry}>Try again</Button>}
    />
  </Card>
);

export const Segmented = <T extends string>({
  value,
  onChange,
  options
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; count?: number }[];
}) => (
  <div className="inline-flex flex-wrap rounded-lg bg-slate-100 p-1 gap-1" role="tablist">
    {options.map(o => (
      <button
        key={o.value}
        role="tab"
        aria-selected={value === o.value}
        onClick={() => onChange(o.value)}
        className={cn(
          'px-3 h-8 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-1.5',
          value === o.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
        )}
      >
        {o.label}
        {o.count !== undefined && <span className="text-xs text-slate-500 tabular-nums">{o.count}</span>}
      </button>
    ))}
  </div>
);
