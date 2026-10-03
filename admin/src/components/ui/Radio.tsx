import React from 'react';

interface RadioProps {
  name: string;
  value?: string;
  checked: boolean;
  onChange: () => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const Radio: React.FC<RadioProps> = ({
  name,
  value,
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = ''
}) => {
  return (
    <label
      className={`inline-flex items-start gap-2.5 cursor-pointer select-none text-xs ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="mt-0.5 w-4 h-4 text-teal-700 accent-teal-700 focus:ring-teal-700/20 cursor-pointer"
      />
      {(label || description) && (
        <div className="flex-1">
          {label && <div className="font-bold text-slate-900">{label}</div>}
          {description && <div className="text-[11px] text-slate-500 mt-0.5">{description}</div>}
        </div>
      )}
    </label>
  );
};
