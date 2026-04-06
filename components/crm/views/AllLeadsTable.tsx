'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
   ChevronLeft,
   ChevronRight,
   X,
   Phone as PhoneIcon
} from 'lucide-react';
import { getLeadRequirementSnippet } from '@/lib/leads';

interface Lead {
   id: string;
   name: string;
   email: string;
   phone: string | null;
   score: number;
   source: string;
   personaTag: string | null;
   stage: string;
   intent: string | null;
   customFields: any;
   assignedTo: string | null;
   lastActivityAt: string;
   createdAt: string;
}

export default function AllLeadsTable({ 
   leads, 
   onSelectLead 
}: { 
   leads: Lead[];
   onSelectLead?: (lead: Lead) => void;
}) {
   const [searchTerm, setSearchTerm] = useState('');
   const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

   // Filter States
   const [filterStage, setFilterStage] = useState('all');
   const [filterSource, setFilterSource] = useState('all');
   const [filterPersona, setFilterPersona] = useState('all');

   // Pagination
   const [currentPage, setCurrentPage] = useState(1);
   const ITEMS_PER_PAGE = 10;

   useEffect(() => {
     setCurrentPage(1);
   }, [searchTerm, filterStage, filterSource, filterPersona]);

   // Extract unique values for filters
   const uniqueStages = useMemo(() => Array.from(new Set(leads.map(l => l.stage))), [leads]);
   const uniqueSources = useMemo(() => Array.from(new Set(leads.map(l => l.source))), [leads]);
   const uniquePersonas = useMemo(() => Array.from(new Set(leads.map(l => l.personaTag).filter(Boolean))), [leads]);

   const filteredLeads = useMemo(() => {
      return leads.filter(l => {
         const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (l.personaTag && l.personaTag.toLowerCase().includes(searchTerm.toLowerCase())) ||
            l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (l.phone && l.phone.includes(searchTerm));

         const matchesStage = filterStage === 'all' || l.stage === filterStage;
         const matchesSource = filterSource === 'all' || l.source === filterSource;
         const matchesPersona = filterPersona === 'all' || l.personaTag === filterPersona;

         return matchesSearch && matchesStage && matchesSource && matchesPersona;
      });
   }, [leads, searchTerm, filterStage, filterSource, filterPersona]);

   const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
   const paginatedLeads = useMemo(() => {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      return filteredLeads.slice(start, start + ITEMS_PER_PAGE);
   }, [filteredLeads, currentPage]);

   const toggleSelectAll = () => {
      if (selectedIds.size === filteredLeads.length) {
         setSelectedIds(new Set());
      } else {
         setSelectedIds(new Set(filteredLeads.map(l => l.id)));
      }
   };

   const toggleSelect = (e: React.MouseEvent, id: string) => {
      e.stopPropagation(); // Don't trigger row click
      const newSelected = new Set(selectedIds);
      if (newSelected.has(id)) {
         newSelected.delete(id);
      } else {
         newSelected.add(id);
      }
      setSelectedIds(newSelected);
   };

   const exportCSV = () => {
      const headers = ['Name', 'Email', 'Phone', 'Requirement', 'Source', 'Persona', 'Stage', 'Owner', 'Created At'];
      const rows = filteredLeads.map(l => [
         l.name,
         l.email,
         l.phone || 'N/A',
         getLeadRequirementSnippet(l.customFields, l.intent),
         l.source,
         l.personaTag || 'General',
         l.stage,
         l.assignedTo || 'Unassigned',
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
               <h2 className="text-[15px] font-black text-text-primary uppercase italic tracking-tighter leading-none transition-colors">Neural Lead Repository</h2>
               <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-2 flex items-center gap-2 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-green shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
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
                     placeholder="Search name, email, phone..."
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

               <button
                  onClick={exportCSV}
                  className="flex items-center gap-2 px-6 py-2.5 bg-surface-2 hover:bg-surface-3 text-text-muted hover:text-text-primary rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border border-border-1 shrink-0"
               >
                  <Download size={14} /> Export CSV
               </button>
            </div>
         </div>


         {/* Table Container */}
         <div className="flex-1 glass-card border border-border-1 rounded-[2rem] overflow-hidden flex flex-col backdrop-blur-3xl relative bg-surface-1/50">
            {/* Horizontal Scroll Wrapper */}
            <div className="flex-1 overflow-x-auto no-scrollbar flex flex-col">
               {/* Table Header - Aligned with Zoho Screenshot */}
               <div className="grid grid-cols-[40px_160px_minmax(250px,1.5fr)_200px_140px_120px_120px] gap-0 py-2 border-b border-border-1 bg-surface-2/40 min-w-[1030px]">
                  <div className="flex items-center justify-center border-r border-border-1/30">
                     <button onClick={toggleSelectAll} className="text-text-muted hover:text-text-primary transition-colors">
                        {selectedIds.size === filteredLeads.length && filteredLeads.length > 0 ? <CheckSquare size={16} className="text-accent-blue" /> : <Square size={16} />}
                     </button>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-tight text-text-muted flex items-center gap-1 pl-4">Lead Name </div>
                  <div className="text-[10px] font-bold uppercase tracking-tight text-text-muted border-l border-border-1 pl-4">Requirement / Intent</div>
                  <div className="text-[10px] font-bold uppercase tracking-tight text-text-muted border-l border-border-1 pl-4">Email</div>
                  <div className="text-[10px] font-bold uppercase tracking-tight text-text-muted border-l border-border-1 pl-4">Phone</div>
                  <div className="text-[10px] font-bold uppercase tracking-tight text-text-muted border-l border-border-1 pl-4">Lead Source</div>
                  <div className="text-[10px] font-bold uppercase tracking-tight text-text-muted border-l border-border-1 pl-4">Lead Owner</div>
               </div>

               {/* Table Body */}
               <div className="flex-1 overflow-y-auto no-scrollbar min-w-[1030px]">
                  {paginatedLeads.map(lead => (
                     <div
                        key={lead.id}
                        onClick={() => onSelectLead?.(lead)}
                        className={`grid grid-cols-[40px_160px_minmax(250px,1.5fr)_200px_140px_120px_120px] gap-0 py-2 border-b border-border-1/30 hover:bg-surface-2/60 transition-all items-center group cursor-pointer
                      ${selectedIds.has(lead.id) ? 'bg-accent-blue/[0.02]' : ''}`}
                     >
                        <div className="flex items-center justify-center border-r border-border-1/10 h-full">
                           <button 
                              onClick={(e) => toggleSelect(e, lead.id)}
                              className={`transition-colors ${selectedIds.has(lead.id) ? 'text-accent-blue' : 'text-text-muted opacity-20 hover:opacity-100'}`}
                           >
                              {selectedIds.has(lead.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                           </button>
                        </div>
                     
                     <div className="flex flex-col pl-4">
                        <p className="text-[12px] font-bold text-text-primary group-hover:text-accent-blue transition-colors">{lead.name}</p>
                       
                     </div>
                     
                     <div className="pl-4 pr-3">
                        <p className="text-[11px] text-text-secondary leading-snug line-clamp-2">
                           {getLeadRequirementSnippet(lead.customFields, lead.intent)}
                        </p>
                     </div>

                     <div className="text-[11px] text-text-muted truncate pl-4 pr-3">
                        <a 
                           href={`mailto:${lead.email}`} 
                           onClick={(e) => e.stopPropagation()}
                           className="hover:text-accent-blue transition-colors underline-offset-4 hover:underline"
                        >
                           {lead.email}
                        </a>
                     </div>

                     <div className="flex items-center gap-2 pl-4">
                        <p className="text-[11px] font-medium text-text-primary tabular-nums">{lead.phone || '—'}</p>
                        {lead.phone && (
                           <button 
                              onClick={(e) => { e.stopPropagation(); window.location.href=`tel:${lead.phone}` }}
                              className="text-text-muted/40 hover:text-accent-green transition-colors"
                           >
                              <PhoneIcon size={12} />
                           </button>
                        )}
                     </div>

                     <div className="text-[11px] text-text-muted pl-4">
                        <span className="uppercase text-[9px] font-bold text-accent-blue/80 bg-accent-blue/5 px-1.5 py-0.5 rounded">
                           {lead.source?.split('(')[0].trim() || 'Direct'}
                        </span>
                     </div>

                     <div className="pl-4">
                        <span className="text-[10px] font-medium text-text-muted">
                           {lead.assignedTo || 'Unassigned'}
                        </span>
                     </div>
                  </div>
               ))}
               
               {filteredLeads.length === 0 && (
                  <div className="p-20 text-center flex flex-col items-center gap-4">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-slate-800 backdrop-blur-xl border border-white/5">
                        <Search size={32} />
                     </div>
                     <div>
                        <h4 className="text-white font-black uppercase italic text-sm">No Synchronization Found</h4>
                        <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-1">Adjust filters to reveal leads in the neural hub.</p>
                     </div>
                  </div>
               )}
            </div>

            {/* Pagination Footer */}
            <div className="px-6 py-4 border-t border-border-1 bg-surface-2/30 flex items-center justify-end">
               <div className="flex items-center gap-4">
                  {/* Range Pill */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-3/30 rounded-lg text-[13px] text-text-muted cursor-pointer hover:bg-surface-3 transition-colors">
                     <span className="font-semibold text-text-primary text-[14px]">
                        {filteredLeads.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredLeads.length)}
                     </span>
                     <span className="mx-0.5">of</span>
                     <span className="font-semibold text-text-primary text-[14px]">{filteredLeads.length}</span>
                  </div>

                  {/* Previous Button */}
                  <button 
                     onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                     disabled={currentPage === 1}
                     className="w-8 h-8 flex items-center justify-center bg-surface-1 border border-accent-blue/20 rounded-md text-text-secondary hover:bg-surface-2 hover:border-accent-blue/40 transition-colors disabled:opacity-30 disabled:hover:bg-surface-1 disabled:hover:border-accent-blue/20" 
                  >
                     <ChevronLeft size={16} />
                  </button>

                  {/* Current Page */}
                  <span className="text-[14px] font-semibold text-text-secondary min-w-[80px] text-center">
                     Page {totalPages > 0 ? currentPage : 0} of {totalPages}
                  </span>

                  {/* Next Button */}
                  <button 
                     onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                     disabled={currentPage === totalPages || totalPages === 0}
                     className="w-8 h-8 flex items-center justify-center bg-surface-1 border border-accent-blue/20 rounded-md text-text-secondary hover:bg-surface-2 hover:border-accent-blue/40 transition-colors disabled:opacity-30 disabled:hover:bg-surface-1 disabled:hover:border-accent-blue/20" 
                  >
                     <ChevronRight size={16} />
                  </button>
               </div>
            </div>

             {/* Bulk Action Bar - Unified BGO Shadow Style */}
            {selectedIds.size > 0 && (
               <div className="absolute bottom-16 left-1/2 -translate-x-1/2 px-8 py-4 bg-surface-1 border border-accent-blue/30 rounded-[2rem] shadow-[0_20px_50px_rgba(45,140,255,0.2)] flex items-center gap-8 animate-in slide-in-from-bottom-4 duration-500 z-30 backdrop-blur-2xl">
                  <div className="flex items-center gap-3 pr-8 border-r border-border-1">
                     <span className="bg-accent-blue text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg shadow-accent-blue/30">{selectedIds.size}</span>
                     <span className="text-[10px] font-black text-text-primary uppercase tracking-widest">Selected</span>
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

                </div>
             )}
          </div>
       </div>
    </div>
 );
}

