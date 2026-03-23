"use client";

import React from 'react';
import { 
  Calendar, 
  Columns, 
  Plus, 
  Sparkles, 
  Inbox, 
  CheckCircle2, 
  History,
  Lightbulb
} from 'lucide-react';
import { useClientStore } from '@/lib/store';
import KanbanBoard from '@/components/content/KanbanBoard';
import IntelligenceBar from '@/components/content/IntelligenceBar';
import NewRequestPanel from '@/components/content/NewRequestPanel';

type TabType = 'Kanban' | 'Calendar' | 'Queue' | 'Published';

export default function ContentTapPage() {
  const { activeClientId } = useClientStore();
  const [activeTab, setActiveTab] = React.useState<TabType>('Kanban');
  const [isNewRequestOpen, setIsNewRequestOpen] = React.useState(false);
  const [isOrchestrating, setIsOrchestrating] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  const handleFillGaps = async () => {
    if (!activeClientId) return;
    setIsOrchestrating(true);
    try {
        await fetch('/api/content/orchestrate', {
            method: 'POST',
            body: JSON.stringify({ clientId: activeClientId }),
        });
        handleRefresh();
    } catch (e) {
        console.error('Orchestration failed');
    } finally {
        setIsOrchestrating(false);
    }
  };

  const tabs: { id: TabType; icon: React.ElementType; label: string }[] = [
    { id: 'Kanban', icon: Columns, label: 'Kanban' },
    { id: 'Calendar', icon: Calendar, label: 'Calendar' },
    { id: 'Queue', icon: Inbox, label: 'Queue' },
    { id: 'Published', icon: CheckCircle2, label: 'Published' },
  ];

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black italic text-white tracking-tighter uppercase">Content Tap <span className="text-accent-blue">v2.0</span></h1>
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                <div className={`w-1.5 h-1.5 rounded-full bg-accent-blue ${isOrchestrating ? 'animate-ping' : 'animate-pulse'}`} />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {isOrchestrating ? 'Agent Orchestrating...' : 'AI Pipeline Active'}
                </span>
            </div>
        </div>

        <div className="flex items-center gap-3">
            {/* <button 
                onClick={handleFillGaps}
                disabled={isOrchestrating}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 transition-all group disabled:opacity-50"
            >
                <Sparkles size={14} className={`text-accent-blue transition-transform ${isOrchestrating ? 'animate-spin' : 'group-hover:rotate-12'}`} />
                {isOrchestrating ? 'Filling Gaps...' : 'AI Fill Gaps'}
            </button> */}
            <button 
                onClick={() => setIsNewRequestOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-accent-blue hover:bg-blue-600 border border-blue-400/50 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-[0_0_20px_rgba(62,128,255,0.3)] hover:shadow-[0_0_30px_rgba(62,128,255,0.5)]"
            >
                <Plus size={14} />
                New Request
            </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeTab === tab.id 
                        ? 'bg-white/10 text-white shadow-lg' 
                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                    }`}
                >
                    <tab.icon size={14} className={activeTab === tab.id ? 'text-accent-blue' : ''} />
                    {tab.label}
                </button>
            ))}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-hidden min-h-0 bg-[#0D0D0D]/50 border border-white/5 rounded-3xl backdrop-blur-3xl relative">
        {activeTab === 'Kanban' && <KanbanBoard key={refreshKey} clientId={activeClientId || ''} />}
        {/* Other tabs will be implemented soon */}
      </div>

      {/* Intelligence Bar */}
      <IntelligenceBar clientId={activeClientId || ''} />

      {/* Slide-over Panel */}
      <NewRequestPanel 
        isOpen={isNewRequestOpen} 
        onClose={() => setIsNewRequestOpen(false)} 
        clientId={activeClientId || ''} 
        onRefresh={handleRefresh}
      />
    </div>
  );
}
