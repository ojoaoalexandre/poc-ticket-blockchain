

import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

const typeStyles: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-500',
    icon: '✓',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-500',
    icon: '✕',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-500',
    icon: '⚠',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-500',
    icon: 'ℹ',
  },
};

export function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = typeStyles[type];

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div
        className={`
          ${styles.bg} ${styles.border}
          border-l-4 p-4 rounded-lg shadow-lg
          max-w-md flex items-center gap-3
          transition-all duration-300
        `}
      >
        <span className="text-2xl">{styles.icon}</span>
        <p className="text-gray-800 font-medium flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}
