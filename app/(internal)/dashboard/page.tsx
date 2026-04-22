"use client";

import React, { useEffect, useState } from 'react';
import { 
  Zap, 
  Brain, 
  Target, 
  ChevronRight, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Globe,
  Newspaper,
  Twitter,
  Calendar,
  MoreVertical,
  Plus,
  ShieldCheck,
  DollarSign,
  BarChart3,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart,
  Area
} from 'recharts';

interface DashboardData {
  stats: {
    leads: number;
    wonValue: number;
    top10Keywords: number;
    activeUsers: number;
    conversions: number;
    sessions: number;
  };
  leadsByStage: Record<string, number>;
  performanceTrend: any[];
  feed: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/dashboard/overview');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const CALENDAR_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-accent-orange animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted animate-pulse">Synchronizing Intelligence...</p>
        </div>
      </div>
    );
  }

  const chartData = data?.performanceTrend || [];
  const barData = data ? [
    { stage: 'New', leads: data.leadsByStage.new, fill: '#FF4D00' },
    { stage: 'Qualified', leads: data.leadsByStage.qualified, fill: '#3388FF' },
    { stage: 'Proposal', leads: data.leadsByStage.proposal, fill: '#33FF88' },
    { stage: 'Won', leads: data.leadsByStage.won, fill: '#FF4D00' },
  ] : [];

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden animate-in fade-in duration-500">
      {/* Top Row: Mini Stats */}
      <div className="grid grid-cols-4 gap-6 shrink-0">
        {[
          { label: 'Total Leads', value: data?.stats.leads.toLocaleString(), icon: Target, color: 'text-accent-orange', bg: 'bg-accent-orange/10' },
          { label: 'Active Users', value: data?.stats.activeUsers.toLocaleString(), icon: Users, color: 'text-accent-blue', bg: 'bg-accent-blue/10' },
          { label: 'Ranked Keywords', value: data?.stats.top10Keywords.toLocaleString(), icon: Globe, color: 'text-accent-green', bg: 'bg-accent-green/10' },
          { label: 'Earnings', value: `$${data?.stats.wonValue.toLocaleString()}`, icon: DollarSign, color: 'text-accent-blue', bg: 'bg-accent-blue/10' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-4 rounded-[1.25rem] flex items-center gap-3 group cursor-pointer hover:border-accent-blue/20 transition-all border border-border-1">
            <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} shadow-lg shadow-black/5 group-hover:scale-105 transition-transform`}>
              <stat.icon size={20} />
            </div>
            <div className="flex-1">
              <p className="text-[9px] uppercase font-black text-text-muted tracking-[0.1em] mb-0.5">{stat.label}</p>
              <h4 className="text-xl font-black text-text-primary leading-none tracking-normal">{stat.value}</h4>
            </div>
            <button className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-surface-2">
              <MoreVertical size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Middle Row: Big Charts & Calendar */}
      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Main Area Chart */}
        <div className="col-span-6 glass-card p-4 rounded-[1.5rem] flex flex-col border border-border-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={14} className="text-accent-orange" /> Portfolio Traffic
            </h3>
            <div className="flex gap-1.5">
              <span className="text-[8px] font-black px-2.5 py-0.5 bg-accent-orange rounded-full text-white uppercase italic shadow-lg shadow-accent-orange/10">30 Days</span>
            </div>
          </div>
          <div className="flex-1 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-orange)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--accent-orange)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-1)" vertical={false} />
                <XAxis dataKey="Day" stroke="var(--text-muted)" fontSize={9} tickLine={false} axisLine={false} tick={{ fontWeight: 'bold' }} />
                <YAxis stroke="var(--text-muted)" fontSize={9} tickLine={false} axisLine={false} tick={{ fontWeight: 'bold' }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface-1)', border: 'none', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }} />
                <Area type="monotone" dataKey="reach" stroke="var(--accent-orange)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReach)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mini Bar Chart */}
        <div className="col-span-3 glass-card p-4 rounded-[1.5rem] flex flex-col border border-border-1">
           <h3 className="text-[10px] font-black text-text-primary uppercase tracking-widest mb-4">CRM Pipeline</h3>
           <div className="flex-1 h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <Bar dataKey="leads" radius={[4, 4, 0, 0]} barSize={12} fill="var(--accent-blue)" />
                <XAxis dataKey="stage" hide />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ display: 'none' }} />
              </BarChart>
            </ResponsiveContainer>
           </div>
           <div className="mt-4 pt-4 border-t border-border-1">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.1em] mb-0.5">Conversions</p>
                  <h5 className="text-xl font-black text-text-primary tracking-normal">{data?.stats.conversions.toLocaleString()}</h5>
                </div>
                <div className="px-1.5 py-0.5 rounded-lg bg-accent-green/10 text-accent-green text-[8px] font-black italic shadow-lg shadow-accent-green/5">Live Aggregation</div>
              </div>
           </div>
        </div>

        {/* Small Calendar */}
        <div className="col-span-3 glass-card p-4 rounded-[1.5rem] flex flex-col border border-border-1">
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-black text-text-primary uppercase tracking-widest">Schedule</h3>
              <Plus size={14} className="text-text-muted cursor-pointer hover:text-text-primary transition-colors" />
           </div>
           <div className="grid grid-cols-7 gap-1 flex-1 content-start">
             {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
               <div key={`${d}-${i}`} className="text-[9px] font-black text-text-muted text-center mb-1.5">{d}</div>
             ))}
             {CALENDAR_DAYS.map(day => (
               <div key={day} className={`text-[9px] font-black h-7 flex items-center justify-center rounded-lg cursor-pointer transition-all ${day === new Date().getDate() ? 'bg-accent-orange text-white shadow-xl shadow-accent-orange/20 scale-105' : 'hover:bg-surface-2 text-text-muted hover:text-text-primary'}`}>
                 {day}
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Bottom Row: Table & Lists */}
      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Lead Table */}
        <div className="col-span-6 glass-card p-4 rounded-[1.5rem] overflow-hidden flex flex-col border border-border-1">
          <div className="flex justify-between items-center mb-4 shrink-0 px-1">
            <h3 className="text-xs font-black text-text-primary uppercase tracking-widest">Active Intelligence Feed</h3>
            <button className="text-[9px] font-black text-accent-orange uppercase hover:text-accent-orange/80 transition-colors tracking-widest">Live Updates</button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar rounded-xl border border-border-1/50">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-surface-2/80 backdrop-blur-md border-b border-border-1 z-10">
                <tr>
                  {['Client', 'Context', 'Status', 'Timestamp'].map(th => (
                    <th key={th} className="py-2 text-[9px] font-black text-text-muted uppercase tracking-[0.15em] px-3">{th}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-1/30 text-[10px]">
                {data?.feed.map((row, i) => (
                  <tr key={i} className="hover:bg-surface-2/50 transition-colors cursor-pointer group text-[10px]">
                    <td className="py-2.5 px-3 font-black text-text-primary">{row.client}</td>
                    <td className="py-2.5 px-3 text-text-muted font-medium">{row.context}</td>
                    <td className={`py-2.5 px-3 font-black italic uppercase text-[8px] ${
                      row.status === 'won' || row.status === 'completed' ? 'text-accent-green' : 
                      row.status === 'lost' ? 'text-text-muted' : 
                      'text-accent-orange'
                    }`}>{row.status}</td>
                    <td className="py-2.5 px-3 text-text-muted text-[8px] uppercase font-bold">
                       {new Date(row.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {(!data?.feed || data.feed.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-text-muted font-bold uppercase tracking-widest opacity-50">No recent activities detected</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Specialized Profile List */}
        <div className="col-span-3 glass-card p-4 rounded-[1.5rem] flex flex-col border border-border-1">
          <h3 className="text-[10px] font-black text-text-primary uppercase tracking-widest mb-4">Account Overview</h3>
          <div className="space-y-3 flex-1 overflow-y-auto pr-1 no-scrollbar">
             {[
               { name: 'Lead Velocity', role: 'Daily Growth', score: '98', color: 'text-accent-green' },
               { name: 'SEO Visibility', role: 'Keyword Density', score: '94', color: 'text-accent-blue' },
               { name: 'Campaign ROI', role: 'Ads Efficiency', score: '91', color: 'text-accent-orange' },
               { name: 'Brain Recall', role: 'Context usage', score: '88', color: 'text-accent-green' },
             ].map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-surface-2 transition-all group cursor-pointer border border-transparent hover:border-border-1">
                   <div className="w-8 h-8 rounded-xl bg-surface-2 flex items-center justify-center font-black text-[10px] text-text-muted uppercase border border-border-1 group-hover:scale-105 transition-transform">{p.name[0]}</div>
                   <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-text-primary leading-tight truncate">{p.name}</p>
                      <p className="text-[8px] text-text-muted font-bold truncate uppercase tracking-widest">{p.role}</p>
                   </div>
                   <div className={`text-[9px] font-black italic ${p.color}`}>{p.score}%</div>
                </div>
             ))}
          </div>
        </div>

        {/* Vertical PR Widgets */}
        <div className="col-span-3 flex flex-col gap-3 overflow-y-auto pr-1 no-scrollbar">
            {[
              { source: 'Insights', title: 'Top 10 Keywords reached', status: 'SEO' },
              { source: 'Intelligence', title: 'Conversion rate up 12%', status: 'GA4' },
              { source: 'Sequences', title: '34 Automations triggered', status: 'CRM' },
            ].map((m, i) => (
              <div key={i} className="glass-card p-3 rounded-[1.25rem] flex items-center gap-3 shrink-0 border border-border-1 hover:border-accent-orange/30 group">
                 <div className="w-8 h-8 rounded-xl bg-surface-2 flex items-center justify-center text-accent-orange border border-border-1 group-hover:scale-105 transition-transform">
                    <Zap size={16} />
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-text-primary truncate">{m.source}</p>
                    <p className="text-[9px] text-text-muted truncate font-medium">{m.title}</p>
                 </div>
                 <button className="px-2 py-0.5 rounded-lg bg-surface-3 text-[8px] font-black text-text-muted hover:text-white transition-all hover:bg-accent-orange border border-border-1 hover:border-accent-orange">
                    {m.status}
                 </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
