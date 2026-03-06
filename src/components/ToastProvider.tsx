import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ToastContext, type ToastContextValue, type ToastType } from './toast-context';

interface ToastState {
  id: number;
  type: ToastType;
  message: string;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const idRef = useRef(1);
  const timerMapRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const showToast = useCallback((type: ToastType, message: string, durationMs = 2800) => {
    const id = idRef.current++;
    setToasts((prev) => [...prev, { id, type, message }]);

    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      timerMapRef.current.delete(id);
    }, durationMs);

    timerMapRef.current.set(id, timer);
  }, []);

  useEffect(() => {
    const timers = timerMapRef.current;
    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
      timers.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-60 flex max-w-xs flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className={`rounded-lg border px-4 py-2 text-sm shadow-lg backdrop-blur ${
              toast.type === 'success'
                ? 'border-success/40 bg-success/15 text-gray-900 dark:text-gray-100'
                : toast.type === 'error'
                  ? 'border-danger/40 bg-danger/15 text-gray-900 dark:text-gray-100'
                  : 'border-black/20 bg-white/85 text-gray-900 dark:border-gray-600 dark:bg-gray-900/80 dark:text-gray-100'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
