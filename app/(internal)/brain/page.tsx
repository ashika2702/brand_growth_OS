"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Sparkles,
  SquarePen,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useClientStore } from '@/lib/store';
import Dialog from '@/components/ui/Dialog';
import IntakeForm from '@/components/brain/IntakeForm';

export default function BusinessBrainPage() {
  const router = useRouter();
  const { clients, setClients, setActiveClientId } = useClientStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any>(null);

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

  const handleEditClick = async (agent: any) => {
    setEditingAgent(agent);
    setIsEditOpen(true);
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/brain?clientId=${agent.id}`);
      const data = await res.json();
      if (data) {
        // Merge the client info with the brain data
        setEditingAgent({ ...data, clientId: agent.id, client: agent });
      }
    } catch (err) {
      console.error('Error fetching brain data:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [setClients]);

  return (
    <div className="h-full bg-background flex flex-col gap-6 overflow-hidden pb-8 p-8">
      {/* Header Area */}
      <div className="flex justify-between items-end shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-accent-orange/10 flex items-center justify-center text-accent-orange border border-accent-orange/20">
              <Brain size={24} />
            </div>
            <h1 className="text-[20px] font-black text-text-primary tracking-tighter uppercase italic transition-colors">Agents</h1>
          </div>
          <p className="text-text-muted font-medium transition-colors">Manage your brand intelligence cores and AI personas.</p>
        </div>
        <button
          onClick={() => setIsSetupOpen(true)}
          className="px-6 py-3 bg-gradient-to-br from-accent-orange to-accent-red text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(255,77,0,0.4)] hover:scale-[1.02] transition-all flex items-center gap-2 group"
        >
          <Plus size={14} className="group-hover:rotate-90 transition-transform" /> New Agent
        </button>
      </div>

      {/* Agents Table Area */}
      <div className="flex-1 glass-card rounded-[2rem] border border-border-1 overflow-hidden flex flex-col backdrop-blur-3xl transition-colors">
        <div className="overflow-y-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-surface-1 z-10 border-b border-border-1">
              <tr>
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted transition-colors">Agent Details</th>
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted transition-colors">Domain</th>
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted transition-colors">Created</th>
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted transition-colors text-center">Status</th>
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted transition-colors text-right pr-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-1">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-2" />
                        <div className="space-y-1.5">
                          <div className="h-3 w-24 bg-surface-2 rounded" />
                          <div className="h-2 w-16 bg-surface-2 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-2" />
                        <div className="space-y-1.5">
                          <div className="h-3 w-24 bg-surface-2 rounded" />
                          <div className="h-2 w-16 bg-surface-2 rounded" />
                        </div>
                      </div>
                    </td>
                    <td colSpan={4} className="px-6 py-4">
                      <div className="h-3 w-full bg-surface-2 rounded transition-colors" />
                    </td>
                  </tr>
                ))
              ) : clients.length > 0 ? (
                clients.map((agent) => (
                  <tr
                    key={agent.id}
                    className="hover:bg-surface-2 transition-colors group cursor-pointer"
                    onClick={() => {
                      setActiveClientId(agent.id);
                      router.push(`/brain/${agent.id}`);
                    }}
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent-orange/10 flex items-center justify-center text-accent-orange group-hover:bg-accent-orange group-hover:text-white transition-all duration-500">
                          <Brain size={18} />
                        </div>
                        <div>
                          <p className="text-[12px] font-black text-text-primary group-hover:text-accent-orange transition-colors uppercase tracking-tight">{agent.name}</p>
                          <p className="text-[9px] font-medium text-text-muted transition-colors tracking-tight">ID: {agent.id.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 text-text-secondary transition-colors">
                        <Globe size={12} className="text-text-dim transition-colors" />
                        <span className="text-[11px] font-medium truncate max-w-[150px]">{agent.domain || 'no-domain.com'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 text-text-secondary transition-colors">
                        <Calendar size={12} className="text-text-dim transition-colors" />
                        <span className="text-[11px] font-medium">
                          {new Date(agent.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex flex-col items-center gap-1">
                        <span className="px-2 py-0.5 bg-accent-green/10 text-accent-green text-[8px] font-black uppercase tracking-widest rounded-full border border-accent-green/20 shadow-[0_0_10px_rgba(55,214,122,0.1)]">
                          Active
                        </span>
                        {(agent.autoPilotMode === 'auto' || agent.autoPilotMode === 'autopilot') && (
                          <span className="text-[7px] font-black text-accent-blue uppercase tracking-tighter animate-pulse flex items-center gap-1">
                            <Zap size={6} fill="currentColor" /> AutoPilot
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right pr-10">
                      <div className="flex items-center justify-end gap-2 transition-opacity">
                        <button 
                          className="p-2 bg-accent-blue/5 hover:bg-accent-blue/10 rounded-lg text-text-muted hover:text-accent-blue transition-all border border-border-1 hover:border-accent-blue/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(agent);
                          }}
                        >
                          <SquarePen size={16} />
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
                        {/* Background Glow Removed for Light Mode Harmonization */}
                        <div className="relative w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-accent-orange/20 to-accent-blue/10 border border-border-1 flex items-center justify-center text-accent-orange shadow-2xl transition-colors">
                          <Brain size={48} className="animate-float" />
                          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent-blue flex items-center justify-center text-white border-4 border-surface-1 transition-colors">
                            <Plus size={16} strokeWidth={3} />
                          </div>
                        </div>
                        <div className="absolute -bottom-4 -left-4 w-12 h-12 rounded-2xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center text-accent-green blur-[0.5px]">
                          <Zap size={20} />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-[15px] font-black text-text-primary uppercase italic tracking-tighter transition-colors">No Agent Found</h4>

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

      {/* Edit Agent Intelligence Dialog */}
      <Dialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Agent Intelligence Workspace"
      >
        {isSyncing ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="relative">
              {/* Background Glow Removed for Light Mode Harmonization */}
              <Loader2 className="w-12 h-12 text-accent-blue animate-spin relative z-10" />
            </div>
            <div className="text-center space-y-2">
              <h4 className="text-[14px] font-black text-text-primary uppercase italic tracking-tighter">Synchronizing Neural Core</h4>
              <p className="text-[9px] text-text-muted font-black uppercase tracking-widest leading-relaxed">Retrieving personas, offers, and voice guides...</p>
            </div>
          </div>
        ) : (
          <IntakeForm
            initialData={editingAgent}
            startStep={2}
            onClose={() => setIsEditOpen(false)}
            onSuccess={fetchClients}
          />
        )}
      </Dialog>
    </div>
  );
}
