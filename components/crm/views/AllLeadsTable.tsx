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
      <div className="h-full flex flex-col pt-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
         {/* Integrated Header Toolbar */}
         <div className="flex items-end justify-between gap-6 px-4 pb-2">
            {/* Title & Count Group */}
            <div className="shrink-0 mb-1">
               <h2 className="text-[15px] font-black text-text-primary uppercase italic tracking-tighter leading-none">Neural Lead Repository</h2>
               <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
                  Total Synchronized Leads: <span className="text-text-primary">{leads.length}</span>
               </p>
            </div>

            {/* Controls Group */}
            <div className="flex items-center gap-3">
               <div className="flex-1 relative group max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted group-focus-within:text-accent-blue transition-colors" />
                  <input
                     type="text"
                     value={searchTerm}
                     onChange={e => setSearchTerm(e.target.value)}
                     placeholder="Search name, email, persona..."
                     className="w-full bg-surface-2 border border-border-1 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-text-primary outline-none focus:border-accent-blue/30 focus:bg-surface-3 transition-all placeholder:text-text-muted"
                  />
               </div>

               <div className="relative">
                  <select
                     value={filterStage}
                     onChange={e => setFilterStage(e.target.value)}
                     className="bg-surface-2 border border-border-1 rounded-2xl px-5 py-2.5 text-[9px] uppercase font-black tracking-widest text-text-muted outline-none focus:border-accent-blue/30 hover:text-text-primary transition-all appearance-none min-w-[130px] pr-10 cursor-pointer"
                  >
                     <option value="all" className="bg-surface-1">All Stages</option>
                     {uniqueStages.map(s => <option key={s} value={s} className="bg-surface-1">{s.toUpperCase()}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none" />
               </div>

               <div className="relative">
                  <select
                     value={filterSource}
                     onChange={e => setFilterSource(e.target.value)}
                     className="bg-surface-2 border border-border-1 rounded-2xl px-5 py-2.5 text-[9px] uppercase font-black tracking-widest text-text-muted outline-none focus:border-accent-blue/30 hover:text-text-primary transition-all appearance-none min-w-[130px] pr-10 cursor-pointer"
                  >
                     <option value="all" className="bg-surface-1">All Sources</option>
                     {uniqueSources.map(s => <option key={s} value={s} className="bg-surface-1">{s.toUpperCase()}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none" />
               </div>

               <button
                  onClick={exportCSV}
                  className="flex items-center gap-2 px-6 py-2.5 bg-surface-2 hover:bg-surface-3 text-text-muted hover:text-text-primary rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border border-border-1 shrink-0"
               >
                  <Download size={14} /> Export CSV
               </button>
            </div>
         </div>


         {/* Table Container */}
         <div className="flex-1 glass-card border border-border-1 rounded-[2.5rem] overflow-hidden flex flex-col backdrop-blur-3xl relative bg-surface-1/50">
            {/* Table Header */}
            <div className="grid grid-cols-[48px_2fr_1fr_1.5fr_1fr_1fr_80px] gap-4 p-6 border-b border-border-1 bg-surface-2/50 backdrop-blur-md">
               <div className="flex justify-center items-center">
                  <button onClick={toggleSelectAll} className="text-text-muted hover:text-text-primary transition-colors">
                     {selectedIds.size === filteredLeads.length && filteredLeads.length > 0 ? <CheckSquare size={18} className="text-accent-blue" /> : <Square size={18} />}
                  </button>
               </div>
               <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">Lead Identity</div>
               <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">Neural Sync</div>
               <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">Persona Profile</div>
               <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">Stage</div>
               <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">Last Pulse</div>
               <div className="text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Ops</div>
            </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
               {filteredLeads.map(lead => (
                  <div
                     key={lead.id}
                     onClick={() => toggleSelect(lead.id)}
                     className={`grid grid-cols-[48px_2fr_1fr_1.5fr_1fr_1fr_80px] gap-4 p-6 border-b border-border-1 hover:bg-surface-2 transition-all items-center group cursor-pointer
                   ${selectedIds.has(lead.id) ? 'bg-accent-blue/[0.03] border-l-2 border-l-accent-blue' : ''}`}
                  >
                     <div className="flex justify-center items-center">
                        <button className={`transition-colors ${selectedIds.has(lead.id) ? 'text-accent-blue' : 'text-text-muted opacity-30'}`}>
                           {selectedIds.has(lead.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                        </button>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border-1 flex items-center justify-center text-text-primary font-black text-sm z-10">
                           {lead.name[0]}
                        </div>
                        <div>
                           <p className="text-sm font-black text-text-primary group-hover:text-accent-blue transition-colors uppercase tracking-tight">{lead.name}</p>
                           <p className="text-[10px] text-text-muted font-medium">{lead.email}</p>
                        </div>
                     </div>
                     <div>
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black italic border ${lead.score >= 80 ? 'bg-accent-green/10 text-accent-green border-accent-green/20' : lead.score >= 50 ? 'bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20' : 'bg-accent-red/10 text-accent-red border-accent-red/20'}`}>
                           {lead.score || 0}%
                        </span>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-[#A855F7] uppercase tracking-wider mb-0.5">{lead.personaTag || 'Unassigned'}</p>
                        <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest">{lead.source}</p>
                     </div>
                     <div>
                        <span className="bg-surface-3 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-text-muted border border-border-1 group-hover:border-accent-blue/20 transition-colors">
                           {lead.stage}
                        </span>
                     </div>
                     <div>
                        <p className="text-[10px] text-text-muted font-black uppercase tracking-tight">
                           {new Date(lead.lastActivityAt || lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                     </div>
                     <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-text-muted hover:text-text-primary transition-colors p-2">
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
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-8 py-4 bg-surface-1 border border-accent-blue/30 rounded-[2rem] shadow-[0_20px_50px_rgba(45,140,255,0.2)] flex items-center gap-8 animate-in slide-in-from-bottom-4 duration-500 z-30">
                  <div className="flex items-center gap-3 pr-8 border-r border-border-1">
                     <span className="bg-accent-blue text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg shadow-accent-blue/30">{selectedIds.size}</span>
                     <span className="text-[10px] font-black text-text-primary uppercase tracking-widest">Leads Selected</span>
                  </div>

                  <button className="flex items-center gap-2 text-[10px] font-black text-text-muted hover:text-text-primary uppercase tracking-widest transition-colors">
                     <UserPlus size={14} /> Assign
                  </button>
                  <button className="flex items-center gap-2 text-[10px] font-black text-text-muted hover:text-text-primary uppercase tracking-widest transition-colors">
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
