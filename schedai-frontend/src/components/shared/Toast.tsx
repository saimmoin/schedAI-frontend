import { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import clsx from 'clsx';

type ToastType = 'success' | 'error' | 'info' | 'warn';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let toastCallback: ((msg: string, type: ToastType) => void) | null = null;

export function toast(message: string, type: ToastType = 'info') {
  toastCallback?.(message, type);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    toastCallback = (message, type) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
    };
    return () => { toastCallback = null; };
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const icons = {
    success: <CheckCircle size={16} className="text-accent-success" />,
    error: <AlertCircle size={16} className="text-accent-danger" />,
    info: <Info size={16} className="text-accent-primary" />,
    warn: <AlertCircle size={16} className="text-accent-warn" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={clsx(
            'flex items-center gap-3 px-4 py-3 rounded-xl border shadow-card',
            'glass animate-slide-up min-w-[280px] max-w-sm',
            t.type === 'success' && 'border-accent-success border-opacity-30',
            t.type === 'error' && 'border-accent-danger border-opacity-30',
            t.type === 'info' && 'border-accent-primary border-opacity-30',
            t.type === 'warn' && 'border-accent-warn border-opacity-30',
          )}
        >
          {icons[t.type]}
          <p className="flex-1 text-text-primary text-sm font-body">{t.message}</p>
          <button onClick={() => remove(t.id)} className="text-text-muted hover:text-text-primary transition-colors">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
