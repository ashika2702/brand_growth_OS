"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Mail, Phone, MessageSquare, Star, Check } from 'lucide-react';

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
  humanGates?: any[];
}

export default function LeadCard({ lead, onSelect, onResolveGate, isOverlay = false }: { lead: Lead; onSelect?: (lead: Lead) => void; onResolveGate?: (lead: Lead) => void; isOverlay?: boolean }) {
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
    opacity: isDragging && !isOverlay ? 0.4 : 1,
  };

  const hasPendingGate = lead.humanGates && lead.humanGates.length > 0;

  // Score Color and Visuals
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-accent-green shadow-[0_0_10px_rgba(55,214,122,0.4)]';
    if (score >= 50) return 'bg-accent-yellow shadow-[0_0_10px_rgba(255,184,46,0.4)]';
    return 'bg-accent-red shadow-[0_0_10px_rgba(255,77,0,0.4)]';
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'new': return 'bg-accent-blue';
      case 'contacted': return 'bg-accent-red';
      case 'qualified': return 'bg-accent-yellow';
      case 'quoted': return 'bg-accent-blue';
      case 'won': return 'bg-accent-green';
      case 'lost': return 'bg-slate-500';
      default: return 'bg-white/10';
    }
  };

  // Time warnings
  const msSinceActivity = new Date().getTime() - new Date(lead.lastActivityAt || lead.createdAt).getTime();
  const hoursSinceActivity = msSinceActivity / (1000 * 60 * 60);
  let timeWarningColor = 'text-text-muted';
  if (lead.stage !== 'new' && lead.stage !== 'won' && lead.stage !== 'lost') {
    if (hoursSinceActivity > 48) timeWarningColor = 'text-accent-red font-black';
    else if (hoursSinceActivity > 24) timeWarningColor = 'text-accent-yellow font-black';
  }

  // Format Time
  const formatTime = () => {
    if (hoursSinceActivity < 1) return 'Just now';
    if (hoursSinceActivity < 24) return `${Math.floor(hoursSinceActivity)}h ago`;
    return `${Math.floor(hoursSinceActivity / 24)}d ago`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative p-3 rounded-xl border transition-all group overflow-visible
        ${lead.stage === 'lost' ? 'bg-surface-1/40 border-border-1 opacity-60 grayscale' : 'glass-card border-border-1 hover:border-border-2 cursor-grab active:cursor-grabbing'}
        ${hasPendingGate ? 'border-accent-red/50 shadow-[0_0_15px_rgba(255,100,100,0.3)]' : ''}
        ${isOverlay ? 'shadow-2xl scale-105 rotate-2 z-50 bg-surface-1/90 backdrop-blur-3xl' : ''}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-xl" />

      {/* Left Colored Bar for Stage */}
      <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${getStageColor(lead.stage)}`} />

      <div
        className="relative z-10 pl-1.5"
        onClick={(e) => {
          if (onSelect) {
            e.stopPropagation();
            onSelect(lead);
          }
        }}
      >
        <div className="flex justify-end items-center mb-1">

          <div className="relative inline-block group/score">
            <span className="text-[9px] font-black italic text-text-muted flex items-center gap-1 cursor-pointer transition-colors">
              <div className={`w-1.5 h-1.5 rounded-full ${getStageColor(lead.stage)}`} />
              {lead.score || 0}
            </span>

            {/* Ultra-Compact Score Breakdown Tooltip */}
            <div className="absolute top-0 right-full mr-2 w-32 p-2 bg-surface-1 border border-border-1 rounded-lg shadow-2xl opacity-0 -translate-x-1 pointer-events-none group-hover/score:opacity-100 group-hover/score:translate-x-0 transition-all z-50 backdrop-blur-md">
              <div className="space-y-1.5">
                <h5 className="text-[6px] font-black uppercase tracking-widest text-text-muted border-b border-border-1 pb-1 mb-1 transition-colors">AI Analysis</h5>
                {[
                  { label: 'Persona', val: (lead.score || 0) + 12 },
                  { label: 'Quality', val: (lead.score || 0) - 8 },
                  { label: 'Behavior', val: (lead.score || 0) + 5 },
                  { label: 'Velocity', val: (lead.score || 0) * 0.85 },
                  { label: 'Fit', val: (lead.score || 0) * 1.1 },
                ].map((factor, i) => (
                  <div key={i} className="space-y-0.5">
                    <div className="flex justify-between text-[5px] font-black uppercase tracking-tight text-text-muted transition-colors">
                      <span>{factor.label}</span>
                      <span className="text-text-primary italic transition-colors">{Math.min(100, Math.max(0, Math.round(factor.val)))}%</span>
                    </div>
                    <div className="h-[2px] w-full bg-surface-2 rounded-full overflow-hidden transition-colors">
                      <div
                        className={`h-full ${getStageColor(lead.stage)} opacity-60`}
                        style={{ width: `${Math.min(100, Math.max(5, Math.round(factor.val)))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute top-1 right-[-3px] border-y-[3px] border-y-transparent border-l-[3px] border-l-surface-1" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-1">
          <h4 className={`text-sm font-black group-hover:text-accent-blue transition-colors truncate line-clamp-1 ${lead.stage === 'lost' ? 'text-text-muted' : 'text-text-primary'}`}>{lead.name}</h4>
          {lead.stage === 'won' && (
            <div className="flex text-accent-yellow scale-[0.65] origin-right shrink-0">
              <Star size={10} fill="currentColor" />
              <Star size={10} fill="currentColor" />
              <Star size={10} fill="currentColor" />
              <Star size={10} fill="currentColor" />
              <Star size={10} fill="currentColor" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-1 opacity-70 transition-colors">
          <div className="flex items-center gap-2 truncate flex-1 mr-2">
            <p className="text-[8px] text-text-muted font-bold uppercase tracking-widest flex items-center gap-1 truncate min-w-0 transition-colors">
              {lead.source?.toLowerCase().includes('google') ? '🔍' : lead.source?.toLowerCase().includes('qr') ? '📱' : '🌐'} <span className="truncate">{lead.source || 'Direct'}</span>
            </p>
            <p className={`text-[8px] tracking-widest font-bold uppercase shrink-0 ${timeWarningColor} transition-colors`}>
              ⌚ {formatTime()}
            </p>
            {lead.stage === 'lost' && lead.lossReason && (
              <p className="text-[8px] text-accent-red font-black uppercase tracking-widest truncate ml-1 border-l border-border-1 pl-2 min-w-0 transition-colors">
                {lead.lossReason}
              </p>
            )}
          </div>
          {lead.stage === 'won' && lead.quotedValue && (
            <span className="text-[9px] font-black text-accent-yellow italic tracking-tighter shrink-0">
              ${(lead.quotedValue / 1000).toFixed(1)}K
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-1.5 mt-0.5 border-t border-border-1 transition-colors">
          <div className="flex gap-4">
            <Mail className={`w-3 h-3 ${hasPendingGate ? 'text-accent-red animate-pulse' : 'text-text-dim'} hover:text-accent-blue transition-colors pointer-events-auto`} />
            <Phone className="w-3 h-3 text-text-dim hover:text-accent-blue transition-colors pointer-events-auto" />
            <MessageSquare className="w-3 h-3 text-text-dim hover:text-accent-blue transition-colors pointer-events-auto" />
            
            {hasPendingGate && (
              <button
                title="Mark as Sent (Resolve AI Draft)"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onResolveGate) onResolveGate(lead);
                }} 
                className="flex items-center gap-1 text-[7px] font-black uppercase text-accent-red hover:text-accent-green transition-colors pointer-events-auto"
              >
                <Check size={10} />
                Sent
              </button>
            )}
          </div>
          <div className="w-5 h-5 rounded-md bg-surface-1 border border-border-1 flex items-center justify-center font-black text-[7px] text-text-muted uppercase transition-colors">
            {lead.name[0]}
          </div>
        </div>
      </div>
    </div>
  );
}
