import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastItem {
  id: number;
  tone: 'success' | 'error';
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

let nextId = 1;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => setItems(list => list.filter(t => t.id !== id)), []);

  const push = useCallback(
    (tone: ToastItem['tone'], message: string) => {
      const id = nextId++;
      setItems(list => [...list.slice(-2), { id, tone, message }]);
      setTimeout(() => dismiss(id), tone === 'error' ? 6000 : 3000);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ success: (m: string) => push('success', m), error: (m: string) => push('error', m) }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[60] flex flex-col gap-2 items-end pointer-events-none" aria-live="polite">
        {items.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-2.5 rounded-xl px-4 py-3 shadow-lg border text-sm max-w-sm w-full sm:w-auto ${
              t.tone === 'success' ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-rose-800 border-rose-200'
            }`}
          >
            {t.tone === 'success' ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 mt-0.5 text-rose-600 shrink-0" />
            )}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="opacity-60 hover:opacity-100" aria-label="Dismiss">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
};
