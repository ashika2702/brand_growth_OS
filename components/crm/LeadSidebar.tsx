"use client";

import React, { useState } from 'react';
import { X, Mail, Phone, Calendar, Tag, MessageSquare, ExternalLink, Zap, Clock, PenLine, CheckSquare, ChevronDown, ChevronUp } from 'lucide-react';

interface Activity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
  dueDate: string;
  isCompleted: boolean;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  personaTag: string | null;
  stage: string;
  score: number;
  source: string | null;
  createdAt: string;
  activities?: Activity[];
  tasks?: Task[];
  utmSource?: string | null;
  utmCampaign?: string | null;
}

interface LeadSidebarProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  refreshLeads: () => Promise<void>;
}

export default function LeadSidebar({ lead, isOpen, onClose, refreshLeads }: LeadSidebarProps) {
  const [addingNote, setAddingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [addingTask, setAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [tasksExpanded, setTasksExpanded] = useState(true);

  if (!lead) return null;

  const logActivity = async (type: string, description: string) => {
    try {
      await fetch(`/api/crm/leads/${lead.id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, description })
      });
      await refreshLeads();
    } catch (e) { console.error('Failed to log activity') }
  };

  const addTask = async () => {
    if (!taskTitle) return;
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 1); // default due tomorrow
      await fetch(`/api/crm/leads/${lead.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'follow_up', title: taskTitle, dueDate })
      });
      setTaskTitle('');
      setAddingTask(false);
      await refreshLeads();
    } catch (e) { console.error('Failed to add task') }
  };

  const completeTask = async (taskId: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/crm/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !currentStatus })
      });
      await refreshLeads();
    } catch (e) { console.error('Failed to update task') }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone size={12} />;
      case 'email': return <Mail size={12} />;
      case 'whatsapp': return <MessageSquare size={12} />;
      case 'note': return <PenLine size={12} />;
      case 'stage_change': return <span className="rotate-90">➔</span>;
      default: return <Zap size={12} />;
    }
  };

  const handleWhatsApp = () => {
    const draft = `Hi ${lead.name.split(' ')[0]},\n\nI was reviewing your interest in our premium scaling infrastructure. As someone matching our ${lead.personaTag || 'ideal'} profile, I believe we have a high synergy.\n\nAre you available for a quick chat today?`;
    window.open(`https://wa.me/${lead.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(draft)}`, '_blank');
    logActivity('whatsapp', 'Initiated AI-drafted WhatsApp chat');
  };

  return (
    <div className={`fixed inset-y-0 right-0 w-[480px] bg-[#0A0D14]/95 backdrop-blur-3xl border-l border-[#1F1F1F] z-50 transform transition-transform duration-500 shadow-[0_0_50px_rgba(0,0,0,0.8)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
           <div className="flex items-center gap-4">
              <div className="relative">
                <svg className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] -rotate-90 transform" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="283" strokeDashoffset={283 - (283 * lead.score) / 100} className="text-accent-blue transition-all duration-1000 ease-out" />
                </svg>
                <div className="w-12 h-12 rounded-2xl bg-[#12141A] border border-white/10 flex items-center justify-center text-white font-black text-xl z-10 relative">
                  {lead.name[0]}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none mb-1">{lead.name}</h2>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                   <span className="bg-[#A855F7]/20 text-[#A855F7] px-2 py-0.5 rounded-md border border-[#A855F7]/30">{lead.personaTag || 'General'}</span>
                   <span>•</span>
                   <span>{lead.source}</span>
                </div>
              </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all">
             <X size={20} />
           </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
          
          {/* AI Assist Chip Always Visible */}
          <button onClick={handleWhatsApp} className="w-full relative group overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-[#A855F7]/20 to-accent-blue/20 opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-4 border border-white/10 flex flex-col items-center justify-center gap-1 backdrop-blur-sm">
               <div className="flex items-center gap-2 text-[#A855F7]">
                 <Zap size={14} fill="currentColor" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-white mt-0.5">Alex AI Assist</span>
               </div>
               <p className="text-xs text-slate-300">Draft personalized follow-up for this lead.</p>
            </div>
          </button>

          {/* Quick Actions Row */}
          <div className="grid grid-cols-5 gap-2">
            {[
              { id: 'call', icon: Phone, label: 'Call', action: () => { window.location.href=`tel:${lead.phone}`; logActivity('call', 'Initiated phone call') } },
              { id: 'email', icon: Mail, label: 'Email', action: () => { window.location.href=`mailto:${lead.email}`; logActivity('email', 'Initiated email draft') } },
              { id: 'wa', icon: MessageSquare, label: 'WhatsApp', action: handleWhatsApp },
              { id: 'note', icon: PenLine, label: 'Note', action: () => setAddingNote(!addingNote) },
              { id: 'task', icon: CheckSquare, label: 'Task', action: () => setAddingTask(!addingTask) }
            ].map(action => (
              <button key={action.id} onClick={action.action} className="flex flex-col items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group">
                 <action.icon size={16} className="text-slate-400 group-hover:text-white" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-300">{action.label}</span>
              </button>
            ))}
          </div>

          {/* Add Note Inline Form */}
          {addingNote && (
            <div className="p-4 bg-black/40 border border-white/10 rounded-2xl">
              <textarea 
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Type your note here..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-600 outline-none resize-none min-h-[60px]"
                autoFocus
              />
              <div className="flex justify-end mt-2">
                <button 
                  onClick={() => { logActivity('note', noteText); setNoteText(''); setAddingNote(false); }}
                  className="bg-accent-blue text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-colors"
                >
                  Save Note
                </button>
              </div>
            </div>
          )}

          {/* Follow-up Tasks */}
          <div className="space-y-3">
             <div className="flex items-center justify-between cursor-pointer" onClick={() => setTasksExpanded(!tasksExpanded)}>
                <div className="flex items-center gap-2">
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Follow-up Tasks</h3>
                   {lead.tasks && lead.tasks.filter(t => !t.isCompleted).length > 0 && (
                      <span className="bg-accent-orange/20 text-accent-orange px-1.5 rounded text-[9px] font-black">
                        {lead.tasks.filter(t => !t.isCompleted).length} Due
                      </span>
                   )}
                </div>
                {tasksExpanded ? <ChevronUp size={14} className="text-slate-600" /> : <ChevronDown size={14} className="text-slate-600" />}
             </div>
             
             {tasksExpanded && (
               <div className="space-y-2">
                 {lead.tasks?.map(task => {
                   const isDueToday = new Date(task.dueDate).toDateString() === new Date().toDateString();
                   return (
                     <div key={task.id} className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${task.isCompleted ? 'bg-white/5 border-white/5 opacity-50' : isDueToday ? 'bg-accent-orange/10 border-accent-orange/30' : 'bg-white/5 border-white/10'}`}>
                       <button onClick={() => completeTask(task.id, task.isCompleted)} className="mt-0.5 text-slate-500 hover:text-white">
                         {task.isCompleted ? <CheckSquare size={14} className="text-accent-green" /> : <div className="w-3.5 h-3.5 rounded-sm border border-slate-500" />}
                       </button>
                       <div className="flex-1">
                         <p className={`text-sm font-medium ${task.isCompleted ? 'line-through text-slate-500' : 'text-white'}`}>{task.title}</p>
                         <div className="flex items-center gap-2 mt-1">
                           <Clock size={10} className={isDueToday && !task.isCompleted ? "text-accent-orange" : "text-slate-500"} />
                           <span className={`text-[9px] font-black uppercase tracking-widest ${isDueToday && !task.isCompleted ? "text-accent-orange" : "text-slate-500"}`}>
                             {isDueToday ? 'Due Today' : new Date(task.dueDate).toLocaleDateString()}
                           </span>
                         </div>
                       </div>
                     </div>
                   );
                 })}
                 
                 {addingTask ? (
                   <div className="p-3 bg-black/40 border border-white/10 rounded-xl flex gap-2">
                     <input 
                        type="text" 
                        value={taskTitle} 
                        onChange={e => setTaskTitle(e.target.value)} 
                        autoFocus
                        placeholder="Task title..." 
                        className="bg-transparent text-sm text-white outline-none flex-1" 
                     />
                     <button onClick={addTask} className="text-[10px] font-black uppercase text-accent-blue">Add</button>
                   </div>
                 ) : (
                   <button onClick={() => setAddingTask(true)} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest inline-flex items-center gap-1">
                     + Add Task
                   </button>
                 )}
               </div>
             )}
          </div>

          {/* Lead Intelligence */}
          <div className="space-y-3">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lead Intelligence Touchpoints</h3>
             <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                   <p className="text-[9px] text-slate-500 uppercase font-black mb-1">UTM Source / Campaign</p>
                   <p className="text-xs text-slate-300 font-medium">{lead.utmSource || 'Direct'} / {lead.utmCampaign || 'None'}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                   <p className="text-[9px] text-slate-500 uppercase font-black mb-1">Estimated Time on Site</p>
                   <p className="text-xs text-slate-300 font-medium">4m 12s</p>
                </div>
             </div>
          </div>

          {/* Activity Timeline */}
          <div className="space-y-4">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Activity Timeline</h3>
             <div className="space-y-0 relative ml-4 border-l border-white/10 pl-6 pb-4">
                {lead.activities?.map((act, i) => (
                  <div key={act.id} className="relative pb-6 last:pb-0">
                     <div className="absolute left-[-31.5px] top-1 w-5 h-5 rounded-full bg-[#12141A] border border-white/20 flex items-center justify-center text-slate-400">
                        {getActivityIcon(act.type)}
                     </div>
                     <p className="text-[10px] font-black text-white uppercase tracking-widest mb-0.5">{act.type.replace('_', ' ')}</p>
                     <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{act.description}</p>
                     <p className="text-[9px] font-black text-slate-600 uppercase mt-1">{new Date(act.createdAt).toLocaleString()}</p>
                  </div>
                ))}
                {(!lead.activities || lead.activities.length === 0) && (
                  <div className="text-xs text-slate-500 italic">No activities recorded yet.</div>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
