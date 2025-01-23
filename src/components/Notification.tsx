import React, { useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export function Notification({ message, type, onClose, duration = 3000 }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className={`
        flex items-center space-x-2 px-4 py-3 rounded-lg shadow-lg
        ${type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}
      `}>
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <XCircle className="w-5 h-5 text-red-500" />
        )}
        <p className="font-medium">{message}</p>
      </div>
    </div>
  );
}