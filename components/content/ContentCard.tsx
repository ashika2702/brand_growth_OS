"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Instagram, 
  Facebook, 
  Linkedin, 
  Mail, 
  Globe, 
  Video, 
  FileText, 
  Calendar,
  Zap,
  MoreVertical,
  Bot,
  Sparkles
} from 'lucide-react';
import BriefModal from './BriefModal';

interface ContentCardProps {
  item: any;
  isOverlay?: boolean;
  onRefresh?: () => void;
}

const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform.toUpperCase()) {
    case 'IG': return <Instagram size={12} className="text-pink-500" />;
    case 'FB': return <Facebook size={12} className="text-blue-600" />;
    case 'LINKEDIN': return <Linkedin size={12} className="text-blue-500" />;
    case 'EMAIL': return <Mail size={12} className="text-accent-orange" />;
    case 'GOOGLE': return <Globe size={12} className="text-accent-green" />;
    default: return <Globe size={12} />;
  }
};

const TypeIcon = ({ type }: { type: string }) => {
  switch (type.toUpperCase()) {
    case 'REEL': return <Video size={12} className="text-purple-400" />;
    case 'AD': return <Zap size={12} className="text-accent-blue" />;
    case 'BLOG': return <FileText size={12} />;
    default: return <FileText size={12} />;
  }
};

export default function ContentCard({ item, isOverlay, onRefresh }: ContentCardProps) {
  const [isBriefOpen, setIsBriefOpen] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item?.id || 'overlay' });

  const handleGenerateBrief = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setGenerating(true);
    try {
        const res = await fetch('/api/content/brief', {
            method: 'POST',
            body: JSON.stringify({ id: item.id, clientId: item.clientId }),
        });
        if (onRefresh) onRefresh();
        
        // Automatically open the modal after generation
        if (res.ok) {
            setIsBriefOpen(true);
        }
    } catch (e) {
        console.error('Failed to generate brief');
    } finally {
        setGenerating(false);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  if (!item) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onClick={() => item.status !== 'REQUESTED' && setIsBriefOpen(true)}
      className={`group relative bg-[#161B22] border border-white/5 rounded-xl p-3 hover:border-accent-blue/30 transition-all ${
        isOverlay ? 'shadow-2xl shadow-blue-500/20 rotate-2' : ''
      } ${item.status !== 'REQUESTED' ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {/* Top Row: Platforms & Type */}
      <div className="flex justify-between items-start mb-2">
        <div 
          {...listeners}
          className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing"
          title="Drag to move"
        >
          <div className="p-1.5 bg-black/40 rounded-lg">
            <TypeIcon type={item.type} />
          </div>
          <div className="flex -space-x-1">
            {item.platform?.map((p: string) => (
              <div key={p} className="w-5 h-5 rounded-md bg-black border border-white/5 flex items-center justify-center">
                <PlatformIcon platform={p} />
              </div>
            ))}
          </div>
        </div>
        <button className="text-slate-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical size={14} />
        </button>
      </div>

      {/* Title */}
      <h4 className="text-[11px] font-black text-white uppercase tracking-wider mb-2 line-clamp-2">
        {item.title}
      </h4>

      {/* Stats/Badges Row */}
      <div className="flex items-center gap-3">
        {item.dueDate && (
          <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase">
            <Calendar size={10} />
            {new Date(item.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </div>
        )}
        
        {item.voiceScore && (
          <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase ${
            item.voiceScore > 80 ? 'bg-accent-green/10 text-accent-green' : 'bg-amber-500/10 text-amber-500'
          }`}>
            <Bot size={10} />
            Voice {item.voiceScore}
          </div>
        )}
      </div>

      {/* AI Button Indicator */}
      <div className="mt-3 flex gap-2">
        {item.status === 'REQUESTED' && (
            <button 
                onClick={handleGenerateBrief}
                disabled={generating}
                className="flex-1 py-1.5 bg-accent-blue/10 border border-accent-blue/20 rounded-lg text-[8px] font-black uppercase tracking-widest text-accent-blue hover:bg-accent-blue/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
                {generating ? '...' : <><Sparkles size={10} /> Generate Brief</>}
            </button>
        )}
        {item.status === 'BRIEFED' && (
            <button 
              onClick={() => setIsBriefOpen(true)}
              className="flex-1 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-[8px] font-black uppercase tracking-widest text-purple-400 hover:bg-purple-500/20 transition-all"
            >
                Review Brief
            </button>
        )}
      </div>

      {/* Hover Glow */}
      <div className="absolute inset-0 rounded-xl bg-accent-blue/0 group-hover:bg-accent-blue/5 transition-colors pointer-events-none" />

      {/* Modals */}
      <BriefModal 
        item={item} 
        isOpen={isBriefOpen} 
        onClose={() => setIsBriefOpen(false)} 
        onUpdate={onRefresh || (() => {})} 
      />
    </div>
  );
}
