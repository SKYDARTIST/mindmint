import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'info' | 'error' | 'success';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Slight delay to allow enter animation
    requestAnimationFrame(() => setVisible(true));
    
    const timer = setTimeout(() => {
      setVisible(false);
      // Wait for exit animation
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColors = {
    info: 'bg-gray-900 text-white',
    error: 'bg-red-50 text-red-700 border border-red-200',
    success: 'bg-green-600 text-white'
  };

  return (
    <div 
      className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-2xl z-50 font-medium text-sm transition-all duration-300 transform ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      } ${bgColors[type]}`}
      role="alert"
    >
      {message}
    </div>
  );
};

export default Toast;