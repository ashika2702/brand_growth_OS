"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Users, Search, Filter, AppWindow, ListTodo, Activity, QrCode } from 'lucide-react';
import LeadSidebar from '@/components/crm/LeadSidebar';
import PipelineView from '@/components/crm/views/PipelineView';
import AllLeadsTable from '@/components/crm/views/AllLeadsTable';
import QRCapture from '@/components/crm/views/QRCapture';
import GlobalActivitiesFeed from '@/components/crm/views/GlobalActivitiesFeed';
import GlobalTasksList from '@/components/crm/views/GlobalTasksList';
import AddLeadModal from '@/components/crm/AddLeadModal';

type TabView = 'pipeline' | 'all' | 'activities' | 'tasks' | 'qr';

export default function CRMPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabView>('pipeline');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch(`/api/crm/leads?clientId=${clientId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setLeads(data);
      } else {
        console.error('API returned non-array data:', data);
        setLeads([]);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (clientId) fetchLeads();
  }, [clientId, fetchLeads]);

  const updateLeadStage = async (leadId: string, stage: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage } : l));
    try {
      await fetch(`/api/crm/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage })
      });
    } catch (error) {
      console.error('Failed to update stage');
    }
  };

  const totalLeads = Array.isArray(leads) ? leads.length : 0;
  const wonThisMonth = Array.isArray(leads) 
    ? leads.filter(l => l.stage === 'won' && new Date(l.updatedAt).getMonth() === new Date().getMonth()).length
    : 0;
  
  const avgScore = totalLeads 
    ? Math.round(leads.reduce((acc, l) => acc + (l.score || 0), 0) / totalLeads) 
    : 0;
  
  const avgResponseTime = "1h 22m";

  const filteredLeads = Array.isArray(leads) ? leads.filter(lead => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      lead.name?.toLowerCase().includes(query) ||
      lead.email?.toLowerCase().includes(query) ||
      lead.personaTag?.toLowerCase().includes(query) ||
      lead.source?.toLowerCase().includes(query)
    );
  }) : [];

  if (loading) return <div className="p-8 text-white font-black uppercase italic animate-pulse">Synchronizing Leads...</div>;

  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-accent-blue/10 flex items-center justify-center text-accent-blue border border-accent-blue/20">
              <Users size={24} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Lead Pipeline</h1>
          </div>
          <p className="text-slate-500 font-medium">Manage and track your client acquisition infrastructure.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gradient-to-br from-accent-orange to-accent-red text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(255,77,0,0.3)] hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Lead
        </button>
      </div>

      <div className="flex items-center gap-6 border-b border-white/10 px-2 shrink-0">
        {[
          { id: 'pipeline', label: 'Pipeline', icon: AppWindow },
          { id: 'all', label: 'All Leads', icon: Users },
          { id: 'activities', label: 'Activities', icon: Activity },
          { id: 'tasks', label: 'Tasks', icon: ListTodo },
          { id: 'qr', label: 'QR Capture', icon: QrCode }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabView)}
            className={`flex items-center gap-2 pb-4 text-[11px] font-black uppercase tracking-widest transition-all relative
              ${activeTab === tab.id ? 'text-accent-blue' : 'text-slate-500 hover:text-white'}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-blue shadow-[0_0_8px_rgba(45,140,255,0.6)]" />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4 shrink-0">
        {[
          { label: 'Total Leads', val: totalLeads },
          { label: 'Won This Month', val: wonThisMonth },
          { label: 'Avg Score', val: avgScore },
          { label: 'Response Time', val: avgResponseTime },
        ].map((stat, i) => (
           <div key={i} className="glass-card p-4 rounded-2xl border border-white/5 flex items-center justify-between group">
             <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
               <p className="text-2xl font-black text-white italic">{stat.val}</p>
             </div>
             <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-accent-green group-hover:scale-110 transition-transform">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
             </div>
           </div>
        ))}
      </div>

      <div className="flex gap-4 p-2 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads by name" 
            className="w-full pl-12 pr-4 py-3 bg-transparent text-sm text-white outline-none placeholder:text-slate-600 font-medium"
          />
        </div>
        {/* <button className="flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all border border-white/5">
          <Filter className="w-4 h-4" />
          Filters
        </button> */}
      </div>

      <div className="flex-1 overflow-hidden">
         {activeTab === 'pipeline' && (
            <PipelineView 
               leads={filteredLeads}
               setLeads={setLeads}
               onSelectLead={(l) => {
                 setSelectedLead(l);
                 setIsSidebarOpen(true);
               }}
               updateLeadStage={updateLeadStage}
            />
         )}
         {activeTab === 'all' && (
            <AllLeadsTable leads={filteredLeads} />
         )}
         {activeTab === 'activities' && (
            <GlobalActivitiesFeed leads={leads} />
         )}
         {activeTab === 'tasks' && (
            <GlobalTasksList leads={leads} onUpdateTask={fetchLeads} />
         )}
         {activeTab === 'qr' && (
            <QRCapture clientId={clientId} />
         )}
      </div>

      {/* Lead Detail Sidebar */}
      <LeadSidebar 
        lead={selectedLead}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        refreshLeads={fetchLeads}
      />

      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        clientId={clientId}
        onSuccess={fetchLeads}
      />
    </div>
  );
}
