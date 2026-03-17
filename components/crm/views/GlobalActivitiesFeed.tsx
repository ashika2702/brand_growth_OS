"use client";

import React from 'react';
import { Phone, Mail, MessageSquare, PenLine, Zap, Clock } from 'lucide-react';

interface Activity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  lead: {
    name: string;
    personaTag: string | null;
  };
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'call': return <Phone size={12} />;
    case 'email': return <Mail size={12} />;
    case 'whatsapp': return <MessageSquare size={12} />;
    case 'note': return <PenLine size={12} />;
    case 'stage_change': return <span className="rotate-90">➔</span>;
    case 'score_update': return <StarIcon />;
    default: return <Zap size={12} />;
  }
};

const StarIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-accent-yellow"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>
);

export default function GlobalActivitiesFeed({ leads }: { leads: any[] }) {
  // Aggregate all activities from all leads
  const activities: Activity[] = leads.flatMap(lead => 
    (lead.activities || []).map((act: any) => ({
      ...act,
      lead: {
        name: lead.name,
        personaTag: lead.personaTag
      }
    }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (activities.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center border border-dashed border-white/5 rounded-3xl p-12 text-center">
        <Clock className="w-12 h-12 text-slate-700 mb-4 opacity-20" />
        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">No Activity Detected</h3>
        <p className="text-[10px] text-slate-500 max-w-xs">Capture new leads or update existing ones to see the intelligence timeline populate.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-20">
      <div className="relative ml-8 border-l border-white/5 pl-10 space-y-8 py-4">
        {activities.map((act) => (
          <div key={act.id} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute left-[-51.5px] top-1 w-8 h-8 rounded-xl bg-[#0D0D0D] border border-white/10 flex items-center justify-center text-slate-400 group-hover:border-accent-blue/50 group-hover:text-white transition-all shadow-2xl">
              {getActivityIcon(act.type)}
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-white uppercase tracking-widest">{act.type.replace('_', ' ')}</span>
                <span className="text-slate-600 font-bold">•</span>
                <span className="text-[9px] font-black text-accent-blue uppercase tracking-widest">{act.lead.name}</span>
                {act.lead.personaTag && (
                    <span className="text-[8px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase">{act.lead.personaTag}</span>
                )}
              </div>
              
              <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-2xl">{act.description}</p>
              
              <p className="text-[9px] font-black text-slate-600 uppercase mt-1">
                {new Date(act.createdAt).toLocaleString(undefined, { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
