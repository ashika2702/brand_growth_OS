"use client";

import React, { useState } from 'react';
import { Search, Filter, Download, MoreHorizontal } from 'lucide-react';

export default function AllLeadsTable({ leads }: { leads: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (l.personaTag && l.personaTag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col pt-4">
      <div className="flex justify-between items-center mb-6 px-2">
         <h2 className="text-xl font-black text-white uppercase italic">All Leads</h2>
         {/* <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] uppercase font-black tracking-widest transition-all">
            <Download size={14} /> Export CSV
         </button> */}
      </div>

      <div className="flex-1 glass-card border border-white/5 rounded-[2rem] overflow-hidden flex flex-col">
         {/* Table Header */}
         <div className="grid grid-cols-7 gap-4 p-4 border-b border-white/5 bg-white/[0.02]">
            <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Lead Info</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Score</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Source / Persona</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Stage</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Last Activity</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</div>
         </div>

         {/* Table Body */}
         <div className="flex-1 overflow-y-auto no-scrollbar">
            {filteredLeads.map(lead => (
               <div key={lead.id} className="grid grid-cols-7 gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors items-center group cursor-pointer">
                  <div className="col-span-2 flex items-center gap-3">
                     <div className="w-8 h-8 rounded-xl bg-black border border-white/10 flex items-center justify-center text-white font-black text-xs">
                        {lead.name[0]}
                     </div>
                     <div>
                        <p className="text-sm font-black text-white group-hover:text-accent-blue transition-colors">{lead.name}</p>
                        <p className="text-[10px] text-slate-500">{lead.email}</p>
                     </div>
                  </div>
                  <div>
                     <span className={`px-2 py-1 rounded-md text-[10px] font-black italic border ${lead.score >= 80 ? 'bg-accent-green/10 text-accent-green border-accent-green/20' : lead.score >= 50 ? 'bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20' : 'bg-accent-red/10 text-accent-red border-accent-red/20'}`}>
                        {lead.score || 0}% Sync
                     </span>
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-[#A855F7] uppercase tracking-wider mb-0.5">{lead.personaTag || 'General'}</p>
                     <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{lead.source}</p>
                  </div>
                  <div>
                     <span className="bg-white/5 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest text-slate-300 border border-white/5">
                        {lead.stage}
                     </span>
                  </div>
                  <div>
                     <p className="text-[10px] text-slate-400 font-medium">
                        {new Date(lead.lastActivityAt || lead.createdAt).toLocaleDateString()}
                     </p>
                  </div>
                  <div className="flex justify-end relative">
                     <button className="text-slate-500 hover:text-white transition-colors p-2" onClick={(e) => { e.stopPropagation(); }}>
                        <MoreHorizontal size={16} />
                     </button>
                  </div>
               </div>
            ))}
            {filteredLeads.length === 0 && (
               <div className="p-8 text-center text-slate-500 text-xs italic">No leads match your criteria.</div>
            )}
         </div>
      </div>
    </div>
  );
}
