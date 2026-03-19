"use client";

import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import ContentCard from './ContentCard';

export type StatusType = 'REQUESTED' | 'BRIEFED' | 'IN_PROD' | 'REVIEW' | 'APPROVED' | 'PUBLISHED';

const COLUMNS: { id: StatusType; label: string; color: string }[] = [
  { id: 'REQUESTED', label: 'Requested', color: 'border-slate-500/20' },
  { id: 'BRIEFED', label: 'Briefed', color: 'border-accent-blue/40' },
  { id: 'IN_PROD', label: 'In Prod', color: 'border-purple-500/40' },
  { id: 'REVIEW', label: 'Review', color: 'border-amber-500/40' },
  { id: 'APPROVED', label: 'Approved', color: 'border-accent-green/40' },
  { id: 'PUBLISHED', label: 'Published', color: 'border-white/10' },
];

export default function KanbanBoard({ clientId }: { clientId: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchContent = async () => {
    if (!clientId) return;
    const res = await fetch(`/api/content?clientId=${clientId}`);
    const data = await res.json();
    if (Array.isArray(data)) setItems(data);
  };

  useEffect(() => {
    fetchContent();
  }, [clientId]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeItem = items.find(item => item.id === active.id);
    const overId = over.id as string;

    // Check if dragging over a different column
    if (activeItem && COLUMNS.some(col => col.id === overId)) {
        if (activeItem.status !== overId) {
            setItems(prev => prev.map(item => 
                item.id === active.id ? { ...item, status: overId } : item
            ));
        }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
        setActiveId(null);
        return;
    }

    const activeItem = items.find(item => item.id === active.id);
    const overId = over.id as string;

    if (activeItem) {
        let newStatus = activeItem.status;
        if (COLUMNS.some(col => col.id === overId)) {
            newStatus = overId;
        }

        // Persist change
        await fetch(`/api/content/${active.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: newStatus }),
        });
    }

    setActiveId(null);
  };

  return (
    <div className="h-full flex gap-4 p-6 overflow-x-auto no-scrollbar">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.label}
            color={column.color}
            items={items.filter((item) => item.status === column.id)}
            onRefresh={fetchContent}
          />
        ))}

        <DragOverlay>
          {activeId ? (
            <ContentCard item={items.find((item) => item.id === activeId)} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
