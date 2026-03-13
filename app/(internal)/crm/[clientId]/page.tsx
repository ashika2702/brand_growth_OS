"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Users, Search, Filter, MoreHorizontal, MessageSquare, Phone, Mail } from 'lucide-react';
import LeadSidebar from '@/components/crm/LeadSidebar';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

const STAGES = [
  { id: 'new', name: 'New Leads', color: 'bg-accent-blue' },
  { id: 'contacted', name: 'Contacted', color: 'bg-accent-yellow' },
  { id: 'qualified', name: 'Qualified', color: 'bg-accent-orange' },
  { id: 'proposal', name: 'Proposal', color: 'bg-accent-navy' },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-accent-blue' },
  { id: 'closed_won', name: 'Won', color: 'bg-accent-green' }
];

function SortableItem({ lead, onSelect }: { lead: Lead; onSelect: (lead: Lead) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id, data: { type: 'Lead', lead } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="glass-card p-5 rounded-[2rem] border border-white/5 hover:border-white/20 transition-all group cursor-grab active:cursor-grabbing relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div 
        className="relative z-10"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(lead);
        }}
      >
        <div className="flex justify-between items-start mb-4">
          <span className="text-[9px] font-black text-accent-blue bg-accent-blue/10 px-2.5 py-1 rounded-lg uppercase tracking-wider border border-accent-blue/20">
            {lead.personaTag || 'General'}
          </span>
          <span className="text-[10px] font-black italic text-slate-600">Sync: {lead.score}%</span>
        </div>
        <h4 className="text-base font-black text-white group-hover:text-accent-blue transition-colors mb-1">{lead.name}</h4>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6">{lead.source || 'Direct Source'}</p>
        
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex gap-4">
            <Mail className="w-4 h-4 text-slate-600 hover:text-accent-blue transition-colors" />
            <Phone className="w-4 h-4 text-slate-600 hover:text-accent-blue transition-colors" />
            <MessageSquare className="w-4 h-4 text-slate-600 hover:text-accent-blue transition-colors" />
          </div>
          <div className="w-7 h-7 rounded-xl bg-black border border-[#1F1F1F] flex items-center justify-center font-black text-[9px] text-slate-500 uppercase">
            {lead.name[0]}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CRMPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch(`/api/crm/leads?clientId=${clientId}`);
      const data = await res.json();
      setLeads(data);
    } catch (error) {
      console.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (clientId) fetchLeads();
  }, [clientId, fetchLeads]);

  const updateLeadStage = async (leadId: string, stage: string) => {
    try {
      await fetch(`/api/crm/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage })
      });
    } catch (error) {
      console.error('Failed to update stage');
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const lead = leads.find(l => l.id === active.id);
    if (lead) setActiveLead(lead);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveALead = active.data.current?.type === 'Lead';
    const isOverALead = over.data.current?.type === 'Lead';
    const isOverAColumn = STAGES.find(s => s.id === overId);

    if (!isActiveALead) return;

    // Dragging lead over another lead
    if (isActiveALead && isOverALead) {
      const activeLead = active.data.current?.lead as Lead;
      const overLead = over.data.current?.lead as Lead;

      if (activeLead.stage !== overLead.stage) {
        setLeads(prev => {
          const activeIndex = prev.findIndex(l => l.id === activeId);
          const overIndex = prev.findIndex(l => l.id === overId);
          
          const newLeads = [...prev];
          newLeads[activeIndex].stage = overLead.stage;
          return arrayMove(newLeads, activeIndex, overIndex);
        });
      }
    }

    // Dragging lead over a column
    if (isActiveALead && isOverAColumn) {
      const activeLead = active.data.current?.lead as Lead;
      if (activeLead.stage !== overId) {
        setLeads(prev => {
          const activeIndex = prev.findIndex(l => l.id === activeId);
          const newLeads = [...prev];
          newLeads[activeIndex].stage = overId as string;
          return arrayMove(newLeads, activeIndex, activeIndex); // Refresh
        });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLead(null);

    if (!over) return;

    const lead = leads.find(l => l.id === active.id);
    if (lead) {
      updateLeadStage(lead.id, lead.stage);
    }
  };

  if (loading) return <div className="p-8 text-white font-black uppercase italic animate-pulse">Synchronizing Leads...</div>;

  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-accent-blue/10 flex items-center justify-center text-accent-blue border border-accent-blue/20">
              <Users size={24} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Lead Pipeline</h1>
          </div>
          <p className="text-slate-500 font-medium">Manage and track your client acquisition infrastructure.</p>
        </div>
        <button className="bg-gradient-to-br from-accent-orange to-accent-red text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(255,77,0,0.3)] hover:scale-[1.02] transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add High-Intent Lead
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex gap-4 p-2 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search leads by name, persona, or context..." 
            className="w-full pl-12 pr-4 py-3 bg-transparent text-sm text-white outline-none placeholder:text-slate-600 font-medium"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all border border-white/5">
          <Filter className="w-4 h-4" />
          Intelligence Filters
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar h-full">
          {STAGES.map(stage => (
            <div key={stage.id} className="min-w-[320px] max-w-[320px] flex flex-col h-full">
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${stage.color} shadow-[0_0_8px_currentColor]`} />
                  <h3 className="font-black text-white uppercase text-[10px] tracking-widest">{stage.name}</h3>
                  <span className="bg-white/5 text-slate-500 px-2 py-0.5 rounded-lg text-[9px] font-black border border-white/5">
                    {leads.filter(l => l.stage === stage.id).length}
                  </span>
                </div>
                <button className="text-slate-600 hover:text-white transition-colors">
                  <MoreHorizontal size={14} />
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto no-scrollbar pb-10 flex-1">
                <SortableContext
                  id={stage.id}
                  items={leads.filter(l => l.stage === stage.id).map(l => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {leads.filter(l => l.stage === stage.id).map(lead => (
                    <SortableItem 
                      key={lead.id} 
                      lead={lead} 
                      onSelect={(l) => {
                        setSelectedLead(l);
                        setIsSidebarOpen(true);
                      }}
                    />
                  ))}
                </SortableContext>
                
                {leads.filter(l => l.stage === stage.id).length === 0 && (
                  <div className="h-32 border border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center text-slate-600 text-xs gap-2">
                    <Users className="w-6 h-6 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Pipeline Empty</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <DragOverlay adjustScale={false}>
          {activeLead ? (
            <div className="glass-card p-5 rounded-[2rem] border border-white/20 shadow-2xl bg-accent-blue/10 scale-105 pointer-events-none">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[9px] font-black text-accent-blue bg-accent-blue/10 px-2.5 py-1 rounded-lg uppercase tracking-wider border border-accent-blue/20">
                  {activeLead.personaTag || 'General'}
                </span>
                <span className="text-[10px] font-black italic text-slate-600">Sync: {activeLead.score}%</span>
              </div>
              <h4 className="text-base font-black text-white mb-1">{activeLead.name}</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6">{activeLead.source || 'Direct Source'}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Lead Detail Sidebar */}
      <LeadSidebar 
        lead={selectedLead}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
}
