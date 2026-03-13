"use client";

import React from 'react';
import { X, Mail, Phone, Calendar, Tag, Shield, MessageSquare, ExternalLink, Zap } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  personaTag: string | null;
  stage: string;
  score: number;
  source: string | null;
  createdAt: string;
}

interface LeadSidebarProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function LeadSidebar({ lead, isOpen, onClose }: LeadSidebarProps) {
  if (!lead) return null;

  return (
    <div className={`fixed inset-y-0 right-0 w-[450px] bg-black/95 backdrop-blur-3xl border-l border-[#1F1F1F] z-50 transform transition-transform duration-500 shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-full flex flex-col">
        {/* Sidebar Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center text-accent-blue font-black text-xl">
                {lead.name[0]}
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">{lead.name}</h2>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-accent-green shadow-[0_0_8px_rgba(55,214,122,0.5)]" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Online Now</span>
                </div>
              </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all">
             <X size={20} />
           </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-8">
          
          {/* AI Insight Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/20 to-accent-blue/20 blur-2xl opacity-50" />
            <div className="relative glass-card p-6 rounded-[2rem] border border-white/10 overflow-hidden">
               <div className="flex items-center gap-2 mb-4">
                  <Zap size={16} className="text-accent-orange" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-accent-orange">Alex's Growth Insight</span>
               </div>
               <p className="text-sm text-slate-300 font-medium leading-relaxed mb-6">
                 This lead matches the <span className="text-white font-black">"{lead.personaTag || 'General'}"</span> persona perfectly. 
                 Based on the high sync score of <span className="text-accent-blue font-black">{lead.score}%</span>, I recommend an immediate WhatsApp outreach emphasizing our premium scaling infrastructure.
               </p>
               <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="text-center">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Sync Score</p>
                    <p className="text-lg font-black text-white italic">{lead.score}%</p>
                  </div>
                  <div className="h-8 w-[1px] bg-white/10" />
                  <div className="text-center">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Intent</p>
                    <p className="text-lg font-black text-accent-green italic">HIGH</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Communication Core</h3>
            <div className="grid grid-cols-1 gap-3">
              <a href={`mailto:${lead.email}`} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-accent-blue/10 text-accent-blue group-hover:scale-110 transition-transform">
                    <Mail size={18} />
                  </div>
                  <span className="text-xs font-medium text-slate-300">{lead.email}</span>
                </div>
                <ExternalLink size={14} className="text-slate-600" />
              </a>
              <a href={lead.phone ? `tel:${lead.phone}` : '#'} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-accent-green/10 text-accent-green group-hover:scale-110 transition-transform">
                    <Phone size={18} />
                  </div>
                  <span className="text-xs font-medium text-slate-300">{lead.phone || 'No phone recorded'}</span>
                </div>
                <ExternalLink size={14} className="text-slate-600" />
              </a>
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Source Intelligence</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <Tag size={14} className="text-slate-500" />
                  <span className="text-xs font-medium text-slate-400">Captured Via</span>
                </div>
                <span className="text-[10px] font-black text-white uppercase italic">{lead.source || 'Direct Source'}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <Calendar size={14} className="text-slate-500" />
                  <span className="text-xs font-medium text-slate-400">First Sync</span>
                </div>
                <span className="text-[10px] font-black text-white uppercase italic">
                   {new Date(lead.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Log Placeholder */}
          <div className="space-y-4">
             <div className="flex items-center justify-between px-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Activity Log</h3>
                <span className="text-[9px] font-black text-accent-blue underline cursor-pointer">Add Manual Note</span>
             </div>
             <div className="space-y-4 relative ml-6">
                <div className="absolute left-[-13px] top-0 bottom-0 w-[1px] bg-white/5" />
                <div className="relative">
                   <div className="absolute left-[-17px] top-1 w-2 h-2 rounded-full bg-accent-blue border border-black" />
                   <p className="text-[10px] font-black text-accent-blue uppercase tracking-widest mb-1">Lead Created</p>
                   <p className="text-[11px] text-slate-500 font-medium italic">Captured through QR Code at physical location.</p>
                </div>
                <div className="relative">
                   <div className="absolute left-[-17px] top-1 w-2 h-2 rounded-full bg-accent-orange border border-black" />
                   <p className="text-[10px] font-black text-accent-orange uppercase tracking-widest mb-1">AI Classification</p>
                   <p className="text-[11px] text-slate-500 font-medium italic">Assigned "{lead.personaTag || 'General'}" persona with 90% confidence.</p>
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-8 border-t border-white/5 bg-white/[0.02]">
           <button className="w-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-[0_10px_30px_rgba(99,102,241,0.2)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
             <MessageSquare size={16} /> Send Personalized Brief
           </button>
        </div>
      </div>
    </div>
  );
}
