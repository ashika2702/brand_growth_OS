'use client';

import React, { useState, useMemo } from 'react';
import {
   Search,
   Filter,
   Download,
   MoreHorizontal,
   CheckSquare,
   Square,
   UserPlus,
   Tag as TagIcon,
   Trash2,
   ChevronDown,
   X
} from 'lucide-react';

interface Lead {
   id: string;
   name: string;
   email: string;
   score: number;
   source: string;
   personaTag: string | null;
   stage: string;
   lastActivityAt: string;
   createdAt: string;
}

export default function AllLeadsTable({ leads }: { leads: Lead[] }) {
   const [searchTerm, setSearchTerm] = useState('');
   const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
   const [showFilters, setShowFilters] = useState(false);

   // Filter States
   const [filterStage, setFilterStage] = useState('all');
   const [filterSource, setFilterSource] = useState('all');
   const [filterPersona, setFilterPersona] = useState('all');

   // Extract unique values for filters
   const uniqueStages = useMemo(() => Array.from(new Set(leads.map(l => l.stage))), [leads]);
   const uniqueSources = useMemo(() => Array.from(new Set(leads.map(l => l.source))), [leads]);
   const uniquePersonas = useMemo(() => Array.from(new Set(leads.map(l => l.personaTag).filter(Boolean))), [leads]);

   const filteredLeads = useMemo(() => {
      return leads.filter(l => {
         const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (l.personaTag && l.personaTag.toLowerCase().includes(searchTerm.toLowerCase())) ||
            l.email.toLowerCase().includes(searchTerm.toLowerCase());

         const matchesStage = filterStage === 'all' || l.stage === filterStage;
         const matchesSource = filterSource === 'all' || l.source === filterSource;
         const matchesPersona = filterPersona === 'all' || l.personaTag === filterPersona;

         return matchesSearch && matchesStage && matchesSource && matchesPersona;
      });
   }, [leads, searchTerm, filterStage, filterSource, filterPersona]);

   const toggleSelectAll = () => {
      if (selectedIds.size === filteredLeads.length) {
         setSelectedIds(new Set());
      } else {
         setSelectedIds(new Set(filteredLeads.map(l => l.id)));
      }
   };

   const toggleSelect = (id: string) => {
      const newSelected = new Set(selectedIds);
      if (newSelected.has(id)) {
         newSelected.delete(id);
      } else {
         newSelected.add(id);
      }
      setSelectedIds(newSelected);
   };

   const exportCSV = () => {
      const headers = ['Name', 'Email', 'Score', 'Source', 'Persona', 'Stage', 'Created At'];
      const rows = filteredLeads.map(l => [
         l.name,
         l.email,
         `${l.score}%`,
         l.source,
         l.personaTag || 'General',
         l.stage,
         new Date(l.createdAt).toLocaleDateString()
      ]);

      const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `crm-leads-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   };

   return (
      <div className="h-full flex flex-col pt-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
         {/* Header Actions */}
         <div className="flex justify-between items-end px-2">
            <div>
               <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Neural Lead Repository</h2>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Total Synchronized: {leads.length}</p>
            </div>
            <div className="flex gap-3">
               <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all border ${showFilters ? 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue' : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'}`}
               >
                  <Filter size={14} /> Filters
               </button>
               <button
                  onClick={exportCSV}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] uppercase font-black tracking-widest transition-all border border-white/5"
               >
                  <Download size={14} /> Export CSV
               </button>
            </div>
         </div>

         {/* Filter Bar */}
         {showFilters && (
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-wrap gap-4 animate-in slide-in-from-top-4 duration-500">
               <div className="flex-1 min-w-[200px]">
                  <label className="block text-[8px] font-black uppercase text-slate-600 mb-1 tracking-widest ml-1">Search Database</label>
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                     <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search name, email, persona..."
                        className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-accent-blue/50"
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-[8px] font-black uppercase text-slate-600 mb-1 tracking-widest ml-1">Stage</label>
                  <select
                     value={filterStage}
                     onChange={e => setFilterStage(e.target.value)}
                     className="bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-accent-blue/50 appearance-none min-w-[120px]"
                  >
                     <option value="all">All Stages</option>
                     {uniqueStages.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                  </select>
               </div>

               <div>
                  <label className="block text-[8px] font-black uppercase text-slate-600 mb-1 tracking-widest ml-1">Source</label>
                  <select
                     value={filterSource}
                     onChange={e => setFilterSource(e.target.value)}
                     className="bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-accent-blue/50 appearance-none min-w-[120px]"
                  >
                     <option value="all">All Sources</option>
                     {uniqueSources.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
               </div>

               <button onClick={() => { setFilterStage('all'); setFilterSource('all'); setFilterPersona('all'); setSearchTerm(''); }} className="self-end p-2.5 text-slate-600 hover:text-white transition-colors">
                  <X size={16} />
               </button>
            </div>
         )}

         {/* Table Container */}
         <div className="flex-1 glass-card border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col backdrop-blur-3xl relative">
            {/* Table Header */}
            <div className="grid grid-cols-[48px_2fr_1fr_1.5fr_1fr_1fr_80px] gap-4 p-6 border-b border-white/5 bg-white/[0.02]">
               <div className="flex justify-center items-center">
                  <button onClick={toggleSelectAll} className="text-slate-700 hover:text-white transition-colors">
                     {selectedIds.size === filteredLeads.length && filteredLeads.length > 0 ? <CheckSquare size={18} className="text-accent-blue" /> : <Square size={18} />}
                  </button>
               </div>
               <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lead Identity</div>
               <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Neural Sync</div>
               <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Persona Profile</div>
               <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Stage</div>
               <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Last Pulse</div>
               <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Ops</div>
            </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
               {filteredLeads.map(lead => (
                  <div
                     key={lead.id}
                     onClick={() => toggleSelect(lead.id)}
                     className={`grid grid-cols-[48px_2fr_1fr_1.5fr_1fr_1fr_80px] gap-4 p-6 border-b border-white/5 hover:bg-white/[0.03] transition-all items-center group cursor-pointer
                   ${selectedIds.has(lead.id) ? 'bg-accent-blue/[0.03] border-l-2 border-l-accent-blue' : ''}`}
                  >
                     <div className="flex justify-center items-center">
                        <button className={`transition-colors ${selectedIds.has(lead.id) ? 'text-accent-blue' : 'text-slate-800'}`}>
                           {selectedIds.has(lead.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                        </button>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center text-white font-black text-sm z-10">
                           {lead.name[0]}
                        </div>
                        <div>
                           <p className="text-sm font-black text-white group-hover:text-accent-blue transition-colors uppercase tracking-tight">{lead.name}</p>
                           <p className="text-[10px] text-slate-600 font-medium">{lead.email}</p>
                        </div>
                     </div>
                     <div>
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black italic border ${lead.score >= 80 ? 'bg-accent-green/10 text-accent-green border-accent-green/20' : lead.score >= 50 ? 'bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20' : 'bg-accent-red/10 text-accent-red border-accent-red/20'}`}>
                           {lead.score || 0}%
                        </span>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-[#A855F7] uppercase tracking-wider mb-0.5">{lead.personaTag || 'Unassigned'}</p>
                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">{lead.source}</p>
                     </div>
                     <div>
                        <span className="bg-white/5 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400 border border-white/5 group-hover:border-white/10 transition-colors">
                           {lead.stage}
                        </span>
                     </div>
                     <div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-tight">
                           {new Date(lead.lastActivityAt || lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                     </div>
                     <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-slate-600 hover:text-white transition-colors p-2">
                           <MoreHorizontal size={18} />
                        </button>
                     </div>
                  </div>
               ))}
               {filteredLeads.length === 0 && (
                  <div className="p-20 text-center flex flex-col items-center gap-4">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-slate-800">
                        <Search size={32} />
                     </div>
                     <div>
                        <h4 className="text-white font-black uppercase italic text-sm">No Synchronization Found</h4>
                        <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-1">Adjust filters to reveal leads in the neural hub.</p>
                     </div>
                  </div>
               )}
            </div>

            {/* Bulk Action Bar */}
            {selectedIds.size > 0 && (
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-8 py-4 bg-[#0A0D14] border border-accent-blue/30 rounded-[2rem] shadow-[0_20px_50px_rgba(45,140,255,0.2)] flex items-center gap-8 animate-in slide-in-from-bottom-4 duration-500 z-30">
                  <div className="flex items-center gap-3 pr-8 border-r border-white/10">
                     <span className="bg-accent-blue text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">{selectedIds.size}</span>
                     <span className="text-[10px] font-black text-white uppercase tracking-widest">Leads Selected</span>
                  </div>

                  <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors">
                     <UserPlus size={14} /> Assign
                  </button>
                  <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors">
                     <TagIcon size={14} /> Tag
                  </button>
                  <button className="flex items-center gap-2 text-[10px] font-black text-red-500/70 hover:text-red-500 uppercase tracking-widest transition-colors">
                     <Trash2 size={14} /> Delete
                  </button>

                  <button onClick={() => setSelectedIds(new Set())} className="ml-4 p-1 rounded-full hover:bg-white/5 text-slate-500 transition-colors">
                     <X size={14} />
                  </button>
               </div>
            )}
         </div>
      </div>
   );
}
