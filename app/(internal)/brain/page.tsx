"use client";

import React, { useEffect, useState } from 'react';
import { 
  Brain, 
  Plus,
  Globe,
  Settings,
  MoreVertical,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useClientStore } from '@/lib/store';
import Dialog from '@/components/ui/Dialog';
import IntakeForm from '@/components/brain/IntakeForm';

export default function BusinessBrainPage() {
  const { clients, setClients, setActiveClientId } = useClientStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSetupOpen, setIsSetupOpen] = useState(false);

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      if (Array.isArray(data)) {
        setClients(data);
      }
    } catch (err) {
      console.error('Error fetching agents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [setClients]);

  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden pb-8">
      {/* Header Area */}
      <div className="flex justify-between items-end shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-accent-orange/10 flex items-center justify-center text-accent-orange border border-accent-orange/20">
              <Brain size={24} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Agents</h1>
          </div>
          <p className="text-slate-500 font-medium">Manage your brand intelligence cores and AI personas.</p>
        </div>
        <button 
          onClick={() => setIsSetupOpen(true)}
          className="px-6 py-3 bg-gradient-to-br from-accent-orange to-accent-red text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(255,77,0,0.4)] hover:scale-[1.02] transition-all flex items-center gap-2 group"
        >
          <Plus size={14} className="group-hover:rotate-90 transition-transform" /> New Agent
        </button>
      </div>

      {/* Agents Table Area */}
      <div className="flex-1 glass-card rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col backdrop-blur-3xl">
        <div className="overflow-y-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-black/80 backdrop-blur-xl z-10 border-b border-card-border">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Agent Details</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Domain</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Created</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right pr-12">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5" />
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-white/5 rounded" />
                          <div className="h-3 w-20 bg-white/5 rounded" />
                        </div>
                      </div>
                    </td>
                    <td colSpan={4} className="px-8 py-6">
                      <div className="h-4 w-full bg-white/5 rounded" />
                    </td>
                  </tr>
                ))
              ) : clients.length > 0 ? (
                clients.map((agent) => (
                  <tr 
                    key={agent.id} 
                    className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                    onClick={() => setActiveClientId(agent.id)}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent-orange/10 flex items-center justify-center text-accent-orange group-hover:bg-accent-orange group-hover:text-white transition-all duration-500">
                          <Brain size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-white group-hover:text-accent-orange transition-colors uppercase tracking-tight">{agent.name}</p>
                          <p className="text-[10px] font-medium text-slate-500">ID: {agent.id.slice(-8).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Globe size={14} className="text-slate-600" />
                        <span className="text-xs font-medium">{agent.domain || 'no-domain.com'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar size={14} className="text-slate-600" />
                        <span className="text-xs font-medium">
                          {new Date(agent.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <span className="px-3 py-1 bg-accent-green/10 text-accent-green text-[9px] font-black uppercase tracking-widest rounded-full border border-accent-green/20 shadow-[0_0_10px_rgba(55,214,122,0.1)]">
                          Active
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right pr-12">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all">
                          <Settings size={16} />
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-accent-orange/10 hover:bg-accent-orange text-accent-orange hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-accent-orange/20 transition-all">
                          Manage <ChevronRight size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center max-w-md mx-auto">
                      <div className="relative mb-8">
                        <div className="absolute inset-0 bg-accent-orange/20 blur-[60px] rounded-full animate-pulse" />
                        <div className="relative w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-accent-orange/20 to-accent-blue/10 border border-white/10 flex items-center justify-center text-accent-orange shadow-2xl">
                          <Brain size={48} className="animate-float" />
                          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent-blue flex items-center justify-center text-white border-4 border-black">
                            <Plus size={16} strokeWidth={3} />
                          </div>
                        </div>
                        <div className="absolute -bottom-4 -left-4 w-12 h-12 rounded-2xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center text-accent-green blur-[0.5px]">
                          <Zap size={20} />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">No Agent Found</h4>
                       
                      </div>

                      
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Setup Dialog */}
      <Dialog 
        isOpen={isSetupOpen} 
        onClose={() => setIsSetupOpen(false)}
        title="Agent Intelligence Setup"
      >
        <IntakeForm 
          onClose={() => setIsSetupOpen(false)} 
          onSuccess={fetchClients}
        />
      </Dialog>
    </div>
  );
}
