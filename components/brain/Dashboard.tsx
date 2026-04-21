'use client';

import React, { useState } from 'react';
import {
    Brain,
    Target,
    Zap,
    MessageSquare,
    ShieldCheck,
    History,
    Search,
    Plus,
    MoreVertical,
    Activity,
    User,
    ShoppingBag,
    Mic,
    ArrowUpRight,
    Sparkles,
    Mail
} from 'lucide-react';
import OverviewTab from './tabs/OverviewTab';
import PersonasTab from './tabs/PersonasTab';
import OffersTab from './tabs/OffersTab';
import VoiceTab from './tabs/VoiceTab';
import EmailTab from './tabs/EmailTab';
import SequenceBuilder from '../crm/SequenceBuilder';

interface BusinessBrainDashboardProps {
    clientId: string;
    initialData: any;
}

export default function BusinessBrainDashboard({ clientId, initialData }: BusinessBrainDashboardProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [data, setData] = useState(initialData);

    // Brain Health Score Calculation
    const calculateHealth = () => {
        let score = 0;
        if (data?.personas?.length > 0) score += 20;
        if (data?.offers?.length > 0) score += 20;
        if (data?.voiceGuide?.tone) score += 20;
        if (data?.competitorIntel) score += 20;
        if (data?.messagingAngles) score += 20;
        return score;
    };

    const healthScore = calculateHealth();

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <Activity size={16} /> },
        { id: 'personas', label: 'Personas', icon: <User size={16} /> },
        { id: 'offers', label: 'Offers', icon: <ShoppingBag size={16} /> },
        { id: 'voice', label: 'Voice', icon: <Mic size={16} /> },
        { id: 'email', label: 'Email Settings', icon: <Mail size={16} /> },
        { id: 'sequences', label: 'Blueprints', icon: <Zap size={16} /> },
        { id: 'journey', label: 'Sales Journey', icon: <Target size={16} />, disabled: true },
        { id: 'competitors', label: 'Competitors', icon: <Search size={16} />, disabled: true },
        { id: 'history', label: 'History', icon: <History size={16} />, disabled: true },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview': return <OverviewTab data={data} healthScore={healthScore} />;
            case 'personas': return <PersonasTab data={data} clientId={clientId} onUpdate={setData} />;
            case 'offers': return <OffersTab data={data} clientId={clientId} onUpdate={setData} />;
            case 'voice': return <VoiceTab data={data} clientId={clientId} onUpdate={setData} />;
            case 'email': return <EmailTab data={data} clientId={clientId} onUpdate={setData} />;
            case 'sequences': return <SequenceBuilder clientId={clientId} />;
            default: return <OverviewTab data={data} healthScore={healthScore} />;
        }
    };

    return (
        <div className="flex h-full gap-6 overflow-hidden">
            {/* Sidebar Nav Tabs */}
            <aside className="w-64 glass-card rounded-[2rem] border border-white/5 flex flex-col p-6 backdrop-blur-3xl shrink-0">
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-blue shadow-[0_0_8px_#3E80FF]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Agent Intelligence</span>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-[11px] font-black text-text-primary uppercase tracking-tight italic">Brain Health</span>
                            <span className="text-[11px] font-black text-accent-blue italic">{healthScore}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                            <div
                                className="h-full bg-gradient-to-r from-accent-blue to-accent-orange rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(62,128,255,0.4)]"
                                style={{ width: `${healthScore}%` }}
                            />
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            disabled={tab.disabled}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                ? 'bg-accent-blue/10 text-accent-blue shadow-[inset_0_0_20px_rgba(62,128,255,0.05)] border border-accent-blue/20'
                                : tab.disabled
                                    ? 'opacity-30 cursor-not-allowed text-slate-700'
                                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                            {activeTab === tab.id && <div className="ml-auto w-1 h-1 rounded-full bg-accent-blue shadow-[0_0_8px_#3E80FF]" />}
                        </button>
                    ))}
                </nav>

                <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                    <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white border border-white/5 transition-all flex items-center justify-center gap-2 group">
                        <ShieldCheck size={14} className="group-hover:text-accent-green transition-colors" /> Verify Integrity
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 glass-card rounded-[2rem] border border-white/5 flex flex-col backdrop-blur-3xl overflow-hidden relative">
                {/* Tab Header Overlay */}
                <div className="absolute top-0 right-0 p-8 z-10">
                    <div className="flex bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-1 shadow-2xl">
                        <button className="p-2 text-slate-500 hover:text-white transition-colors">
                            <Plus size={16} />
                        </button>
                        <div className="w-[1px] h-4 bg-white/5 self-center mx-1" />
                        <button className="p-2 text-slate-500 hover:text-white transition-colors">
                            <MoreVertical size={16} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-8 pt-12">
                    {renderTabContent()}
                </div>

                {/* AI Actions Floating Bar */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] flex items-center gap-6 z-20">
                    <button className="flex items-center gap-3 px-6 py-2.5 bg-accent-blue/10 hover:bg-accent-blue text-accent-blue hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-accent-blue/20 group">
                        <Zap size={14} className="fill-current group-hover:animate-pulse" /> Enrich Brain
                    </button>
                    <div className="w-[1px] h-6 bg-white/10" />
                    <button className="flex items-center gap-3 px-6 py-2.5 bg-accent-orange/10 hover:bg-accent-orange text-accent-orange hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-accent-orange/20 group">
                        <Sparkles size={14} className="group-hover:rotate-12 transition-transform" /> Generate Angles
                    </button>
                    <div className="w-[1px] h-6 bg-white/10" />
                    <button className="flex items-center gap-3 px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 group">
                        <Mic size={14} className="group-hover:scale-110 transition-transform" /> Update Voice
                    </button>
                </div>
            </div>
        </div>
    );
}
