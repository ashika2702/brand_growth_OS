"use client";

import React from 'react';
import { 
  Zap, 
  MessageSquare, 
  Send, 
  FileText, 
  Image as ImageIcon,
  Sparkles,
  History,
  Clock,
  ChevronRight,
  MoreVertical,
  Plus
} from 'lucide-react';

export default function ContentTapStudio() {
  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden">
      {/* Header Area */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-accent-orange/10 flex items-center justify-center text-accent-orange border border-accent-orange/20">
              <Zap size={24} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Content Tap Studio</h1>
          </div>
          <p className="text-slate-500 font-medium">Generate high-octane marketing assets with the v2.0 AI engine.</p>
        </div>
        <button className="px-6 py-3 bg-gradient-to-br from-accent-orange to-accent-red text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(255,77,0,0.3)] hover:scale-[1.02] transition-all flex items-center gap-2 group">
          <Sparkles size={14} className="group-hover:animate-pulse" /> New Studio Session
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left: AI Generator Panel */}
        <div className="col-span-12 lg:col-span-5 glass-card p-8 rounded-[2.5rem] border border-white/5 flex flex-col h-full bg-[#1A0B2E]/20">
          <div className="mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-orange mb-6 flex items-center gap-2">
              <Zap size={14} /> Creative Architect
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">Context Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button className="px-4 py-3 bg-accent-orange/10 border border-accent-orange/30 rounded-xl text-[10px] font-black uppercase text-accent-orange hover:bg-accent-orange/20 transition-all">Business Brain</button>
                  <button className="px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:bg-white/10 transition-all">Manual Entry</button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">Asset Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: MessageSquare, label: 'Social' },
                    { icon: FileText, label: 'Ad Copy' },
                    { icon: ImageIcon, label: 'Visuals' },
                  ].map((type, i) => (
                    <button key={i} className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-purple-400/30 transition-all group">
                       <type.icon size={18} className="text-slate-600 group-hover:text-accent-orange transition-colors" />
                       <span className="text-[9px] font-black uppercase tracking-tighter text-slate-500 group-hover:text-white">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">Campaign Goal</label>
                <textarea 
                  placeholder="e.g. Generate 5 variations of a LinkedIn post for the SEO Architect offer targeting SaaS Founders..."
                  className="w-full bg-white/5 border border-white/5 focus:border-accent-orange/50 rounded-[1.5rem] p-5 text-sm h-32 text-white placeholder:text-slate-700 outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>
          
          <button className="mt-auto w-full py-5 bg-gradient-to-r from-accent-orange/20 to-accent-red/20 border border-accent-orange/30 text-accent-orange rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-accent-orange group transition-all hover:text-white shadow-2xl">
            Ignite Generation Phase
          </button>
        </div>

        {/* Right: Assets & Feed */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6 min-h-0">
          {/* Active Generation Card */}
          <div className="glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden shrink-0">
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                   <Clock size={16} className="text-teal-400 animate-spin-slow" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase text-white leading-none mb-1 tracking-tight">Processing Assets...</p>
                   <p className="text-[9px] text-slate-600 font-medium">LinkedIn Series: "Agency Freedom"</p>
                </div>
              </div>
              <div className="px-3 py-1 rounded bg-teal-500/10 text-teal-400 text-[9px] font-black italic">82% Sync</div>
            </div>
            {/* Minimal Progress Bar */}
            <div className="w-full h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
               <div className="h-full bg-accent-green rounded-full w-[82%]" />
            </div>
          </div>

          {/* Recent Assets List */}
          <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 flex-1 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                <History size={14} className="text-blue-400" /> Neural Context Feed
              </h3>
              <button className="text-[9px] font-black text-slate-600 uppercase hover:text-white transition-colors">Export All</button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
               {[
                { title: 'The SEO Fallacy', type: 'LinkedIn Post', time: '12m ago', color: 'text-accent-orange' },
                { title: 'Scale or Die', type: 'Ad Headline', time: '1h ago', color: 'text-accent-green' },
                { title: 'AEO Masterclass', type: 'Email Hero', time: '3h ago', color: 'text-accent-blue' },
                { title: 'Neural Campaign V1', type: 'Strategy Doc', time: '1d ago', color: 'text-accent-orange' },
               ].map((asset, i) => (
                 <div key={i} className="group p-5 bg-white/5 rounded-3xl border border-white/5 hover:border-white/10 transition-all flex items-center gap-4 cursor-pointer">
                    <div className="w-12 h-12 rounded-2xl bg-[#1A0B2E] flex items-center justify-center border border-white/10 group-hover:border-white/30 transition-all">
                       <FileText size={20} className="text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <h4 className="text-sm font-black text-white truncate group-hover:text-accent-orange transition-colors mb-0.5">{asset.title}</h4>
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">{asset.type} • {asset.time}</p>
                    </div>
                    <button className="p-2 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-white transition-all">
                       <ChevronRight size={18} />
                    </button>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
