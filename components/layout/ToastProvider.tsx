"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, Bell, Info, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';

interface Toast {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 min-w-[320px] max-w-[400px]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-in slide-in-from-right-full fade-in duration-500 glass-card bg-[#111111]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl flex gap-4 group relative overflow-hidden"
          >
            {/* Intensity Glow */}
            <div className={`absolute inset-0 opacity-10 ${
                toast.type === 'error' ? 'bg-red-500' : 
                toast.type === 'warning' ? 'bg-orange-500' : 
                toast.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
            }`} />

            <div className={`shrink-0 p-2 rounded-xl border border-white/5 ${
                toast.type === 'error' ? 'text-red-500 bg-red-500/10' : 
                toast.type === 'warning' ? 'text-orange-500 bg-orange-500/10' : 
                toast.type === 'success' ? 'text-emerald-500 bg-emerald-500/10' : 'text-blue-500 bg-blue-500/10'
            }`}>
              {toast.type === 'error' && <XCircle size={18} />}
              {toast.type === 'warning' && <AlertTriangle size={18} />}
              {toast.type === 'success' && <CheckCircle2 size={18} />}
              {toast.type === 'info' && <Bell size={18} />}
            </div>

            <div className="flex-1">
              <h4 className="text-sm font-black text-white uppercase tracking-tight mb-0.5">{toast.title}</h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-slate-600 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
            
            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 h-0.5 bg-white/10 w-full overflow-hidden">
                <div className="h-full bg-accent-blue animate-shrink" />
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}
