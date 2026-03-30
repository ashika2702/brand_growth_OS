'use client';

import React from 'react';
import { Mic, Sparkles, MessageSquare, ShieldCheck, Zap } from 'lucide-react';
import VoiceGuideEditor from '../VoiceGuideEditor';

export default function VoiceTab({ data, clientId, onUpdate }: { data: any, clientId: string, onUpdate: (data: any) => void }) {
    const voiceGuide = data.voiceGuide || {
        tone: 'Professional',
        adjectives: [],
        vocab_do: [],
        vocab_dont: [],
        samples: []
    };

    const handleVoiceChange = async (newVoiceGuide: any) => {
        // Optimistic update
        onUpdate({ ...data, voiceGuide: newVoiceGuide });

        try {
            await fetch('/api/brain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId,
                    voiceGuide: newVoiceGuide
                }),
            });
        } catch (err) {
            console.error('Failed to update voice guide:', err);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="grid grid-cols-12 gap-8">
                {/* Left Column: Editor */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent-yellow shadow-[0_0_8px_#FFD700]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">A6 Neural Alignment</span>
                        </div>
                        <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">Brand Voice Guide</h3>
                    </div>

                    <VoiceGuideEditor
                        value={voiceGuide}
                        onChange={handleVoiceChange}
                    />
                </div>

                {/* Right Column: Score & Tips */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="p-10 bg-white/5 border border-white/5 rounded-[2.5rem] flex flex-col items-center text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-accent-blue/5 opacity-0 group-hover:opacity-100 transition-opacity blur-3xl pointer-events-none" />

                        <div className="relative mb-8">
                            <div className="w-32 h-32 rounded-full border-4 border-white/5 flex items-center justify-center relative">
                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle
                                        cx="64" cy="64" r="60"
                                        fill="none" stroke="currentColor"
                                        strokeWidth="8"
                                        className="text-white/5"
                                    />
                                    <circle
                                        cx="64" cy="64" r="60"
                                        fill="none" stroke="currentColor"
                                        strokeWidth="8"
                                        strokeDasharray="377"
                                        strokeDashoffset={377 - (377 * 0.85)}
                                        className="text-accent-blue transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(62,128,255,0.5)]"
                                    />
                                </svg>
                                <div className="flex flex-col items-center">
                                    <span className="text-3xl font-black text-white italic tracking-tighter leading-none">85</span>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Score</span>
                                </div>
                            </div>
                        </div>

                        <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-2">Voice Consistency</h4>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-8">
                            Your A6 neural profile is highly consistent. The LLM cluster has a clear understanding of your brand's verbal identity.
                        </p>

                        <button className="w-full py-4 bg-white/5 hover:bg-accent-blue/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-accent-blue border border-white/10 hover:border-accent-blue/20 transition-all flex items-center justify-center gap-2 group">
                            <Sparkles size={14} className="group-hover:animate-pulse" /> Run Voice Audit
                        </button>
                    </div>

                    <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] opacity-50 cursor-not-allowed">
                        <div className="flex items-center gap-2 mb-6">
                            <Mic size={14} className="text-slate-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sample Tester</span>
                        </div>
                        <p className="text-[11px] text-slate-700 italic">Paste text here to verify it against your brand voice rules (Coming Soon).</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
