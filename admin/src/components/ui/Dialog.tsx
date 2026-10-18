import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from './Button';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const widths = { sm: 'sm:max-w-sm', md: 'sm:max-w-md', lg: 'sm:max-w-lg', xl: 'sm:max-w-2xl' };

export const Dialog = ({ open, onClose, title, description, children, footer, size = 'md' }: DialogProps) => {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    const focusable = panel.current?.querySelector<HTMLElement>('input, select, textarea, button:not([data-close])');
    focusable?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn('relative w-full bg-white rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[92vh]', widths[size])}
      >
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            {description && <div className="mt-1 text-sm text-slate-500">{description}</div>}
          </div>
          <button data-close onClick={onClose} className="-mr-1 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children && <div className="px-5 pb-5 overflow-y-auto flex-1">{children}</div>}
        {footer && <div className="px-5 py-4 border-t border-slate-100 flex flex-wrap justify-end gap-2">{footer}</div>}
      </div>
    </div>,
    document.body
  );
};

interface ConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  loading?: boolean;
  tone?: 'danger' | 'primary';
}

export const ConfirmDialog = ({ open, onClose, onConfirm, title, description, confirmLabel, loading, tone = 'danger' }: ConfirmProps) => (
  <Dialog
    open={open}
    onClose={onClose}
    title={title}
    description={description}
    size="sm"
    footer={
      <>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant={tone} loading={loading} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </>
    }
  />
);
