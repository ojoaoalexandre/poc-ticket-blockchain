import { useState, useCallback } from 'react';
import { ToastType } from '../components/ui/Toast';

interface ToastState {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = toastId++;
      setToasts((prev) => [...prev, { id, message, type }]);
    },
    []
  );

  const success = useCallback(
    (message: string) => showToast(message, 'success'),
    [showToast]
  );

  const error = useCallback(
    (message: string) => showToast(message, 'error'),
    [showToast]
  );

  const warning = useCallback(
    (message: string) => showToast(message, 'warning'),
    [showToast]
  );

  const info = useCallback(
    (message: string) => showToast(message, 'info'),
    [showToast]
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    success,
    error,
    warning,
    info,
    removeToast,
  };
}
