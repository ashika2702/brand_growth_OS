'use client';

import React from 'react';
import { ShieldCheck, Globe, Zap, ArrowUpRight, Activity } from 'lucide-react';

export default function OverviewTab({ data, healthScore }: { data: any, healthScore: number }) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="grid grid-cols-12 gap-6">
                {/* Main Status */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    <div className="p-10 bg-gradient-to-br from-accent-blue/20 to-accent-orange/10 rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8">
                            <Zap size={48} className="text-accent-blue/20 group-hover:text-accent-blue/40 transition-colors animate-pulse" />
                        </div>

                        <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic mb-2">Neural Hub Active</h2>
                        <p className="text-slate-400 font-medium max-w-md leading-relaxed">
                            The brand intelligence core for <span className="text-white font-bold">{data.client?.name || 'this agent'}</span> is currently synchronized at {healthScore}% efficiency.
                        </p>

                        <div className="flex gap-4 mt-8">
                            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2">
                                <Globe size={14} className="text-slate-500" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">{data.client?.domain || 'no-domain.com'}</span>
                            </div>
                            <div className="px-4 py-2 bg-accent-green/10 border border-accent-green/20 rounded-xl flex items-center gap-2">
                                <ShieldCheck size={14} className="text-accent-green" />
                                <span className="text-[10px] font-black text-accent-green uppercase tracking-widest">Verified Integrity</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-10 h-10 rounded-xl bg-accent-orange/10 flex items-center justify-center text-accent-orange">
                                    <Activity size={20} />
                                </div>
                                <ArrowUpRight size={16} className="text-slate-700 group-hover:text-white transition-colors" />
                            </div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Personas</h4>
                            <p className="text-3xl font-black text-white tracking-tighter italic">{data.personas?.length || 0}</p>
                        </div>
                        <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center text-accent-blue">
                                    <Zap size={20} />
                                </div>
                                <ArrowUpRight size={16} className="text-slate-700 group-hover:text-white transition-colors" />
                            </div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Stored Offers</h4>
                            <p className="text-3xl font-black text-white tracking-tighter italic">{data.offers?.length || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Recent Activity / Notes */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 h-full flex flex-col">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Neural Sync Log</span>
                        </div>

                        <div className="flex-1 space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-[2px] rounded-full bg-white/5" />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight mb-1">Intelligence Update</p>
                                        <p className="text-[11px] text-slate-600 font-medium">No recent modifications detected in the brain core.</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full py-4 mt-8 bg-accent-orange/10 hover:bg-accent-orange text-accent-orange hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-accent-orange/20">
                            View Full Audit History
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
