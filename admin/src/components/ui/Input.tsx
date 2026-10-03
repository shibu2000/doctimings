import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  suffix,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full h-9 rounded-lg bg-white border text-xs text-slate-900 placeholder:text-slate-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
            icon ? 'pl-9' : 'pl-3'
          } ${suffix ? 'pr-9' : 'pr-3'} ${
            error ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-600' : 'border-slate-200 hover:border-slate-300'
          } ${className}`}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3 text-slate-400 flex items-center justify-center shrink-0">
            {suffix}
          </div>
        )}
      </div>
      {error ? (
        <p className="text-[11px] text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};
