import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

const ToastContext = createContext(null);

let toastEmitter = () => {};

export const toast = {
  success: (msg, opts) => toastEmitter('success', msg, opts),
  error: (msg, opts) => toastEmitter('error', msg, opts),
  warning: (msg, opts) => toastEmitter('warning', msg, opts),
  info: (msg, opts) => toastEmitter('info', msg, opts),
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, message, opts = {}) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
    const duration = opts.duration || 4000;

    const newToast = {
      id,
      type,
      message,
      title: opts.title,
    };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  // Hook global emitter
  toastEmitter = addToast;

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const styles = {
    success: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    error: 'bg-rose-50 text-rose-900 border-rose-200',
    warning: 'bg-amber-50 text-amber-900 border-amber-200',
    info: 'bg-blue-50 text-blue-900 border-blue-200',
  };

  const iconColors = {
    success: 'text-emerald-600',
    error: 'text-rose-600',
    warning: 'text-amber-600',
    info: 'text-blue-600',
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none p-2"
      >
        {toasts.map((item) => {
          const Icon = icons[item.type] || Info;
          return (
            <div
              key={item.id}
              className={cn(
                'pointer-events-auto flex items-start gap-3 p-4 rounded border shadow-lg transition-all transform animate-toast-slide',
                styles[item.type] || styles.info
              )}
            >
              <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', iconColors[item.type])} />
              <div className="flex-1">
                {item.title && (
                  <h4 className="text-sm font-semibold mb-0.5">{item.title}</h4>
                )}
                <p className="text-xs leading-relaxed opacity-90">{item.message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(item.id)}
                className="p-1 rounded opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

export default toast;
