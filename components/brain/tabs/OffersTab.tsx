'use client';

import React from 'react';
import { ShoppingBag, Plus, Trash2, Edit3, ArrowUpRight, Target } from 'lucide-react';

export default function OffersTab({ data, clientId, onUpdate }: { data: any, clientId: string, onUpdate: (data: any) => void }) {
    const offers = Array.isArray(data.offers) ? data.offers : [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-blue shadow-[0_0_8px_#3E80FF]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Value Proposition Hub</span>
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">Offers ({offers.length})</h3>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-accent-blue/10 hover:bg-accent-blue text-accent-blue hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-accent-blue/20 transition-all shadow-lg hover:shadow-accent-blue/20">
                    <Plus size={14} /> Add Offer
                </button>
            </div>

            <div className="space-y-4">
                {offers.map((offer: any, idx: number) => (
                    <div key={idx} className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] hover:border-white/10 transition-all relative group flex flex-col md:flex-row gap-8 items-start md:items-center backdrop-blur-md">
                        <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-colors">
                                <Edit3 size={14} />
                            </button>
                            <button className="p-2 hover:bg-white/10 rounded-lg text-slate-500 hover:text-red-500 transition-colors">
                                <Trash2 size={14} />
                            </button>
                        </div>

                        <div className="flex items-center gap-6 shrink-0">
                            <div className="w-16 h-16 rounded-[2rem] bg-accent-blue/10 flex items-center justify-center text-accent-blue border border-accent-blue/20 shadow-2xl">
                                <ShoppingBag size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-white uppercase tracking-tight leading-none mb-1">{offer.name}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-accent-blue/10 text-accent-blue text-[8px] font-black uppercase tracking-widest rounded border border-accent-blue/20">Core Offer</span>
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-none">Price: {offer.price || "N/A"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 md:px-8 border-l border-white/5">
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-3">Core breakthrough Transformation</span>
                            <p className="text-xs text-slate-400 font-medium leading-[1.6]">
                                {offer.valueProp || offer.valueProposition || "Define the primary value delivered by this offer."}
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 rounded-xl text-slate-600">
                                    <Target size={14} />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Target Fit</p>
                                    <p className="text-[10px] font-black text-white uppercase tracking-tight">Lead Segment ✓</p>
                                </div>
                            </div>
                            <button className="flex items-center justify-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white border border-white/10 transition-all">
                                Optimize Angles <ArrowUpRight size={12} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
