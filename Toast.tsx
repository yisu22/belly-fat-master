import { useEffect } from 'react';

type ToastProps = {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
  duration?: number;
};

export function Toast({ message, type = 'success', onClose, duration = 2500 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  return (
    <div className={`toast ${type}`}>
      {type === 'success' ? '✓' : '✕'}&nbsp; {message}
    </div>
  );
}
