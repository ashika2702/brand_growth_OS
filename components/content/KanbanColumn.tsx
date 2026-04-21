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
    <div className="flex flex-col w-72 shrink-0 bg-surface-1/40 rounded-2xl border border-border-1 overflow-hidden">
      <div className={`p-4 border-t-2 ${color} bg-surface-2/10 flex justify-between items-center`}>
        <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted">{title}</h3>
        <span className="bg-surface-3 px-2 py-0.5 rounded-full text-[9px] font-bold text-text-muted">{items.length}</span>
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
