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
    <div className="flex flex-col h-full gap-6 bg-background p-8 overflow-y-auto no-scrollbar">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black italic text-text-primary tracking-tight uppercase">Content Tap <span className="text-accent-blue">v2.0</span></h1>
            <div className="flex items-center gap-1 bg-surface-2 border border-border-1 rounded-full px-3 py-1">
                <div className={`w-1.5 h-1.5 rounded-full bg-accent-blue ${isOrchestrating ? 'animate-ping' : 'animate-pulse'}`} />
                <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">
                    {isOrchestrating ? 'Agent Orchestrating...' : 'AI Pipeline Active'}
                </span>
            </div>
        </div>

        <div className="flex items-center gap-3">
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
      <div className="flex items-center justify-between border-b border-border-1 pb-4">
        <div className="flex gap-1 bg-surface-2 p-1 rounded-xl border border-border-1">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeTab === tab.id 
                        ? 'bg-surface-3 text-text-primary shadow-sm' 
                        : 'text-text-muted hover:text-text-secondary hover:bg-surface-3/50'
                    }`}
                >
                    <tab.icon size={14} className={activeTab === tab.id ? 'text-accent-blue' : ''} />
                    {tab.label}
                </button>
            ))}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-hidden min-h-[500px] bg-surface-1 border border-border-1 rounded-3xl relative">
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
