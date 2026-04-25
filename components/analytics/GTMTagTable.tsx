'use client';

import React from 'react';
import { Tag, Zap, Activity, ShieldCheck, Clock, ExternalLink } from 'lucide-react';

interface GTMTag {
  name: string;
  type: string;
  tagId: string;
  firingTriggerId?: string[];
  monitoringMetadata?: any;
  paused?: boolean;
}

interface GTMTrigger {
  triggerId: string;
  name: string;
  type: string;
}

interface GTMTagTableProps {
  tags: GTMTag[];
  triggers: GTMTrigger[];
  loading?: boolean;
}

export default function GTMTagTable({ tags, triggers, loading }: GTMTagTableProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-accent-blue/20 border-t-accent-blue rounded-full animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted animate-pulse">Scanning Tag Inventory...</p>
      </div>
    );
  }

  const getTriggerName = (ids?: string[]) => {
    if (!ids || ids.length === 0) return 'None';
    return ids.map(id => {
      const t = triggers.find(tr => tr.triggerId === id);
      return t?.name || id;
    }).join(', ');
  };

  return (
    <div className="overflow-hidden border border-border-1 rounded-[2rem] bg-surface-2/30 animate-in fade-in duration-700">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-2 border-b border-border-1 text-[8px] font-bold text-text-muted uppercase tracking-widest">
            <td className="p-5 pl-8">Tag Name</td>
            <td className="p-5">Type</td>
            <td className="p-5">Firing Triggers</td>
            <td className="p-5 text-center">Status</td>
            <td className="p-5 text-right pr-8">Actions</td>
          </tr>
        </thead>
        <tbody>
          {tags.length > 0 ? (
            tags.map((tag, i) => (
              <tr key={i} className="group hover:bg-surface-3/50 transition-colors border-b border-border-1 last:border-0">
                <td className="p-5 pl-8">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl border border-border-1 transition-colors ${tag.paused ? 'bg-surface-2 text-text-muted' : 'bg-accent-blue/10 text-accent-blue shadow-[0_0_15px_rgba(0,163,255,0.1)]'}`}>
                      <Tag size={14} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-text-primary uppercase tracking-tighter truncate max-w-[250px]">{tag.name}</span>
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5">ID: {tag.tagId}</span>
                    </div>
                  </div>
                </td>
                <td className="p-5">
                  <div className="flex items-center gap-2">
                    <Zap size={10} className="text-text-muted" />
                    <span className="text-[10px] font-bold text-text-secondary uppercase">{tag.type.replace('_', ' ')}</span>
                  </div>
                </td>
                <td className="p-5">
                   <div className="flex items-center gap-2">
                    <Activity size={10} className="text-text-muted" />
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-tight truncate max-w-[200px]" title={getTriggerName(tag.firingTriggerId)}>
                      {getTriggerName(tag.firingTriggerId)}
                    </span>
                   </div>
                </td>
                <td className="p-5">
                  <div className="flex justify-center">
                    <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                      tag.paused 
                        ? 'bg-surface-2 border-border-1 text-text-muted' 
                        : 'bg-accent-green/10 border-accent-green/20 text-accent-green'
                    }`}>
                      {tag.paused ? 'Paused' : 'Active'}
                    </div>
                  </div>
                </td>
                <td className="p-5 text-right pr-8">
                  <button className="p-2 hover:bg-surface-2 rounded-lg text-text-muted hover:text-text-primary transition-all">
                    <ExternalLink size={14} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="p-20 text-center">
                <div className="flex flex-col items-center gap-4 opacity-40">
                   <div className="p-6 rounded-full bg-surface-2 border border-border-1 text-text-muted mb-2">
                      <ShieldCheck size={32} />
                   </div>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">No tags found in the current workspace</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {/* Footer / Status */}
      <div className="p-5 bg-surface-2/50 border-t border-border-2 flex justify-between items-center px-8">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-accent-green" />
               <span className="text-[9px] font-bold uppercase text-text-muted tracking-widest">{tags.filter(t => !t.paused).length} Active Tags</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-surface-3" />
               <span className="text-[9px] font-bold uppercase text-text-muted tracking-widest">{tags.filter(t => t.paused).length} Paused</span>
            </div>
         </div>
         <div className="flex items-center gap-2 text-text-muted">
            <Clock size={12} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Auto-syncing every session</span>
         </div>
      </div>
    </div>
  );
}
