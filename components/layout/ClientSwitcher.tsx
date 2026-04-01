'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown, Check, Globe, Plus } from 'lucide-react';
import { useClientStore } from '@/lib/store';
import Link from 'next/link';

export default function ClientSwitcher() {
  const { activeClientId, clients, setActiveClientId, setClients } = useClientStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch('/api/clients');
        const data = await res.json();
        if (Array.isArray(data)) {
          setClients(data);
          // Auto-select first client if none selected
          if (!activeClientId && data.length > 0) {
            setActiveClientId(data[0].id);
          }
        }
      } catch (err) {
        console.error('Switcher fetch error:', err);
      }
    };

    fetchClients();
  }, [setClients, setActiveClientId, activeClientId]);

  const activeClient = clients.find(c => c.id === activeClientId);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-4 px-5 py-2.5 bg-surface-1 border border-border-1 rounded-2xl h-12 hover:bg-surface-2 hover:border-accent-blue/20 transition-all group shadow-sm hover:shadow-lg hover:shadow-accent-blue/5"
      >
        <div className="w-8 h-8 rounded-xl bg-accent-blue/10 flex items-center justify-center text-accent-blue shadow-inner group-hover:scale-110 transition-transform">
          <Globe size={16} strokeWidth={2.5} />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted leading-tight mb-1">Active Brand</p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-black text-text-primary leading-none tracking-tight">{activeClient?.name || 'Select Client'}</p>
            <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} strokeWidth={3} />
          </div>
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/5"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-3 w-80 bg-surface-1 border border-border-1 rounded-[28px] shadow-2xl z-50 p-3 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 backdrop-blur-3xl">
            <div className="px-2 py-2 mb-2 border-b border-border-1/50">
               <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Organization Switcher</h4>
            </div>
            <div className="max-h-72 overflow-y-auto no-scrollbar space-y-1">
              {clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => {
                    setActiveClientId(client.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-black transition-all group ${activeClientId === client.id
                      ? 'bg-accent-blue text-white shadow-xl shadow-accent-blue/25'
                      : 'text-text-muted hover:bg-surface-2 hover:text-text-primary border border-transparent hover:border-border-1'
                    }`}
                >
                  <span className="truncate">{client.name}</span>
                  {activeClientId === client.id && <Check size={14} strokeWidth={3} />}
                </button>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-border-1/50">
              <Link
                href="/brain/setup"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 w-full px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-accent-blue hover:bg-accent-blue/5 transition-all border border-dashed border-border-1 hover:border-accent-blue/30"
              >
                <Plus size={16} className="text-accent-blue" /> Add New Brand
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
