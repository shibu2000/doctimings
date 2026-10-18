import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

const control =
  'w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors hover:border-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 disabled:bg-slate-50 disabled:text-slate-500';

interface FieldProps {
  label?: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: (id: string) => ReactNode;
}

export const Field = ({ label, hint, error, required, className, children }: FieldProps) => {
  const id = useId();
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-rose-600"> *</span>}
        </label>
      )}
      {children(id)}
      {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
};

type WithField = { label?: string; hint?: ReactNode; error?: string; wrapperClassName?: string };

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & WithField>(
  ({ label, hint, error, wrapperClassName, className, required, ...props }, ref) => (
    <Field label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      {id => (
        <input
          ref={ref}
          id={id}
          required={required}
          className={cn(control, 'h-10', error && 'border-rose-400', className)}
          {...props}
        />
      )}
    </Field>
  )
);
TextInput.displayName = 'TextInput';

export const SelectInput = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & WithField>(
  ({ label, hint, error, wrapperClassName, className, required, children, ...props }, ref) => (
    <Field label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      {id => (
        <select ref={ref} id={id} required={required} className={cn(control, 'h-10 pr-8', className)} {...props}>
          {children}
        </select>
      )}
    </Field>
  )
);
SelectInput.displayName = 'SelectInput';

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & WithField>(
  ({ label, hint, error, wrapperClassName, className, required, ...props }, ref) => (
    <Field label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      {id => <textarea ref={ref} id={id} required={required} className={cn(control, 'py-2 min-h-20', className)} {...props} />}
    </Field>
  )
);
TextArea.displayName = 'TextArea';

export const inputClass = control;
