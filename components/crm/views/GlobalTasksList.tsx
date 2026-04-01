"use client";

import React from 'react';
import { CheckSquare, Clock, User, AlertCircle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  dueDate: string;
  isCompleted: boolean;
  lead: {
    id: string;
    name: string;
  };
}

export default function GlobalTasksList({ leads, onUpdateTask }: { leads: any[], onUpdateTask?: () => void }) {
  // Aggregate all tasks from all leads
  const allTasks: Task[] = leads.flatMap(lead => 
    (lead.tasks || []).map((task: any) => ({
      ...task,
      lead: {
        id: lead.id,
        name: lead.name
      }
    }))
  ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const pendingTasks = allTasks.filter(t => !t.isCompleted);
  const completedTasks = allTasks.filter(t => t.isCompleted);

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/crm/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !currentStatus })
      });
      if (onUpdateTask) onUpdateTask();
    } catch (e) {
      console.error('Failed to update task');
    }
  };

  if (allTasks.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center border border-dashed border-border-1 rounded-3xl p-12 text-center transition-colors">
        <CheckSquare className="w-12 h-12 text-accent-orange mb-4 opacity-30" />
        <h3 className="text-[13px] font-black text-text-primary uppercase tracking-widest mb-1 transition-colors">No Tasks Assigned</h3>
        <p className="text-[10px] text-text-muted max-w-xs transition-colors">Create follow-up tasks in the Lead sidebar to manage your sales workflow here.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-20 space-y-8">
      {/* Pending Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2 transition-colors">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Pending Actions</h3>
            <span className="bg-accent-orange/20 text-accent-orange px-2 py-0.5 rounded-lg text-[9px] font-bold border border-accent-orange/10">
                {pendingTasks.length}
            </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingTasks.map((task) => {
            const isDueToday = new Date(task.dueDate).toDateString() === new Date().toDateString();
            const isOverdue = new Date(task.dueDate) < new Date() && !isDueToday;

            return (
              <div key={task.id} className={`glass-card p-4 rounded-2xl border transition-all hover:border-border-2 ${isOverdue ? 'border-accent-red/30' : 'border-border-1'}`}>
                <div className="flex items-start gap-3">
                  <button 
                    onClick={() => toggleTask(task.id, task.isCompleted)}
                    className="mt-1 w-5 h-5 rounded-lg border border-border-1 flex items-center justify-center hover:border-text-primary transition-colors bg-surface-1"
                  >
                    <div className="w-2.5 h-2.5 rounded-sm" />
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-primary mb-1 group-hover:text-accent-blue transition-colors line-clamp-2">{task.title}</p>
                    
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 py-1 px-2 bg-surface-2 rounded-lg w-fit border border-border-1">
                            <User size={10} className="text-text-muted" />
                            <span className="text-[9px] font-black uppercase tracking-tighter text-text-secondary">{task.lead.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 transition-colors">
                            {isOverdue ? <AlertCircle size={10} className="text-accent-red" /> : <Clock size={10} className={isDueToday ? "text-accent-orange" : "text-text-muted"} />}
                            <span className={`text-[9px] font-black uppercase tracking-widest ${isOverdue ? "text-accent-red" : isDueToday ? "text-accent-orange" : "text-text-muted"}`}>
                                {isDueToday ? 'Due Today' : isOverdue ? 'Overdue' : new Date(task.dueDate).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {pendingTasks.length === 0 && (
            <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest px-2 italic transition-colors">All caught up!</p>
        )}
      </div>

      {/* Completed Section (Collapsed by default logic in UI) */}
      {completedTasks.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-border-1 opacity-50 transition-colors">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-dim px-2">Recently Completed</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedTasks.slice(0, 6).map((task) => (
                    <div key={task.id} className="bg-surface-2 p-4 rounded-2xl border border-border-1 flex items-start gap-3 transition-colors">
                        <CheckSquare size={16} className="text-accent-green mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-text-muted line-through transition-colors">{task.title}</p>
                            <p className="text-[9px] font-black uppercase text-text-dim mt-1 transition-colors">{task.lead.name}</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>
      )}
    </div>
  );
}
