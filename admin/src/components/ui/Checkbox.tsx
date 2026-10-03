import React from 'react';

interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  defaultChecked,
  onChange,
  label,
  disabled = false,
  className = '',
  id
}) => {
  return (
    <label
      className={`inline-flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={onChange}
        className="w-4 h-4 rounded border-slate-300 text-teal-700 accent-teal-700 focus:ring-teal-700/20 cursor-pointer"
      />
      {label && <span>{label}</span>}
    </label>
  );
};
