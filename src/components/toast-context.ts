import { createContext } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastContextValue {
  showToast: (type: ToastType, message: string, durationMs?: number) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
