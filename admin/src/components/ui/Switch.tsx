import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = ''
}) => {
  return (
    <label
      className={`inline-flex items-start justify-between gap-3 ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      } ${className}`}
    >
      {(label || description) && (
        <div className="flex-1 select-none">
          {label && <p className="text-xs font-semibold text-slate-900">{label}</p>}
          {description && <p className="text-[11px] text-slate-500 leading-snug">{description}</p>}
        </div>
      )}
      <div className="relative inline-flex items-center shrink-0">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4.5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2.5px] after:left-[2.5px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all after:shadow-xs peer-checked:bg-teal-700 shadow-inner"></div>
      </div>
    </label>
  );
};
