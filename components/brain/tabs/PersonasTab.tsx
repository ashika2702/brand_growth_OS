'use client';

import React from 'react';
import { User, Plus, Trash2, Edit3, Sparkles } from 'lucide-react';

export default function PersonasTab({ data, clientId, onUpdate }: { data: any, clientId: string, onUpdate: (data: any) => void }) {
    const personas = Array.isArray(data.personas) ? data.personas : [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-orange shadow-[0_0_8px_#FF4D00]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Target Segment Analysis</span>
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">Personas ({personas.length})</h3>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-accent-orange/10 hover:bg-accent-orange text-accent-orange hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-accent-orange/20 transition-all shadow-lg hover:shadow-accent-orange/20">
                    <Plus size={14} /> Add Persona
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {personas.map((persona: any, idx: number) => (
                    <div key={idx} className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] hover:border-white/10 transition-all relative group flex flex-col h-full">
                        <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-colors">
                                <Edit3 size={14} />
                            </button>
                            <button className="p-2 hover:bg-white/10 rounded-lg text-slate-500 hover:text-red-500 transition-colors">
                                <Trash2 size={14} />
                            </button>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-accent-orange/10 flex items-center justify-center text-accent-orange border border-accent-orange/20">
                                <User size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-white uppercase tracking-tight leading-none mb-1">{persona.name}</h4>
                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-none">Primary Persona</p>
                            </div>
                        </div>

                        <div className="flex-1 space-y-6">
                            <div>
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-3">Strategic Profile</span>
                                <p className="text-xs text-slate-400 font-medium leading-[1.6]">
                                    {persona.description || "No strategic profile defined for this target segment."}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <span className="text-[8px] font-black text-red-500/50 uppercase tracking-[0.2em] block mb-2">Pain Points</span>
                                    <div className="flex flex-wrap gap-2">
                                        {typeof persona.painPoints === 'string'
                                            ? persona.painPoints.split(',').map((p: string, i: number) => (
                                                <span key={i} className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest rounded-full">{p.trim()}</span>
                                            ))
                                            : <span className="text-[10px] text-slate-700 italic">No pain points listed</span>
                                        }
                                    </div>
                                </div>

                                <div>
                                    <span className="text-[8px] font-black text-accent-green/50 uppercase tracking-[0.2em] block mb-2">Primary Desires</span>
                                    <div className="flex flex-wrap gap-2">
                                        {typeof persona.desires === 'string'
                                            ? persona.desires.split(',').map((d: string, i: number) => (
                                                <span key={i} className="px-3 py-1 bg-accent-green/10 border border-accent-green/20 text-accent-green text-[9px] font-black uppercase tracking-widest rounded-full">{d.trim()}</span>
                                            ))
                                            : <span className="text-[10px] text-slate-700 italic">No desires listed</span>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button className="w-full py-4 mt-8 bg-white/5 hover:bg-accent-blue/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-accent-blue border border-white/5 hover:border-accent-blue/20 transition-all flex items-center justify-center gap-2 group">
                            <Sparkles size={14} className="group-hover:rotate-12 transition-transform" /> Generate Content Hook
                        </button>
                    </div>
                ))}

                <button className="p-8 border-2 border-dashed border-white/5 bg-white/[0.02] hover:bg-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-4 group transition-all min-h-[350px]">
                    <div className="w-16 h-16 rounded-[2rem] bg-white/5 flex items-center justify-center text-slate-700 group-hover:bg-accent-orange/10 group-hover:text-accent-orange border border-white/10 group-hover:border-accent-orange/20 transition-all duration-500">
                        <Plus size={32} />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Expand Insights</h4>
                        <p className="text-white font-black uppercase italic tracking-tighter text-sm">Add New Persona</p>
                    </div>
                </button>
            </div>
        </div>
    );
}
