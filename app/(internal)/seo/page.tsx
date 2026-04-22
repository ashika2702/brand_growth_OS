"use client";

import React from 'react';
import { 
  Globe, 
  Search, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  BarChart3, 
  ShieldCheck,
  Zap,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

const SEO_PERFORMANCE = [
  { month: 'Jan', organic: 4200, keywords: 120 },
  { month: 'Feb', organic: 5100, keywords: 145 },
  { month: 'Mar', organic: 4800, keywords: 160 },
  { month: 'Apr', organic: 6200, keywords: 190 },
  { month: 'May', organic: 7500, keywords: 230 },
  { month: 'Jun', organic: 8900, keywords: 280 },
];

export default function SEOControlCenter() {
  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto no-scrollbar pb-8">
      {/* Header Area */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-accent-green/10 flex items-center justify-center text-accent-green border border-accent-green/20">
              <Globe size={24} />
            </div>
            <h1 className="text-3xl font-black text-text-primary tracking-tight uppercase italic">SEO Control Center</h1>
          </div>
          <p className="text-slate-500 font-medium">Dominate the answer engines with AI-native search infrastructure.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all flex items-center gap-2">
            <Zap size={14} className="text-accent-green" /> Run Full Audit
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Organic Traffic', value: '8.9K', trend: '+12%', color: 'text-accent-green' },
          { label: 'Avg. Position', value: '4.2', trend: '-0.5', color: 'text-accent-blue' },
          { label: 'Domain Rating', value: '68', trend: '+2', color: 'text-accent-orange' },
          { label: 'Backlinks', value: '1.4K', trend: '+150', color: 'text-accent-green' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-5 rounded-[1.5rem] border border-white/5">
            <p className="text-[9px] font-black uppercase text-slate-600 mb-1 tracking-widest">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <h4 className="text-2xl font-black text-white">{stat.value}</h4>
              <span className={`text-[10px] font-black italic ${stat.color}`}>{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-12 gap-6">
        {/* Performance Graph */}
        <div className="col-span-12 lg:col-span-8 glass-card p-8 rounded-[2rem] border border-white/5 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-text-primary flex items-center gap-2">
              <BarChart3 size={14} className="text-accent-green" /> Visibility Index
            </h3>
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-accent-green/20 border border-accent-green/50" />
              <span className="text-[9px] font-black uppercase text-slate-500">Organic Growth</span>
            </div>
          </div>
          
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SEO_PERFORMANCE}>
                <defs>
                  <linearGradient id="colorOrganic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#37D67A" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#37D67A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111111', border: '1px solid #1F1F1F', borderRadius: '12px' }}
                  itemStyle={{ color: '#37D67A', fontSize: '10px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="organic" stroke="#37D67A" strokeWidth={3} fillOpacity={1} fill="url(#colorOrganic)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Audit Checklist */}
        <div className="col-span-12 lg:col-span-4 glass-card p-8 rounded-[2rem] border border-white/5 flex flex-col">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-text-primary mb-8 flex items-center gap-2">
            <ShieldCheck size={14} className="text-accent-orange" /> Site Health Score
          </h3>
          
          <div className="flex flex-col items-center justify-center mb-10">
            <div className="relative w-32 h-32 flex items-center justify-center">
               <svg className="w-full h-full transform -rotate-90">
                 <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
                 <circle cx="64" cy="64" r="56" stroke="#FF4D00" strokeWidth="12" fill="transparent" strokeDasharray="351.8" strokeDashoffset="42.2" strokeLinecap="round" />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-3xl font-black text-white">88</span>
                 <span className="text-[8px] font-black uppercase text-slate-600">Health index</span>
               </div>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Sitemap status', status: 'Ready', ok: true },
              { label: 'Schema markup', status: 'Incomplete', ok: false },
              { label: 'Page speed', status: 'Excellent', ok: true },
              { label: 'Crawl errors', status: '0 Found', ok: true },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-accent-orange/30 transition-all">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                <span className={`text-[10px] font-black ${item.ok ? 'text-accent-green' : 'text-accent-orange'}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Keywords Table */}
        <div className="col-span-12 glass-card p-8 rounded-[2rem] border border-white/5 overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-text-primary flex items-center gap-2">
              <TrendingUp size={14} className="text-accent-blue" /> Keyword Dominance
            </h3>
            <button className="text-[9px] font-black text-slate-500 uppercase hover:text-white transition-all flex items-center gap-2">
              Export Analysis <ExternalLink size={12} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  {['Keyword', 'Volume', 'Difficulty', 'Position', 'Traffic Share'].map(th => (
                    <th key={th} className="pb-4 text-[9px] font-black text-slate-600 uppercase tracking-widest px-4">{th}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { kw: 'ai marketing engine', vol: '1.2K', diff: 'Med', pos: '#1', share: '45%' },
                  { kw: 'growth infrastructure', vol: '840', diff: 'High', pos: '#3', share: '18%' },
                  { kw: 'neural campaign os', vol: '560', diff: 'Low', pos: '#1', share: '62%' },
                  { kw: 'agency scale platform', vol: '2.1K', diff: 'High', pos: '#8', share: '4%' },
                  { kw: 'smart lead tap', vol: '1.5K', diff: 'Med', pos: '#2', share: '28%' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors group cursor-pointer">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-text-primary">{row.kw}</span>
                        <ArrowUpRight size={12} className="text-slate-700 group-hover:text-accent-green transition-colors" />
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs font-black text-slate-400">{row.vol}</td>
                    <td className="py-4 px-4">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                        row.diff === 'Low' ? 'text-accent-green border-accent-green/20' : 
                        row.diff === 'Med' ? 'text-accent-blue border-accent-blue/20' : 
                        'text-accent-orange border-accent-orange/20'
                      }`}>
                        {row.diff}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm font-black italic text-text-primary">{row.pos}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                         <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-teal-500 rounded-full" style={{ width: row.share }} />
                         </div>
                         <span className="text-[10px] font-black text-teal-400 italic">{row.share}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
