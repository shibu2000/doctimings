import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'sm',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

  const sizeStyles = {
    xs: 'px-2.5 py-1 text-xs gap-1.5',
    sm: 'px-3.5 py-1.5 text-xs gap-2',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5'
  };

  const variantStyles = {
    primary: 'bg-teal-800 hover:bg-teal-900 active:bg-teal-950 text-white shadow-xs focus:ring-teal-700',
    secondary: 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/80 focus:ring-teal-600',
    outline: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs hover:border-slate-300 focus:ring-slate-400',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 focus:ring-slate-300',
    danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs focus:ring-rose-500'
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-0.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
