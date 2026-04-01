'use client';

import React, { useState } from 'react';
import {
    Plus,
    Trash2,
    Clock,
    Zap,
    ChevronRight,
    Save,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

interface Step {
    delayDays: number;
    strategy: string;
    offerId?: string;
}

interface SequenceBuilderProps {
    clientId: string;
    onSave?: (sequence: any) => void;
}

export default function SequenceBuilder({ clientId, onSave }: SequenceBuilderProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [steps, setSteps] = useState<Step[]>([
        { delayDays: 0, strategy: 'Initial personalized outreach focusing on the primary pain point.' }
    ]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const addStep = () => {
        setSteps([...steps, { delayDays: 3, strategy: '' }]);
    };

    const removeStep = (index: number) => {
        setSteps(steps.filter((_, i) => i !== index));
    };

    const updateStep = (index: number, updates: Partial<Step>) => {
        const newSteps = [...steps];
        newSteps[index] = { ...newSteps[index], ...updates };
        setSteps(newSteps);
    };

    const handleSave = async () => {
        if (!name) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/crm/sequences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId,
                    name,
                    description,
                    steps
                })
            });
            if (res.ok) {
                setSaveStatus('success');
                if (onSave) onSave(await res.json());
                setTimeout(() => setSaveStatus('idle'), 3000);
            } else {
                setSaveStatus('error');
            }
        } catch (error) {
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-xl font-black text-text-primary uppercase italic tracking-tight">Neural Sequence Architect</h2>
                    <p className="text-text-muted text-[10px] font-medium uppercase tracking-widest">Design multi-day autonomous outreach patterns.</p>
                </div>

                <div className="flex items-center gap-3">
                    {saveStatus === 'success' && (
                        <div className="flex items-center gap-2 text-accent-green text-[10px] font-black uppercase tracking-widest bg-accent-green/10 px-4 py-2 rounded-xl border border-accent-green/20">
                            <CheckCircle2 size={14} /> Blueprint Saved
                        </div>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !name}
                        className="flex items-center gap-2 px-6 py-2.5 bg-accent-blue hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-[0_10px_20px_rgba(62,128,255,0.2)] transition-all"
                    >
                        {isSaving ? <Clock className="animate-spin" size={14} /> : <Save size={14} />}
                        Store Sequence
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
                {/* Meta Config */}
                <div className="col-span-1 space-y-6">
                    <div className="glass-card p-6 rounded-[2rem] border border-border-1 space-y-4 bg-surface-2/30">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-text-muted ml-1">Sequence Name</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. 7-Day Warmup"
                                className="w-full bg-surface-2 border border-border-1 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 outline-none focus:border-accent-blue/30 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-text-muted ml-1">Universal Goal</label>
                            <textarea
                                value={description || ''}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What is the final conversion point?"
                                className="w-full bg-surface-2 border border-border-1 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 outline-none h-24 focus:border-accent-blue/30 transition-all"
                            />
                        </div>
                    </div>

                    <div className="p-6 bg-accent-blue/5 border border-accent-blue/10 rounded-[2rem] space-y-3">
                        <div className="flex items-center gap-2 text-accent-blue">
                            <Zap size={14} fill="currentColor" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Neural Logic</span>
                        </div>
                        <p className="text-[10px] text-text-muted font-medium leading-relaxed italic">
                            Alex AI will automatically stop this sequence if the lead replies, books a call, or is moved to the "Qualified" stage in your pipeline.
                        </p>
                    </div>
                </div>

                {/* Steps Builder */}
                <div className="col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Execution Timeline</span>
                        <button
                            onClick={addStep}
                            className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-accent-orange hover:text-text-primary transition-colors"
                        >
                            <Plus size={14} /> Add Sequence Step
                        </button>
                    </div>

                    <div className="space-y-4 relative">
                        {/* Connecting Line */}
                        <div className="absolute left-6 top-8 bottom-8 w-[1px] bg-border-1" />

                        {steps.map((step, idx) => (
                            <div key={idx} className="relative flex gap-6 group animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                <div className="w-12 h-12 rounded-2xl bg-surface-2 border border-border-1 flex items-center justify-center text-[10px] font-black text-accent-blue shadow-xl relative z-10 group-hover:border-accent-blue/50 transition-colors">
                                    {idx + 1}
                                </div>

                                <div className="flex-1 glass-card p-6 rounded-[2rem] border border-border-1 space-y-4 group-hover:border-accent-blue/20 transition-colors bg-surface-1/50 backdrop-blur-md">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 bg-surface-2 px-3 py-1.5 rounded-lg border border-border-1">
                                                <Clock size={12} className="text-text-muted" />
                                                <input
                                                    type="number"
                                                    value={step.delayDays}
                                                    onChange={(e) => updateStep(idx, { delayDays: parseInt(e.target.value) })}
                                                    className="w-8 bg-transparent text-[10px] font-black text-text-primary outline-none"
                                                />
                                                <span className="text-[9px] font-black uppercase text-text-muted">Days Delay</span>
                                            </div>
                                            {idx === 0 && <span className="text-[9px] font-black uppercase text-accent-green tracking-widest opacity-50 italic items-center flex gap-1"><Zap size={10} fill="currentColor" /> Immediate Trigger</span>}
                                        </div>
                                        {idx > 0 && (
                                            <button
                                                onClick={() => removeStep(idx)}
                                                className="text-text-muted/50 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black uppercase tracking-widest text-text-muted/70 ml-1">AI Outreach Strategy</label>
                                        <textarea
                                            value={step.strategy}
                                            onChange={(e) => updateStep(idx, { strategy: e.target.value })}
                                            placeholder="What should the AI talk about in this step?"
                                            className="w-full bg-surface-2 border border-border-1 rounded-xl px-4 py-3 text-xs text-text-primary placeholder:text-text-muted/50 outline-none h-20 focus:border-accent-blue/30 transition-all font-medium italic"
                                        />
                                    </div>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className="absolute left-[23px] top-12 bottom-0 w-2 h-2 rounded-full bg-white/10 translate-y-[100%]" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
