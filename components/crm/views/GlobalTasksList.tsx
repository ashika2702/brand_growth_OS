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
      <div className="h-full flex flex-col items-center justify-center border border-dashed border-white/5 rounded-3xl p-12 text-center">
        <CheckSquare className="w-12 h-12 text-slate-700 mb-4 opacity-20" />
        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">No Tasks Assigned</h3>
        <p className="text-[10px] text-slate-500 max-w-xs">Create follow-up tasks in the Lead sidebar to manage your sales workflow here.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-20 space-y-8">
      {/* Pending Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pending Actions</h3>
            <span className="bg-accent-orange/20 text-accent-orange px-2 py-0.5 rounded-lg text-[9px] font-bold border border-accent-orange/10">
                {pendingTasks.length}
            </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingTasks.map((task) => {
            const isDueToday = new Date(task.dueDate).toDateString() === new Date().toDateString();
            const isOverdue = new Date(task.dueDate) < new Date() && !isDueToday;

            return (
              <div key={task.id} className={`glass-card p-4 rounded-2xl border transition-all hover:border-white/20 ${isOverdue ? 'border-accent-red/30' : 'border-white/5'}`}>
                <div className="flex items-start gap-3">
                  <button 
                    onClick={() => toggleTask(task.id, task.isCompleted)}
                    className="mt-1 w-5 h-5 rounded-lg border border-slate-700 flex items-center justify-center hover:border-white transition-colors"
                  >
                    <div className="w-2.5 h-2.5 rounded-sm" />
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white mb-1 group-hover:text-accent-blue transition-colors line-clamp-2">{task.title}</p>
                    
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 py-1 px-2 bg-white/5 rounded-lg w-fit">
                            <User size={10} className="text-slate-500" />
                            <span className="text-[9px] font-black uppercase tracking-tighter text-slate-300">{task.lead.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {isOverdue ? <AlertCircle size={10} className="text-accent-red" /> : <Clock size={10} className={isDueToday ? "text-accent-orange" : "text-slate-500"} />}
                            <span className={`text-[9px] font-black uppercase tracking-widest ${isOverdue ? "text-accent-red" : isDueToday ? "text-accent-orange" : "text-slate-500"}`}>
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
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest px-2 italic">All caught up!</p>
        )}
      </div>

      {/* Completed Section (Collapsed by default logic in UI) */}
      {completedTasks.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-white/5 opacity-50">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-2">Recently Completed</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedTasks.slice(0, 6).map((task) => (
                    <div key={task.id} className="bg-black/20 p-4 rounded-2xl border border-white/5 flex items-start gap-3">
                        <CheckSquare size={16} className="text-accent-green mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-slate-500 line-through">{task.title}</p>
                            <p className="text-[9px] font-black uppercase text-slate-600 mt-1">{task.lead.name}</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>
      )}
    </div>
  );
}
