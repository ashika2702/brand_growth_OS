import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageSquare,
  Zap,
  PenLine,
  Clock,
  ChevronDown,
  Sparkles,
  Tag,
  ExternalLink,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  MapPin,
  FileText,
  Paperclip,
  Upload,
  Check,
  X,
  File,
  RefreshCw
} from 'lucide-react';

interface LeadDetailViewProps {
  lead: any;
  onBack: () => void;
  refreshLeads: () => Promise<void>;
  onUpdateLead?: (lead: any) => void;
  onNextLead?: () => void;
  onPrevLead?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export default function LeadDetailView({ lead, onBack, refreshLeads, onUpdateLead, onNextLead, onPrevLead, hasNext, hasPrev }: LeadDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline'>('overview');
  const [isDrafting, setIsDrafting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isSendingAutoPilot, setIsSendingAutoPilot] = useState(false);
  const [sequences, setSequences] = useState<any[]>([]);
  const [isAutoPilotActive, setIsAutoPilotActive] = useState(lead?.isAutoPilotActive || false);
  const [selectedSequenceId, setSelectedSequenceId] = useState(lead?.currentSequenceId || '');
  const [isUpdatingSequence, setIsUpdatingSequence] = useState(false);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  React.useEffect(() => {
    if (lead) {
      setIsAutoPilotActive(lead.isAutoPilotActive || false);
      setSelectedSequenceId(lead.currentSequenceId || '');
      setEditedLead(lead);
      fetchSuggestions();
      fetchSequences();
    }
  }, [lead?.id]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await fetch(`/api/crm/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedLead)
      });
      if (res.ok) {
        setIsEditing(false);
        await refreshLeads();
      }
    } catch (e) {
      console.error('Failed to save lead');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setEditedLead((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleCustomFieldChange = (key: string, value: any) => {
    setEditedLead((prev: any) => ({
      ...prev,
      customFields: { ...prev.customFields, [key]: value }
    }));
  };

  const handleSimulatedUpload = async () => {
    setIsUploading(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsUploading(false);
    // In a real app, this would call an API with FormData and update the attachments list.
  };

  const fetchSequences = async () => {
    try {
      const res = await fetch(`/api/crm/sequences?clientId=${lead.clientId || ''}`);
      const data = await res.json();
      setSequences(data || []);
    } catch (e) { console.error('Failed to fetch sequences') }
  };

  const handleInlineSave = async (field: string, value: any, isCustom: boolean = false) => {
    try {
      const payload = isCustom
        ? { customFields: { ...lead.customFields, [field]: value } }
        : { [field]: value };

      const res = await fetch(`/api/crm/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const updatedLeadData = await res.json();
        if (onUpdateLead) onUpdateLead(updatedLeadData);
        await refreshLeads();
        return true;
      }
    } catch (e) {
      console.error('Inline save failed');
    }
    return false;
  };

  const EditableField = ({ label, value, field, type = 'text', isCustom = false, className = "", action }: any) => {
    const [isEditingField, setIsEditingField] = useState(false);
    const [val, setVal] = useState(value || '');
    const [isSavingField, setIsSavingField] = useState(false);

    useEffect(() => {
      setVal(value || '');
    }, [value]);

    const onSave = async () => {
      setIsSavingField(true);
      const success = await handleInlineSave(field, val, isCustom);
      if (success) setIsEditingField(false);
      setIsSavingField(false);
    };

    if (isEditingField) {
      return (
        <div className={`space-y-1.5 text-left ${className}`}>
          <p className="text-[11px] text-text-muted uppercase font-bold tracking-widest">{label}</p>
          <div className="flex items-center gap-2 group/input">
            {type === 'textarea' ? (
              <textarea
                value={val}
                autoFocus
                onChange={e => setVal(e.target.value)}
                className="flex-1 bg-surface-1 border-2 border-blue-500 rounded-lg p-2 text-[14px] outline-none text-text-primary focus:border-accent-blue/50 min-h-[100px]"
              />
            ) : (
              <input
                type={type}
                value={val}
                autoFocus
                onChange={e => setVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onSave()}
                className="flex-1 bg-surface-1 border-2 border-blue-500 rounded-md px-2 py-1 text-[15px] outline-none text-text-primary focus:border-accent-blue/50 font-medium"
              />
            )}
            <div className="flex flex-col gap-1">
              <button
                onClick={onSave}
                disabled={isSavingField}
                className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm"
              >
                {isSavingField ? <RefreshCw size={12} className="animate-spin" /> : <Check size={12} />}
              </button>
              <button
                onClick={() => { setIsEditingField(false); setVal(value); }}
                className="p-1.5 bg-surface-3 text-text-secondary rounded hover:bg-surface-3/80 transition-colors border border-border-1"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`group space-y-1.5 text-left -my-1 py-1 px-2 rounded-md transition-colors relative ${className}`}
      >
        <p className="text-[11px] text-text-muted uppercase font-bold tracking-widest">{label}</p>
        <div className="flex items-center justify-between gap-2 min-h-[22px]">
          {action && !isEditingField ? (
            <a
              href={action}
              onClick={(e) => e.stopPropagation()} // Prevent triggering edit mode on link click
              className="text-[15px] text-blue-600 font-bold hover:underline truncate flex items-center gap-2"
            >
              {value || '—'}
              {label.includes('Phone') && <Phone size={12} className="text-emerald-500" />}
            </a>
          ) : (
            <p
              onClick={() => setIsEditingField(true)}
              className={`text-[15px] text-text-primary font-bold truncate cursor-pointer ${type === 'textarea' ? 'whitespace-pre-wrap' : ''}`}
            >
              {value || '—'}
            </p>
          )}
          <button
            onClick={() => setIsEditingField(true)}
            className="p-1 hover:bg-surface-3/80 rounded transition-colors"
          >
            <PenLine size={12} className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </button>
        </div>
      </div>
    );
  };

  const fetchSuggestions = async () => {
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
    } catch (e) {
      console.error('Drafting failed');
    } finally {
      setIsDrafting(false);
    }
  };

  const getActivityIcon = (type: string, metadata?: any) => {
    switch (type) {
      case 'call': return <Phone size={12} />;
      case 'email':
      case 'email_reply': return <Mail size={12} />;
      case 'email_sent':
        return metadata?.isAutoReply ? <Zap size={12} className="text-blue-600" /> : <Mail size={12} />;
      case 'whatsapp': return <MessageSquare size={12} />;
      case 'note': return <PenLine size={12} />;
      case 'stage_change': return <span className="rotate-90">➔</span>;
      default: return <Clock size={12} />;
    }
  };

  return (
    <div className="h-full bg-surface-1 flex flex-col rounded-[2.5rem] border border-border-1 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Zoho-Style Persistent Header */}
      <div className="p-4 border-b border-border-1 flex flex-col gap-4 bg-surface-1 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-1 hover:bg-surface-3 rounded text-text-secondary transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="w-10 h-10 rounded-lg bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-700 font-bold text-lg uppercase">
              {lead.name[0]}
            </div>
            <div className="flex flex-col text-left">
              <h2 className="text-[17px] font-bold text-text-primary leading-none">
                {lead.name} <span className="text-text-muted font-normal"> - {lead.intent || 'Enquiry'}</span>
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">

            <div className="flex gap-1">
              <button 
                onClick={onPrevLead} 
                disabled={!hasPrev} 
                className={`p-2 rounded transition-colors ${hasPrev ? 'hover:bg-surface-3 text-text-secondary' : 'text-text-muted/60 cursor-not-allowed'}`}
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={onNextLead} 
                disabled={!hasNext} 
                className={`p-2 rounded transition-colors ${hasNext ? 'hover:bg-surface-3 text-text-secondary' : 'text-text-muted/60 cursor-not-allowed'}`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Tab switcher inside the view */}
        <div className="flex gap-8 px-6">
          {['overview', 'timeline'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-2 text-[14px] font-medium capitalize transition-all relative ${activeTab === tab ? 'text-blue-600' : 'text-text-secondary hover:text-text-primary'
                }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-surface-2/50 no-scrollbar">
        {activeTab === 'overview' ? (
          <div className="max-w-7xl mx-auto p-4 space-y-4 animate-in fade-in duration-500">
            {/* Basic Details Grid */}
            <div className="bg-surface-1 border border-border-1 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-surface-2 px-4 py-2 border-b border-border-1 flex items-center justify-between">
                <h3 className="text-[12px] font-black text-text-secondary uppercase tracking-widest">Basic Details</h3>
                <div className="flex gap-4">
                  <span className="text-[11px] text-blue-600 font-bold cursor-pointer uppercase">View Business Card</span>
                </div>
              </div>
              <div className="p-6 grid grid-cols-2 gap-y-4 gap-x-12 shadow-sm">
                <div className="space-y-1.5 text-left">
                  <p className="text-[11px] text-text-muted uppercase font-bold tracking-widest">Lead Owner</p>
                  <p className="text-[15px] text-text-primary font-bold">{(lead as any).assignedTo || '-'}</p>
                </div>
                <EditableField
                  label="Lead Name"
                  value={lead.name}
                  field="name"
                />
                <EditableField
                  label="Email"
                  value={lead.email}
                  field="email"
                  type="email"
                  action={`mailto:${lead.email}`}
                />
                <EditableField
                  label="Phone No."
                  value={lead.phone}
                  field="phone"
                  type="tel"
                  action={`tel:${lead.phone}`}
                />
                <div className="space-y-1.5 text-left">
                  <p className="text-[11px] text-text-muted uppercase font-bold tracking-widest">Lead Source</p>
                  <p className="text-[15px] text-text-primary font-medium uppercase tracking-tighter">{lead.source}</p>
                </div>
                <div className="space-y-1.5 text-left">
                  <p className="text-[11px] text-text-muted uppercase font-bold tracking-widest">Lead Status</p>
                  <div className="flex items-center gap-2">
                    <span className={`${lead.stage === 'lost' ? 'bg-slate-300' : 'bg-emerald-500'} w-2 h-2 rounded-full`} />
                    <p className="text-[15px] text-text-primary font-bold uppercase tracking-tight">{lead.stage}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="bg-surface-1 border border-border-1 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-surface-2 px-6 py-2 border-b border-border-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-text-secondary" />
                  <h3 className="text-[12px] font-black text-text-secondary uppercase tracking-widest">Address Information</h3>
                </div>
              </div>
              <div className="p-6 grid grid-cols-2 gap-y-4 gap-x-12">
                <EditableField label="Street" value={lead.addressStreet} field="addressStreet" />
                <EditableField label="City" value={lead.addressCity} field="addressCity" />
                <EditableField label="State" value={lead.addressState} field="addressState" />
                <EditableField label="Pin Code" value={lead.addressZip} field="addressZip" />
                <EditableField label="Country" value={lead.addressCountry} field="addressCountry" className="col-span-2" />
              </div>
            </div>

            {/* Description & Notes Section */}
            <div className="bg-surface-1 border border-border-1 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-surface-2 px-6 py-2 border-b border-border-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-text-secondary" />
                  <h3 className="text-[12px] font-black text-text-secondary uppercase tracking-widest">Description Information</h3>
                </div>
              </div>
              <div className="p-6">
                <EditableField
                  label="Description"
                  value={lead.description}
                  field="description"
                  type="textarea"
                />
              </div>
            </div>

            {/* Lead Application Information (Custom Q&A Style) */}
            <div className="bg-surface-1 border border-border-1 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-surface-2 px-6 py-2 border-b border-border-1 flex items-center justify-between">
                <h3 className="text-[12px] font-black text-text-secondary uppercase tracking-widest">Lead Form Questions (Q&A)</h3>
                <span className="text-[11px] text-blue-500 font-bold">Captured via Form</span>
              </div>
              <div className="p-6 grid grid-cols-1 gap-y-4 max-w-4xl">
                {/* Requirement / Intent */}
                <EditableField
                  label="Core Requirement"
                  value={lead.intent}
                  field="intent"
                  className="border-b border-slate-50 pb-2"
                />

                {/* Iterate through ALL custom form details in a Q&A list */}
                {lead.customFields && Object.entries(lead.customFields).map(([key, value]) => (
                  <EditableField
                    key={key}
                    label={key.replace(/_/g, ' ')}
                    value={String(value)}
                    field={key}
                    isCustom={true}
                    className="border-t border-slate-50 pt-2"
                  />
                ))}
              </div>
            </div>

            {/* Attachments Section */}
            <div className="bg-surface-1 border border-border-1 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-surface-2 px-6 py-2 border-b border-border-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Paperclip size={16} className="text-text-secondary" />
                  <h3 className="text-[12px] font-black text-text-secondary uppercase tracking-widest">Attachments</h3>
                </div>
                <label className="text-[11px] text-blue-600 font-bold uppercase cursor-pointer hover:underline flex items-center gap-1">
                  <Upload size={12} />
                  Upload File
                  <input type="file" className="hidden" onChange={handleSimulatedUpload} />
                </label>
              </div>
              <div className="p-4">
                {lead.attachments && lead.attachments.length > 0 ? (
                  <div className="grid grid-cols-4 gap-6">
                    {lead.attachments.map((file: any) => (
                      <div key={file.id} className="border border-border-1 rounded-xl p-4 flex flex-col items-center gap-3 hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="w-12 h-12 bg-surface-3 rounded-lg flex items-center justify-center text-text-muted group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                          <File size={24} />
                        </div>
                        <p className="text-[12px] font-bold text-text-primary truncate w-full text-center">{file.fileName}</p>
                        <p className="text-[10px] text-text-muted uppercase font-black tracking-tighter">{(file.fileSize / 1024).toFixed(1)} KB</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center bg-surface-2/50 rounded-2xl border-2 border-dashed border-border-1">
                    <div className="w-12 h-12 rounded-full bg-surface-3 flex items-center justify-center text-text-muted mb-3">
                      <Paperclip size={24} />
                    </div>
                    <p className="text-sm font-bold text-text-secondary leading-tight">No attachments found</p>
                    {isUploading && (
                      <div className="mt-4 flex items-center gap-2 text-blue-600 font-bold text-xs animate-pulse">
                        <RefreshCw size={12} className="animate-spin" /> Uploading...
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>


          </div>
        ) : (
          <div className="max-w-4xl mx-auto p-12 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-bold text-text-primary">Activity History</h3>
              <div className="flex items-center gap-2 text-[13px] font-bold text-blue-600 cursor-pointer">
                Upcoming Automated Actions <ChevronDown size={16} />
              </div>
            </div>

            <div className="relative border-l-2 border-border-1 ml-4 space-y-12 pl-12 pb-12">
              {/* Creation Event */}
              <div className="relative">
                <div className="absolute -left-[58px] top-0 w-8 h-8 rounded-full bg-surface-3 border-4 border-white flex items-center justify-center shadow-sm">
                  <Tag size={12} className="text-text-secondary" />
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-4">
                    <span className="text-[14px] text-text-secondary font-bold">{new Date(lead.createdAt).toLocaleTimeString()}</span>
                    <span className="text-[17px] font-bold text-text-primary tracking-tight">Lead Capture Successful</span>
                  </div>
                  <span className="text-sm text-text-muted mt-1">Ingested via {lead.source} workflow</span>
                </div>
              </div>

              {/* Activities */}
              {lead.activities?.map((act: any) => (
                <div key={act.id} className="relative group">
                  <div className="absolute -left-[58px] top-0 w-8 h-8 rounded-full bg-blue-50 border-4 border-white group-hover:bg-blue-100 transition-colors flex items-center justify-center shadow-sm">
                    {getActivityIcon(act.type, act.metadata)}
                  </div>
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-4">
                      <span className="text-[14px] text-text-secondary font-bold">{new Date(act.createdAt).toLocaleTimeString()}</span>
                      <span className="text-[17px] font-bold text-text-primary tracking-tight capitalize">{act.type.replace('_', ' ')}</span>
                    </div>
                    <div className="mt-3 bg-surface-1 border border-border-1 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow inline-block max-w-2xl">
                      <p className="text-[15px] text-text-secondary leading-relaxed font-medium">
                        {act.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
