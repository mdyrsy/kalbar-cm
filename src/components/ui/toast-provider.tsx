'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove setelah 3 detik
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Container Notifikasi (Kanan Atas) */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-2xl border
              transform transition-all duration-500 ease-in-out animate-in slide-in-from-right-full fade-in
              ${toast.type === 'success' ? 'bg-white border-green-500/20 text-gray-800' : ''}
              ${toast.type === 'error' ? 'bg-white border-red-500/20 text-gray-800' : ''}
              ${toast.type === 'info' ? 'bg-white border-blue-500/20 text-gray-800' : ''}
            `}
            role="alert"
          >
            {/* Icon Box */}
            <div className={`
              flex-shrink-0 p-2 rounded-full
              ${toast.type === 'success' ? 'bg-green-50 text-green-600' : ''}
              ${toast.type === 'error' ? 'bg-red-50 text-red-600' : ''}
              ${toast.type === 'info' ? 'bg-blue-50 text-blue-600' : ''}
            `}>
              {toast.type === 'success' && <CheckCircle size={20} />}
              {toast.type === 'error' && <AlertCircle size={20} />}
              {toast.type === 'info' && <Info size={20} />}
            </div>

            {/* Content */}
            <div className="flex-1">
              <h4 className="font-semibold text-sm">
                {toast.type === 'success' ? 'Berhasil' : toast.type === 'error' ? 'Gagal' : 'Info'}
              </h4>
              <p className="text-sm text-gray-500">{toast.message}</p>
            </div>

            {/* Close Button */}
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}