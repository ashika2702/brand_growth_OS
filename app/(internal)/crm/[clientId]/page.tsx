"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Users, Search, Filter, AppWindow, ListTodo, Activity, QrCode, RefreshCw, Share2 } from 'lucide-react';
import LeadSidebar from '@/components/crm/LeadSidebar';
import LeadDetailView from '@/components/crm/views/LeadDetailView';
import PipelineView from '@/components/crm/views/PipelineView';
import AllLeadsTable from '@/components/crm/views/AllLeadsTable';
import QRCapture from '@/components/crm/views/QRCapture';
import GlobalActivitiesFeed from '@/components/crm/views/GlobalActivitiesFeed';
import GlobalTasksList from '@/components/crm/views/GlobalTasksList';
import IntegrationsView from '@/components/crm/views/IntegrationsView';
import FormsView from '@/components/crm/views/FormsView';
import AddLeadModal from '@/components/crm/AddLeadModal';

type TabView = 'pipeline' | 'all' | 'activities' | 'tasks' | 'qr' | 'integrations' | 'forms';

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
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

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

  const handleSyncHub = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/crm/sync-inbox', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setLastSync(new Date());
        await fetchLeads();
      }
    } catch (error) {
      console.error('Hub Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

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

  const handleResolveGate = async (lead: any) => {
    if (!lead.humanGates || lead.humanGates.length === 0) return;
    
    // Optimistic UI: remove the shadow locally
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, humanGates: [] } : l));

    const gateId = lead.humanGates[0].id;
    try {
      const res = await fetch(`/api/crm/gates/${gateId}/resolve`, { method: 'POST' });
      if (res.ok) {
        await fetchLeads();
      }
    } catch (error) {
      console.error('Failed to resolve gate:', error);
    }
  };

  const totalLeads = Array.isArray(leads) ? leads.length : 0;
  const totalWon = Array.isArray(leads)
    ? leads.filter(l => l.stage === 'won').length
    : 0;

  const avgScore = totalLeads
    ? Math.round(leads.reduce((acc, l) => acc + (l.score || 0), 0) / totalLeads)
    : 0;

  const activeSequences = Array.isArray(leads)
    ? leads.filter(l => l.isAutoPilotActive).length
    : 0;

  const avgResponseTime = useMemo(() => {
    if (!Array.isArray(leads) || leads.length === 0) return "Standby";

    const responseTimes = leads
      .map(lead => {
        // Find outbound activity types
        const outbound = (lead.activities || [])
          .filter((a: any) => ['email', 'call', 'whatsapp'].includes(a.type))
          .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        if (outbound.length > 0) {
          const firstContactTime = new Date(outbound[0].createdAt).getTime();
          const creationTime = new Date(lead.createdAt).getTime();
          return Math.max(0, firstContactTime - creationTime);
        }
        return null;
      })
      .filter((t): t is number => t !== null);

    if (responseTimes.length === 0) return "N/A";

    const avgMs = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const totalMinutes = Math.round(avgMs / 60000);

    if (totalMinutes < 1) return "Just now";
    if (totalMinutes < 60) return `${totalMinutes}m`;
    
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }, [leads]);

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

  if (loading) return <div className="p-8 text-text-primary font-black uppercase italic animate-pulse transition-colors">Synchronizing Leads...</div>;

  return (
    <div className="h-full bg-background flex flex-col gap-6 overflow-hidden p-8">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-accent-blue/10 flex items-center justify-center text-accent-blue border border-accent-blue/20">
              <Users size={24} />
            </div>
            <h1 className="text-xl font-black text-text-primary tracking-tighter uppercase italic transition-colors">Lead Pipeline</h1>
          </div>
          <p className="text-text-muted font-medium transition-colors">Manage and track your client acquisition infrastructure.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end mr-2">
            <span className="text-[8px] font-black uppercase tracking-widest text-text-muted transition-colors">Neural Sync Status</span>
            <span className="text-[10px] font-medium text-text-secondary transition-colors">
              {lastSync ? `Last checked: ${lastSync.toLocaleTimeString()}` : 'Hub Standby'}
            </span>
          </div>

          <button
            onClick={handleSyncHub}
            disabled={isSyncing}
            className="flex items-center gap-2 bg-surface-2 hover:bg-surface-3 border border-border-1 hover:border-border-2 px-5 py-3 rounded-2xl transition-all group"
          >
            <RefreshCw size={14} className={`text-accent-blue ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-text-primary group-hover:text-accent-blue transition-colors">
              {isSyncing ? 'Syncing...' : 'Sync Hub'}
            </span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-br from-accent-orange to-accent-red text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(255,77,0,0.3)] hover:scale-[1.02] transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6 border-b border-border-1 px-2 shrink-0 transition-colors">
        {[
          { id: 'pipeline', label: 'Pipeline', icon: AppWindow },
          { id: 'all', label: 'All Leads', icon: Users },
          { id: 'activities', label: 'Activities', icon: Activity },
          { id: 'tasks', label: 'Tasks', icon: ListTodo },
          { id: 'qr', label: 'QR Capture', icon: QrCode },
          { id: 'forms', label: 'Forms', icon: ListTodo },
          { id: 'integrations', label: 'Integrations', icon: Share2 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabView)}
            className={`flex items-center gap-2 pb-4 text-[11px] font-black uppercase tracking-widest transition-all relative
              ${activeTab === tab.id ? 'text-accent-blue' : 'text-text-muted hover:text-text-primary'}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-blue shadow-[0_0_8px_rgba(45,140,255,0.6)]" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'pipeline' && (
          <div className="h-full flex flex-col gap-6">
            <div className="grid grid-cols-5 gap-4 shrink-0">
              {[
                { label: 'Total Leads', val: totalLeads },
                { label: 'Total Won', val: totalWon },
                { label: 'Active Sequences', val: activeSequences },
                { label: 'Avg Score', val: avgScore },
                { label: 'Response Time', val: avgResponseTime },
              ].map((stat, i) => (
                <div key={i} className="glass-card p-3 rounded-xl flex items-center justify-between group">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1 transition-colors">{stat.label}</p>
                    <p className="text-sm font-black text-text-primary italic transition-colors">{stat.val}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-accent-green group-hover:scale-110 transition-transform">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7V17" /></svg>
                  </div>
                </div>
              ))}
            </div>

            <PipelineView
              leads={filteredLeads}
              setLeads={setLeads}
              onSelectLead={(l) => {
                setSelectedLead(l);
                setIsSidebarOpen(true);
              }}
              updateLeadStage={updateLeadStage}
              onResolveGate={handleResolveGate}
            />
          </div>
        )}
        {activeTab === 'all' && (
          selectedLead ? (() => {
            const currentIndex = filteredLeads.findIndex(l => l.id === selectedLead.id);
            const hasNext = currentIndex >= 0 && currentIndex < filteredLeads.length - 1;
            const hasPrev = currentIndex > 0;
            return (
              <LeadDetailView 
                lead={selectedLead} 
                onBack={() => setSelectedLead(null)} 
                refreshLeads={fetchLeads} 
                onUpdateLead={setSelectedLead}
                onNextLead={hasNext ? () => setSelectedLead(filteredLeads[currentIndex + 1]) : undefined}
                onPrevLead={hasPrev ? () => setSelectedLead(filteredLeads[currentIndex - 1]) : undefined}
                hasNext={hasNext}
                hasPrev={hasPrev}
              />
            );
          })() : (
            <AllLeadsTable 
              leads={filteredLeads} 
              onSelectLead={(l) => setSelectedLead(l)} 
            />
          )
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
        {activeTab === 'forms' && (
          <FormsView clientId={clientId} />
        )}
        {activeTab === 'integrations' && (
          <IntegrationsView clientId={clientId} />
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
