'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function Dialog({ isOpen, onClose, children, title }: DialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(isOpen);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen && !mounted) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0A0118]/80 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      />

      {/* Dialog Content */}
      <div 
        className={`relative w-full max-w-5xl max-h-[90vh] glass-card border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col transition-all duration-500 scale-in-center ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/5 pointer-events-none" />
        
        {/* Header */}
        <div className="px-10 pt-8 pb-4 flex justify-between items-center shrink-0 relative z-10">
          <div>
            {title && <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">{title}</h2>}
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl transition-all border border-white/5 group"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-10 pt-4 relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
