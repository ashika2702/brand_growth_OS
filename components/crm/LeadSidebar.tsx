"use client";

import React, { useState } from 'react';
import { X, Mail, Phone, Calendar, Tag, MessageSquare, ExternalLink, Zap, Clock, PenLine, CheckSquare, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface Activity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  metadata?: any;
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
  gclid?: string | null;
  fbclid?: string | null;
  li_fat_id?: string | null;
  intent?: string | null;
  customFields?: any;
  isAutoPilotActive?: boolean;
  currentSequenceId?: string | null;
}

interface LeadSidebarProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  refreshLeads: () => Promise<void>;
}

export default function LeadSidebar({ lead, isOpen, onClose, refreshLeads }: LeadSidebarProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline'>('overview');
  const [addingNote, setAddingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [addingTask, setAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [tasksExpanded, setTasksExpanded] = useState(true);
  const [isDrafting, setIsDrafting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isSendingAutoPilot, setIsSendingAutoPilot] = useState(false);
  const [sequences, setSequences] = useState<any[]>([]);
  const [isAutoPilotActive, setIsAutoPilotActive] = useState(lead?.isAutoPilotActive || false);
  const [selectedSequenceId, setSelectedSequenceId] = useState(lead?.currentSequenceId || '');
  const [isUpdatingSequence, setIsUpdatingSequence] = useState(false);

  React.useEffect(() => {
    if (lead) {
      setIsAutoPilotActive(lead.isAutoPilotActive || false);
      setSelectedSequenceId(lead.currentSequenceId || '');
    }
  }, [lead]);

  const fetchSequences = async () => {
    try {
      const res = await fetch(`/api/crm/sequences?clientId=${(lead as any).clientId || ''}`);
      const data = await res.json();
      setSequences(data || []);
    } catch (e) { console.error('Failed to fetch sequences') }
  };

  const fetchSuggestions = async () => {
    if (!lead) return;
    try {
      setLoadingSuggestions(true);
      const res = await fetch(`/api/crm/leads/${lead.id}/suggestions`);
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (e) {
      console.error('Failed to fetch suggestions');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Fetch suggestions and sequences when sidebar opens
  React.useEffect(() => {
    if (isOpen && lead) {
      fetchSuggestions();
      fetchSequences();
      setIsAutoPilotActive(lead.isAutoPilotActive || false);
      setSelectedSequenceId(lead.currentSequenceId || '');
    }
  }, [isOpen, lead?.id]);

  if (!lead) return null;

  const toggleAutoPilot = async () => {
    const newVal = !isAutoPilotActive;
    setIsAutoPilotActive(newVal);
    try {
      await fetch(`/api/crm/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAutoPilotActive: newVal })
      });
      await refreshLeads();
    } catch (e) { console.error('Failed to toggle Auto-Pilot') }
  };

  const handleSequenceChange = async (seqId: string) => {
    setSelectedSequenceId(seqId);
    setIsUpdatingSequence(true);
    try {
      await fetch(`/api/crm/leads/${lead.id}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sequenceId: seqId })
      });
      await refreshLeads();
    } catch (e) { console.error('Failed to enroll in sequence') }
    finally { setIsUpdatingSequence(false); }
  };

  const handleAIDraft = async (instruction?: string) => {
    setIsDrafting(true);
    try {
      const response = await fetch(`/api/crm/leads/${lead.id}/draft${instruction ? `?instruction=${encodeURIComponent(instruction)}` : ''}`);
      const data = await response.json();
      const draft = data.draft || `Hi ${lead.name.split(' ')[0]}, reaching out regarding your interest!`;

      window.open(`https://wa.me/${lead.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(draft)}`, '_blank');
      logActivity('whatsapp', 'Sent Personalized AI Follow-up');
    } catch (e) {
      console.error('Drafting failed');
    } finally {
      setIsDrafting(false);
    }
  };

  const handleAutoPilot = async () => {
    setIsSendingAutoPilot(true);
    try {
      const res = await fetch(`/api/crm/leads/${lead.id}/auto-followup`, { method: 'POST' });
      if (res.ok) {
        await refreshLeads();
      }
    } catch (e) {
      console.error('Auto-pilot failed');
    } finally {
      setIsSendingAutoPilot(false);
    }
  };

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

  const getActivityIcon = (type: string, metadata?: any) => {
    switch (type) {
      case 'call': return <Phone size={12} />;
      case 'email':
      case 'email_reply': return <Mail size={12} />;
      case 'email_sent':
        return metadata?.isAutoReply ? <Zap size={12} className="text-accent-blue" /> : <Mail size={12} />;
      case 'whatsapp': return <MessageSquare size={12} />;
      case 'note': return <PenLine size={12} />;
      case 'stage_change': return <span className="rotate-90">➔</span>;
      default: return <Clock size={12} />;
    }
  };

  const handleWhatsApp = () => {
    handleAIDraft();
  };

  return (
    <div className={`fixed inset-y-0 right-0 w-[480px] bg-surface-1/95 backdrop-blur-3xl border-l border-border-1 z-50 transform transition-transform duration-500 shadow-[0_0_50px_rgba(0,0,0,0.2)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-full flex flex-col">
        {/* Zoho-Style Header */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-col gap-4">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded text-slate-500">
                   <ChevronDown className="rotate-90" size={20} />
                </button>
                <div className="w-10 h-10 rounded-lg bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-700 font-bold text-lg uppercase">
                   {lead.name[0]}
                </div>
                <div className="flex flex-col">
                   <h2 className="text-[15px] font-bold text-slate-800 leading-none">
                      {lead.name} <span className="text-slate-400 font-normal"> - {lead.intent || 'No Requirement'}</span>
                   </h2>
                </div>
             </div>
             <div className="flex items-center gap-2">
                
                
                <div className="w-[1px] h-4 bg-slate-300 mx-1" />
                <button 
                  onClick={onClose}
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><X size={16} />
                </button>
             </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-8 px-4">
             {['overview', 'timeline'].map((tab) => (
                <button
                   key={tab}
                   onClick={() => setActiveTab(tab as any)}
                   className={`pb-2 text-[13px] font-medium capitalize transition-all relative ${
                      activeTab === tab ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
                   }`}
                >
                   {tab}
                   {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-full" />
                   )}
                </button>
             ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50">
           {activeTab === 'overview' ? (
              <div className="space-y-1 p-4">
                {/* Basic Details Grid */}
                <div className="bg-white border border-slate-200 rounded-lg p-6 grid grid-cols-2 gap-y-6 gap-x-12">
                   <div className="space-y-1 text-left">
                      <p className="text-[11px] text-slate-500 uppercase tracking-tight">Lead Owner</p>
                      <p className="text-[13px] text-slate-800 font-medium">{(lead as any).assignedTo || '-'}</p>
                   </div>
                   <div className="space-y-1 text-left">
                      <p className="text-[11px] text-slate-500 uppercase tracking-tight">Lead Name</p>
                      <p className="text-[13px] text-slate-800 font-medium">{lead.name}</p>
                   </div>
                   <div className="space-y-1 text-left">
                      <p className="text-[11px] text-slate-500 uppercase tracking-tight">Email</p>
                      <a href={`mailto:${lead.email}`} className="text-[13px] text-blue-600 hover:underline">{lead.email}</a>
                   </div>
                   <div className="space-y-1 text-left">
                      <p className="text-[11px] text-slate-500 uppercase tracking-tight">Phone No.</p>
                      <a 
                        href={`tel:${lead.phone}`}
                        onClick={() => logActivity('call', 'Initiated phone call from Sidebar')}
                        className="flex items-center gap-2 group cursor-pointer hover:text-blue-600 transition-colors"
                      >
                         <p className="text-[13px] text-slate-800 group-hover:text-blue-600 font-medium">{lead.phone || '—'}</p>
                         {lead.phone && <Phone size={12} className="text-emerald-500 group-hover:scale-110 transition-transform" />}
                      </a>
                   </div>
                   <div className="space-y-1 text-left">
                      <p className="text-[11px] text-slate-500 uppercase tracking-tight">Lead Source</p>
                      <p className="text-[13px] text-slate-800 font-medium uppercase tracking-tighter">{lead.source}</p>
                   </div>
                   <div className="space-y-1 text-left">
                      <p className="text-[11px] text-slate-500 uppercase tracking-tight">Lead Status</p>
                      <p className="text-[13px] text-slate-800 font-medium flex items-center gap-2">
                         <span className={`${lead.stage === 'lost' ? 'bg-slate-300' : 'bg-emerald-500'} w-2 h-2 rounded-full`} />
                         {lead.stage.toUpperCase()}
                      </p>
                   </div>
                </div>

                  {/* Ad Attribution Section */}
                  {(lead.gclid || lead.fbclid || lead.utmCampaign) && (
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden mt-4">
                       <div className="bg-slate-50 px-6 py-2 border-b border-slate-200 text-left">
                          <h3 className="text-[12px] font-bold text-slate-700 uppercase">Ad Attribution</h3>
                       </div>
                       <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-12">
                          {lead.utmCampaign && (
                            <div className="space-y-1 text-left col-span-2">
                               <p className="text-[11px] text-slate-500 uppercase tracking-tight">Campaign</p>
                               <p className="text-[13px] text-slate-800 font-bold">{lead.utmCampaign}</p>
                            </div>
                          )}
                          {lead.gclid && (
                             <div className="space-y-1 text-left col-span-2">
                                <p className="text-[11px] text-slate-500 uppercase tracking-tight">Google Click ID (GCLID)</p>
                                <p className="text-[10px] text-accent-orange font-mono break-all bg-accent-orange/5 p-2 rounded border border-accent-orange/10">{lead.gclid}</p>
                             </div>
                          )}
                          {lead.fbclid && (
                             <div className="space-y-1 text-left col-span-2">
                                <p className="text-[11px] text-slate-500 uppercase tracking-tight">
                                   {lead.utmSource?.toLowerCase().includes('instagram') ? 'Instagram' : lead.utmSource?.toLowerCase().includes('facebook') ? 'Facebook' : 'Meta'} Click ID (FBCLID)
                                </p>
                                <p className={`text-[10px] font-mono break-all p-2 rounded border ${
                                   lead.utmSource?.toLowerCase().includes('instagram') 
                                      ? 'text-pink-600 bg-pink-50 border-pink-100' 
                                      : 'text-blue-600 bg-blue-50 border-blue-100'
                                }`}>
                                   {lead.fbclid}
                                </p>
                             </div>
                          )}
                          {lead.li_fat_id && (
                             <div className="space-y-1 text-left col-span-2">
                                <p className="text-[11px] text-slate-500 uppercase tracking-tight">LinkedIn Click ID (LI_FAT_ID)</p>
                                <p className="text-[10px] text-blue-600 font-mono break-all bg-blue-50 p-2 rounded border border-blue-100 italic">{lead.li_fat_id}</p>
                             </div>
                          )}
                       </div>
                    </div>
                  )}

                 {/* Form Details Section */}
                 <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-50 px-6 py-2 border-b border-slate-200 text-left">
                       <h3 className="text-[12px] font-bold text-slate-700 uppercase">Lead Information</h3>
                    </div>
                    <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-12">
                       <div className="space-y-1 text-left">
                          <p className="text-[11px] text-slate-500 uppercase tracking-tight">Lead Owner</p>
                          <p className="text-[13px] text-slate-800">{lead.source}</p>
                       </div>
                       <div className="space-y-1 text-left">
                          <p className="text-[11px] text-slate-500 uppercase tracking-tight">Company</p>
                          <p className="text-[13px] text-slate-800">{lead.intent || 'General Enquiry'}</p>
                       </div>
                       <div className="space-y-1 text-left">
                          <p className="text-[11px] text-slate-500 uppercase tracking-tight">Lead Name</p>
                          <p className="text-[13px] text-slate-800">{lead.name}</p>
                       </div>
                       <div className="space-y-1 text-left">
                          <p className="text-[11px] text-slate-500 uppercase tracking-tight">Title</p>
                          <p className="text-[13px] text-slate-800">—</p>
                       </div>

                       {/* Custom Form Fields */}
                       {lead.customFields && Object.entries(lead.customFields).map(([key, value]) => (
                          <div key={key} className="space-y-1 text-left">
                             <p className="text-[11px] text-slate-500 uppercase tracking-tight">{key.replace(/_/g, ' ')}</p>
                             <p className="text-[13px] text-slate-800 font-medium">{String(value)}</p>
                          </div>
                       ))}
                    </div>
                 </div>


              </div>
           ) : (
              <div className="p-6">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[15px] font-bold text-slate-800">History</h3>
                    <div className="text-[12px] text-blue-600 font-medium flex items-center gap-1 cursor-pointer">
                       0 Upcoming Automated Actions <ChevronDown size={14} />
                    </div>
                 </div>

                 {/* Timeline History */}
                 <div className="relative border-l-2 border-slate-200 ml-3 space-y-10 pl-8 pb-10">
                    {/* Creation Event */}
                    <div className="relative">
                       <div className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-slate-200 border-4 border-white flex items-center justify-center">
                          <Tag size={10} className="text-slate-500" />
                       </div>
                       <div className="flex flex-col text-left">
                          <div className="flex items-center gap-3">
                             <span className="text-[12px] text-slate-500 font-medium">{new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                             <span className="text-[13px] font-bold text-slate-800">Lead Created</span>
                          </div>
                          <span className="text-[11px] text-slate-400 mt-0.5">by {lead.source} {new Date(lead.createdAt).toLocaleDateString()}</span>
                       </div>
                    </div>

                    {/* Dynamic Activities */}
                    {lead.activities?.map((act) => (
                       <div key={act.id} className="relative">
                          <div className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-blue-50 border-4 border-white flex items-center justify-center shadow-sm">
                             {getActivityIcon(act.type, act.metadata)}
                          </div>
                          <div className="flex flex-col text-left">
                             <div className="flex items-center gap-3">
                                <span className="text-[12px] text-slate-500 font-medium">{new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <span className="text-[13px] font-bold text-slate-800 capitalize">{act.type.replace('_', ' ')}</span>
                             </div>
                             <p className="text-[12px] text-slate-600 mt-1 leading-relaxed bg-white p-3 rounded-lg border border-slate-200 shadow-sm inline-block">
                                {act.description}
                             </p>
                             <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-tight font-medium">via Intelligence Core</span>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
}
