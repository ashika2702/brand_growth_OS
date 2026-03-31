"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Mail, Phone, MessageSquare, Star } from 'lucide-react';

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

export default function LeadCard({ lead, onSelect, isOverlay = false }: { lead: Lead; onSelect?: (lead: Lead) => void; isOverlay?: boolean }) {
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

  // Score Color and Visuals
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-accent-green shadow-[0_0_10px_rgba(55,214,122,0.4)]';
    if (score >= 50) return 'bg-accent-yellow shadow-[0_0_10px_rgba(255,184,46,0.4)]';
    return 'bg-accent-red shadow-[0_0_10px_rgba(255,77,0,0.4)]';
  };

  // Time warnings
  const msSinceActivity = new Date().getTime() - new Date(lead.lastActivityAt || lead.createdAt).getTime();
  const hoursSinceActivity = msSinceActivity / (1000 * 60 * 60);
  let timeWarningColor = 'text-slate-500';
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
        ${lead.stage === 'lost' ? 'bg-black/40 border-white/5 opacity-60 grayscale' : 'glass-card border-white/5 hover:border-white/20 cursor-grab active:cursor-grabbing'}
        ${isOverlay ? 'shadow-2xl scale-105 rotate-2 z-50 bg-[#12141A]/90 backdrop-blur-3xl' : ''}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-xl" />

      {/* Left Colored Bar for Score */}
      <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${getScoreColor(lead.score)}`} />

      <div
        className="relative z-10 pl-1.5"
        onClick={(e) => {
          if (onSelect) {
            e.stopPropagation();
            onSelect(lead);
          }
        }}
      >
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[8px] font-black text-[#A855F7] bg-[#A855F7]/10 px-1.5 py-0.5 rounded-md uppercase tracking-wider border border-[#A855F7]/20 truncate max-w-[65%]">
            {lead.personaTag || 'General'}
          </span>

          <div className="relative inline-block group/score">
            <span className="text-[9px] font-black italic text-slate-400 flex items-center gap-1 cursor-help">
              <div className={`w-1.5 h-1.5 rounded-full ${getScoreColor(lead.score)}`} />
              {lead.score}
            </span>

            {/* Score Breakdown Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 p-3 bg-[#0A0D14] border border-white/10 rounded-2xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover/score:opacity-100 group-hover/score:translate-y-0 transition-all z-50 backdrop-blur-xl">
              <div className="space-y-2">
                <h5 className="text-[8px] font-black uppercase tracking-widest text-white border-b border-white/5 pb-1.5 mb-1.5">Neural Score Analysis</h5>
                {[
                  { label: 'Persona Match', val: 30, weight: '30%' },
                  { label: 'Source Quality', val: 25, weight: '25%' },
                  { label: 'Behavioral', val: 20, weight: '20%' },
                  { label: 'Stage Velocity', val: 15, weight: '15%' },
                  { label: 'Offer Fit', val: 10, weight: '10%' },
                ].map((factor, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[7px] font-black uppercase tracking-tight text-slate-500">
                      <span>{factor.label}</span>
                      <span>{factor.weight}</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getScoreColor(lead.score)} opacity-50`}
                        style={{ width: `${(lead.score / 100) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#0A0D14]" />
            </div>
          </div>
        </div>

        <h4 className={`text-sm font-black group-hover:text-accent-blue transition-colors mb-1 ${lead.stage === 'lost' ? 'text-slate-500 line-through' : 'text-white font-black'}`}>{lead.name}</h4>

        <div className="flex items-center gap-3 mb-2 opacity-70">
          <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
            {lead.source?.toLowerCase().includes('google') ? '🔍' : lead.source?.toLowerCase().includes('qr') ? '📱' : '🌐'} {lead.source || 'Direct'}
          </p>
          <p className={`text-[8px] tracking-widest font-bold uppercase ${timeWarningColor}`}>
            ⌚ {formatTime()}
          </p>
        </div>

        {lead.stage === 'won' && (
          <div className="flex justify-between items-center mb-2">
            <div className="flex text-accent-yellow scale-75 origin-left">
              <Star size={10} fill="currentColor" />
              <Star size={10} fill="currentColor" />
              <Star size={10} fill="currentColor" />
              <Star size={10} fill="currentColor" />
              <Star size={10} fill="currentColor" />
            </div>
            {lead.quotedValue && (
              <span className="text-[10px] font-black text-accent-yellow italic tracking-tighter shadow-[0_0_10px_rgba(255,184,46,0.3)]">
                ${(lead.quotedValue / 1000).toFixed(1)}K
              </span>
            )}
          </div>
        )}

        {lead.stage === 'lost' && lead.lossReason && (
          <div className="mb-2 bg-white/5 border border-white/5 rounded-lg p-1.5">
            <p className="text-[8px] text-slate-500 uppercase tracking-widest font-black line-clamp-1">{lead.lossReason}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 mt-1 border-t border-white/5">
          <div className="flex gap-4">
            <Mail className="w-3 h-3 text-slate-600 hover:text-accent-blue transition-colors pointer-events-auto" />
            <Phone className="w-3 h-3 text-slate-600 hover:text-accent-blue transition-colors pointer-events-auto" />
            <MessageSquare className="w-3 h-3 text-slate-600 hover:text-accent-blue transition-colors pointer-events-auto" />
          </div>
          <div className="w-5 h-5 rounded-md bg-black border border-[#1F1F1F] flex items-center justify-center font-black text-[7px] text-zinc-500 uppercase">
            {lead.name[0]}
          </div>
        </div>
      </div>
    </div>
  );
}
