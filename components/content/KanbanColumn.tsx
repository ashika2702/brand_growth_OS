"use client";

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import ContentCard from './ContentCard';

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  items: any[];
  onRefresh?: () => void;
}

export default function KanbanColumn({ id, title, color, items, onRefresh }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex flex-col w-72 shrink-0 bg-black/40 rounded-2xl border border-white/5 overflow-hidden">
      <div className={`p-4 border-t-2 ${color} bg-white/[0.02] flex justify-between items-center`}>
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</h3>
        <span className="bg-white/5 px-2 py-0.5 rounded-full text-[9px] font-bold text-slate-500">{items.length}</span>
      </div>
      
      <div 
        ref={setNodeRef}
        className="flex-1 p-3 space-y-3 overflow-y-auto no-scrollbar min-h-[100px]"
      >
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <ContentCard key={item.id} item={item} onRefresh={onRefresh} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
