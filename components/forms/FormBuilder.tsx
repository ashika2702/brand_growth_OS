'use client';

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToFirstScrollableAncestor } from '@dnd-kit/modifiers';
import { FormQuestion } from './QuestionLibrary';
import { SortableQuestion } from './SortableQuestion';
import { Plus, Save, Link as LinkIcon, AlertCircle, Trash2, Copy, FileText } from 'lucide-react';

interface FormBuilderProps {
  clientId: string;
  initialForm?: {
    id?: string;
    name: string;
    description?: string;
    slug: string;
    questions: FormQuestion[];
  };
  onSave: (form: any) => Promise<void>;
}

export interface FormBuilderHandle {
  submit: () => Promise<void>;
}

const FormBuilder = forwardRef<FormBuilderHandle, FormBuilderProps>(({ clientId, initialForm, onSave }, ref) => {
  const [name, setName] = useState(initialForm?.name || '');
  const [description, setDescription] = useState(initialForm?.description || '');
  const [slug, setSlug] = useState(initialForm?.slug || '');
  const [selectedQuestions, setSelectedQuestions] = useState<FormQuestion[]>(
    initialForm?.questions || [
      { id: 'q1', type: 'text', label: 'Untitled Question', required: false }
    ]
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setSelectedQuestions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addNewQuestion = () => {
    const newId = `q_${Math.random().toString(36).substr(2, 9)}`;
    const newQuestion: FormQuestion = {
      id: newId,
      type: 'text',
      label: 'Untitled Question',
      required: false
    };
    setSelectedQuestions([...selectedQuestions, newQuestion]);
  };

  const duplicateQuestion = (q: FormQuestion) => {
    const newId = `q_${Math.random().toString(36).substr(2, 9)}`;
    const copy = { ...q, id: newId };
    setSelectedQuestions([...selectedQuestions, copy]);
  };

  const updateQuestion = (id: string, updates: Partial<FormQuestion>) => {
    setSelectedQuestions(selectedQuestions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuestion = (id: string) => {
    if (selectedQuestions.length === 1) return; // Keep at least one
    setSelectedQuestions(selectedQuestions.filter((q) => q.id !== id));
  };

  const handleSave = async () => {
    if (!name || selectedQuestions.length === 0) {
      setError('Please provide a name and at least one question.');
      return;
    }

    // Auto-generate a unique slug if not already set or being updated
    let finalSlug = slug;
    if (!finalSlug || finalSlug === '') {
        const base = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        const random = Math.random().toString(36).substr(2, 4);
        finalSlug = `${base}-${random}`;
    }

    try {
      setIsSaving(true);
      setError(null);
      await onSave({
        id: initialForm?.id,
        clientId,
        name,
        description,
        slug: finalSlug,
        questions: selectedQuestions,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save form.');
      throw err; // Re-throw so parent knows it failed
    } finally {
      setIsSaving(false);
    }
  };

  // Expose the save function to the parent
  useImperativeHandle(ref, () => ({
    submit: handleSave
  }));

  return (
    <div className="w-full max-w-7xl mx-auto pb-24 px-4 pt-4">
      <div className="grid grid-cols-12 gap-10 items-start">
        {/* Left Column: Form Identity (Sticky) */}
        <div className="col-span-12 lg:col-span-4 sticky top-4 space-y-6">
          <div className="bg-surface-card border-t-[8px] border-accent-blue rounded-2xl shadow-2xl border-x border-b border-border-1 overflow-hidden relative">
            <div className="p-8 space-y-8 relative z-10">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Form Identity</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  className="w-full text-xl font-bold text-text-secondary placeholder:text-text-muted/20 focus:outline-none bg-surface-2 p-4 rounded-xl border border-transparent focus:border-accent-blue/30 transition-all shadow-inner"
                  placeholder="Form Name"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full text-sm font-bold text-text-secondary placeholder:text-text-muted/20 focus:outline-none bg-surface-2 p-4 rounded-xl border border-transparent focus:border-accent-blue/30 transition-all shadow-inner resize-none"
                  placeholder="What is this form for?"
                />
              </div>
            </div>
            
            {/* Subtle Background Glow for the Sidebar */}
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-blue/5 rounded-full blur-[60px] -ml-16 -mb-16"></div>
          </div>

          {error && (
            <div className="p-5 bg-accent-red/10 border border-accent-red/20 rounded-2xl flex items-center gap-4 text-accent-red text-xs font-bold animate-in slide-in-from-top-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          
        </div>

        {/* Right Column: Question Canvas */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}
          >
            <SortableContext items={selectedQuestions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {selectedQuestions.map((question) => (
                  <SortableQuestion
                    key={question.id}
                    question={question}
                    onRemove={removeQuestion}
                    onUpdate={updateQuestion}
                    onDuplicate={duplicateQuestion}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Floating Add Question Button */}
          <div className="flex justify-center pt-8">
              <button
                  onClick={addNewQuestion}
                  className="bg-surface-card border border-border-2 p-6 rounded-full shadow-[0_0_40px_rgba(62,128,255,0.1)] hover:shadow-[0_0_60px_rgba(62,128,255,0.2)] hover:scale-110 hover:border-accent-blue active:scale-95 transition-all text-accent-blue group relative overflow-hidden"
                  title="Add New Question"
              >
                  <div className="absolute inset-0 bg-accent-blue/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Plus size={32} className="group-hover:rotate-90 transition-transform relative z-10" />
              </button>
          </div>
        </div>
      </div>
    </div>
  );
});

FormBuilder.displayName = 'FormBuilder';

export default FormBuilder;
