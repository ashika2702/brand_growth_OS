'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FormQuestion, QUESTION_TYPES } from './QuestionLibrary';
import { GripVertical, Trash2, Copy, MoreVertical, Plus, Circle, Square, X } from 'lucide-react';

interface SortableQuestionProps {
  question: FormQuestion;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<FormQuestion>) => void;
  onDuplicate?: (question: FormQuestion) => void;
}

export function SortableQuestion({ question, onRemove, onUpdate, onDuplicate }: SortableQuestionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  const addOption = () => {
    const currentOptions = question.options || [];
    onUpdate(question.id, { options: [...currentOptions, `Option ${currentOptions.length + 1}`] });
  };

  const updateOption = (index: number, value: string) => {
    const currentOptions = [...(question.options || [])];
    currentOptions[index] = value;
    onUpdate(question.id, { options: currentOptions });
  };

  const removeOption = (index: number) => {
    const currentOptions = (question.options || []).filter((_, i) => i !== index);
    onUpdate(question.id, { options: currentOptions });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-surface-card border border-border-1 rounded-xl shadow-lg mb-4 relative transition-all hover:border-accent-blue/50 group"
    >
      {/* Drag Handle Top Overlay */}
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-0 left-1/2 -translate-x-1/2 p-1 cursor-move text-text-muted/30 hover:text-text-primary opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical size={16} className="rotate-90" />
      </div>

      <div className="p-6 pt-8">
        <div className="flex flex-col md:flex-row gap-6 items-start mb-6">
          {/* Question Label Input */}
          <div className="flex-1 w-full">
            <input
              type="text"
              value={question.label}
              onChange={(e) => onUpdate(question.id, { label: e.target.value })}
              className="w-full text-base font-medium text-text-primary placeholder:text-text-muted/20 focus:outline-none bg-surface-2 p-4 border-b-2 border-transparent focus:border-accent-blue transition-all rounded-t-lg"
              placeholder="Question"
            />
          </div>

          {/* Type Selector Dropdown */}
          <div className="w-full md:w-48 shrink-0">
            <select
              value={question.type}
              onChange={(e) => {
                  const newType = e.target.value as any;
                  const updates: Partial<FormQuestion> = { type: newType };
                  
                  // Initialize options if switching to a multiple-choice type
                  if ((newType === 'select' || newType === 'checkbox') && (!question.options || question.options.length === 0)) {
                      updates.options = ['Option 1'];
                  } else if (newType !== 'select' && newType !== 'checkbox') {
                      updates.options = undefined;
                  }
                  
                  onUpdate(question.id, updates);
              }}
              className="w-full p-4 text-sm font-bold text-text-secondary bg-surface-2 border border-border-1 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-blue/20 transition-all cursor-pointer appearance-none shadow-sm"
            >
              {QUESTION_TYPES.map((qt) => (
                <option key={qt.type} value={qt.type} className="bg-surface-card text-text-primary">{qt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Inner Content (based on type) */}
        <div className="pl-4 border-l-2 border-border-1">
          {question.type === 'select' || question.type === 'checkbox' ? (
            <div className="space-y-3">
              {(question.options || []).map((opt, idx) => (
                <div key={idx} className="flex items-center gap-3 group/opt">
                  {question.type === 'select' ? <Circle size={18} className="text-text-muted/30 shrink-0" /> : <Square size={18} className="text-text-muted/30 shrink-0" />}
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(idx, e.target.value)}
                    className="flex-1 text-sm font-medium text-text-secondary bg-transparent border-b border-transparent hover:border-border-2 focus:border-accent-blue/50 focus:outline-none py-1 transition-all"
                  />
                  <button
                    onClick={() => removeOption(idx)}
                    className="p-1 text-text-muted hover:text-accent-red opacity-0 group-hover/opt:opacity-100 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-3 text-sm text-text-muted">
                {question.type === 'select' ? <Circle size={18} className="text-text-dim/20 shrink-0" /> : <Square size={18} className="text-text-dim/20 shrink-0" />}
                <button 
                  onClick={addOption}
                  className="hover:text-accent-blue transition-colors text-[11px] font-bold uppercase tracking-wider"
                >
                  Add option
                </button>
              </div>
            </div>
          ) : (
            <div className="text-xs text-text-muted italic opacity-50 pl-2">
              {question.type === 'textarea' ? 'Paragraph answer text' : 
               question.type === 'date' ? 'Date picker input' : 
               'Short answer text'}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="border-t border-border-1 p-4 flex items-center justify-end gap-2 md:gap-4 bg-surface-2/20">
        <button 
          onClick={() => onDuplicate?.(question)}
          className="p-2 text-text-muted hover:text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-all"
          title="Duplicate"
        >
          <Copy size={18} />
        </button>
        <button 
          onClick={() => onRemove(question.id)}
          className="p-2 text-text-muted hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-all"
          title="Delete"
        >
          <Trash2 size={18} />
        </button>
        
        <div className="w-[1px] h-6 bg-border-1 mx-2" />
        
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Required</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={question.required}
              onChange={(e) => onUpdate(question.id, { required: e.target.checked })}
              className="sr-only peer" 
            />
            <div className="w-9 h-5 bg-surface-3 border border-border-2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-secondary after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent-blue peer-checked:after:bg-white peer-checked:border-accent-blue/50"></div>
          </label>
        </div>
      </div>
    </div>
  );
}
