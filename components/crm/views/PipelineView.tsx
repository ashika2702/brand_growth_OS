"use client";

import React from 'react';
import { Users, MoreHorizontal, RefreshCw, Zap } from 'lucide-react';
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
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import LeadCard from '../LeadCard';

const STAGES = [
  { id: 'new', name: 'NEW', color: 'bg-accent-blue' },
  { id: 'contacted', name: 'CONTACTED', color: 'bg-accent-yellow' },
  { id: 'qualified', name: 'QUALIFIED', color: 'bg-accent-orange' },
  { id: 'quoted', name: 'QUOTED', color: 'bg-[#A855F7]' },
  { id: 'won', name: 'WON', color: 'bg-accent-green' },
  { id: 'lost', name: 'LOST', color: 'bg-slate-500' }
];

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
  lastActivityAt: string;
  quotedValue?: number | null;
  lossReason?: string | null;
}

// Helper component to make the column a droppable zone
function PipelineColumn({ stage, stageLeads, stageTotalVal, onSelectLead }: any) {
  const { setNodeRef } = useDroppable({
    id: stage.id,
    data: { type: 'Column', stage }
  });

  return (
    <div className="w-[200px] flex flex-col h-full shrink-0">
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${stage.color} shadow-[0_0_8px_currentColor]`} />
            <h3 className="font-black text-white uppercase text-[10px] tracking-widest">{stage.name}</h3>
            <span className="bg-white/5 text-slate-500 px-2 py-0.5 rounded-lg text-[9px] font-black border border-white/5">
              {stageLeads.length}
            </span>
          </div>
        </div>

        <button className="text-slate-600 hover:text-white transition-colors">
          <MoreHorizontal size={14} />
        </button>
      </div>

      <div ref={setNodeRef} className="space-y-4 overflow-y-auto overflow-x-hidden no-scrollbar pb-10 flex-1 min-h-[150px]">
        <SortableContext
          id={stage.id}
          items={stageLeads.map((l: any) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {stageLeads.map((lead: any) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onSelect={onSelectLead}
            />
          ))}
        </SortableContext>

        {stageLeads.length === 0 && (
          <div className="h-24 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-slate-600 text-xs gap-2">
            <Users className="w-5 h-5 opacity-20" />
            <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Pipeline Empty</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PipelineView({
  leads,
  setLeads,
  onSelectLead,
  updateLeadStage
}: {
  leads: Lead[],
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>,
  onSelectLead: (lead: Lead) => void,
  updateLeadStage: (id: string, stage: string) => void
}) {
  const [activeLead, setActiveLead] = React.useState<Lead | null>(null);
  const [activeLeadOriginalStage, setActiveLeadOriginalStage] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const lead = leads.find(l => l.id === active.id);
    if (lead) {
      setActiveLead(lead);
      setActiveLeadOriginalStage(lead.stage);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const isActiveALead = active.data.current?.type === 'Lead';
    const isOverAColumn = over.data.current?.type === 'Column';

    // If dragging a lead over a valid drop target (Column or another lead)
    const newStage = isOverAColumn ? overId : leads.find(l => l.id === overId)?.stage;

    if (isActiveALead && newStage) {
      const activeLead = active.data.current?.lead as Lead;
      if (activeLead.stage !== newStage) {
        setLeads(prev => {
          const activeIndex = prev.findIndex(l => l.id === activeId);
          const newLeads = [...prev];
          newLeads[activeIndex].stage = newStage as string;
          return arrayMove(newLeads, activeIndex, activeIndex);
        });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const originStage = activeLeadOriginalStage;

    setActiveLead(null);
    setActiveLeadOriginalStage(null);
    if (!over) return;

    let newStage = over.id as string;
    const overLead = leads.find(l => l.id === over.id);
    if (overLead) {
      newStage = overLead.stage;
    }

    if (originStage && originStage !== newStage) {
      updateLeadStage(active.id as string, newStage);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar h-full pt-4 px-2">
        {STAGES.map(stage => {
          const stageLeads = leads.filter(l => l.stage === stage.id);
          const stageTotalVal = stageLeads.reduce((acc, l) => acc + (l.quotedValue || 0), 0);

          return (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              stageLeads={stageLeads}
              stageTotalVal={stageTotalVal}
              onSelectLead={onSelectLead}
            />
          );
        })}
      </div>

      <DragOverlay adjustScale={false}>
        {activeLead ? (
          <LeadCard lead={activeLead} isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
