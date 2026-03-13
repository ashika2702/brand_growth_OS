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
        className="flex items-center gap-3 px-4 py-2 bg-[#1A0B2E]/50 border border-purple-500/10 rounded-xl hover:bg-[#1A0B2E] hover:border-purple-500/30 transition-all group backdrop-blur-md"
      >
        <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
          <Globe size={14} />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-none mb-1">Active Brand</p>
          <p className="text-sm font-black text-white leading-none tracking-tight">{activeClient?.name || 'Select Client'}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-72 bg-[#1A0B2E] border border-purple-500/20 rounded-2xl shadow-2xl shadow-black/50 z-50 p-2 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-xl">
            <div className="max-h-60 overflow-y-auto no-scrollbar">
              {clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => {
                    setActiveClientId(client.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeClientId === client.id
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  {client.name}
                  {activeClientId === client.id && <Check size={14} />}
                </button>
              ))}
            </div>

            <div className="border-t border-white/5 mt-2 pt-2">
              <Link
                href="/brain/setup"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-purple-400 hover:bg-purple-500/5 transition-all"
              >
                <Plus size={14} /> Add New Brand
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
