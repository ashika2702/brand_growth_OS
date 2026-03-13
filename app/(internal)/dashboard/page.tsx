"use client";

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
  DollarSign
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

const LEAD_DATA = [
  { stage: 'New', leads: 120, fill: '#388BFD' },
  { stage: 'Qualified', leads: 85, fill: '#4C6EF5' },
  { stage: 'Proposal', leads: 42, fill: '#5C7CFA' },
  { stage: 'Negotiation', leads: 28, fill: '#748FFC' },
  { stage: 'Closed', leads: 64, fill: '#3FB950' },
];

const PERFORMANCE_DATA = [
  { Day: '01', reach: 4500, engagement: 2400 },
  { Day: '05', reach: 5200, engagement: 2800 },
  { Day: '10', reach: 4800, engagement: 2600 },
  { Day: '15', reach: 6100, engagement: 3100 },
  { Day: '20', reach: 5900, engagement: 2900 },
  { Day: '25', reach: 7200, engagement: 3800 },
  { Day: '30', reach: 8400, engagement: 4200 },
];

const PR_MENTIONS = [
  { id: 1, source: 'TechCrunch', title: 'MarketingOS raises $50M', time: '2h ago', status: 'Analysis' },
  { id: 2, source: 'Twitter', title: 'Game changer for agencies', time: '5h ago', status: 'Reply' },
  { id: 3, source: 'Forbes', title: 'AI-driven strategies winning', time: '1d ago', status: 'Share' },
  { id: 4, source: 'Reddit', title: 'MarketingOS vs Agencies', time: '2d ago', status: 'Review' },
];

const CALENDAR_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function DashboardPage() {
  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      {/* Top Row: Mini Stats */}
      <div className="grid grid-cols-4 gap-4 shrink-0">
        {[
          { label: 'Appointments', value: '500', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Operations', value: '104', icon: Zap, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'New Patients', value: '150', icon: Brain, color: 'text-teal-500', bg: 'bg-teal-500/10' },
          { label: 'Earnings', value: '$20,500', icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-4 rounded-xl flex items-center gap-4">
            <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color} shadow-[0_0_15px_rgba(0,0,0,0.2)]`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[9px] uppercase font-black text-slate-500 tracking-wider mb-0.5">{stat.label}</p>
              <h4 className="text-xl font-black text-white leading-tight">{stat.value}</h4>
            </div>
            <button className="ml-auto text-slate-600 hover:text-white transition-colors">
              <MoreVertical size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Middle Row: Big Charts & Calendar */}
      <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Main Area Chart */}
        <div className="col-span-6 glass-card p-4 rounded-2xl flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={14} className="text-purple-400" /> Portfolio Growth
            </h3>
            <div className="flex gap-1.5">
              <button className="text-[8px] font-black px-2 py-0.5 bg-purple-600 rounded text-white uppercase italic shadow-[0_0_10px_rgba(139,92,246,0.3)]">Weekly</button>
              <button className="text-[8px] font-black px-2 py-0.5 bg-slate-800 rounded text-slate-400 hover:bg-slate-700 uppercase transition-all">Monthly</button>
            </div>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PERFORMANCE_DATA}>
                <defs>
                  <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D/20" vertical={false} />
                <XAxis dataKey="Day" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0A0118', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '8px', fontSize: '10px' }} />
                <Area type="monotone" dataKey="reach" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorReach)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mini Bar Chart */}
        <div className="col-span-3 glass-card p-4 rounded-2xl flex flex-col">
           <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">Performance</h3>
           <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={LEAD_DATA}>
                <Bar dataKey="leads" radius={[4, 4, 0, 0]} barSize={12} fill="#14B8A6" />
                <XAxis dataKey="stage" hide />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ display: 'none' }} />
              </BarChart>
            </ResponsiveContainer>
           </div>
           <div className="mt-4 pt-4 border-t border-[#30363D]/30">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Growth Index</p>
                  <h5 className="text-lg font-black text-white">82%</h5>
                </div>
                <div className="px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 text-[8px] font-black italic shadow-[0_0_10px_rgba(20,184,166,0.1)]">+12%</div>
              </div>
           </div>
        </div>

        {/* Small Calendar */}
        <div className="col-span-3 glass-card p-4 rounded-2xl flex flex-col">
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Schedule</h3>
              <Plus size={14} className="text-slate-500 cursor-pointer hover:text-white transition-colors" />
           </div>
           <div className="grid grid-cols-7 gap-1 flex-1 content-start">
             {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
               <div key={`${d}-${i}`} className="text-[8px] font-black text-slate-600 text-center mb-1">{d}</div>
             ))}
             {CALENDAR_DAYS.map(day => (
               <div key={day} className={`text-[9px] font-bold h-6 flex items-center justify-center rounded cursor-pointer transition-all ${day === 13 ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.5)]' : 'hover:bg-white/5 text-slate-400'}`}>
                 {day}
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Bottom Row: Table & Lists */}
      <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Lead Table */}
        <div className="col-span-6 glass-card p-4 rounded-2xl overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Active Intelligence Feed</h3>
            <button className="text-[9px] font-black text-purple-500 uppercase hover:text-purple-400 transition-colors">View All</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-[#0A0118] border-b border-[#30363D]/50">
                <tr>
                  {['Client', 'Context', 'Status', 'Actions'].map(th => (
                    <th key={th} className="py-2 text-[8px] font-black text-slate-500 uppercase tracking-widest px-2">{th}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363D]/30 text-[10px]">
                {[
                  { name: 'Acme Corp', context: 'Q4 Strategy', status: 'In Progress', color: 'text-purple-400', progress: 65 },
                  { name: 'Globex', context: 'PR Campaign', status: 'Completed', color: 'text-teal-400', progress: 100 },
                  { name: 'Stark Ind', context: 'SEO Audit', status: 'In Review', color: 'text-blue-400', progress: 82 },
                  { name: 'Wayne Ent', context: 'Leads Hook', status: 'Discovery', color: 'text-slate-400', progress: 15 },
                  { name: 'Aperture', context: 'Social Boost', status: 'Active', color: 'text-blue-400', progress: 45 },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors cursor-pointer group">
                    <td className="py-2.5 px-2 font-black text-white">{row.name}</td>
                    <td className="py-2.5 px-2 text-slate-400">{row.context}</td>
                    <td className={`py-2.5 px-2 font-black italic ${row.color}`}>{row.status}</td>
                    <td className="py-2.5 px-2">
                       <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${row.color.replace('text', 'bg')}`} style={{ width: `${row.progress}%` }}></div>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Specialized Profile List */}
        <div className="col-span-3 glass-card p-4 rounded-2xl flex flex-col">
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">Top Architects</h3>
          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
             {[
               { name: 'Sarah Wilson', role: 'Context Master', score: '98', color: 'text-teal-500' },
               { name: 'Mike Ross', role: 'GTM Strategist', score: '94', color: 'text-blue-500' },
               { name: 'Elena K.', role: 'SEO Engineer', score: '91', color: 'text-purple-500' },
               { name: 'David B.', role: 'PR Architect', score: '88', color: 'text-teal-500' },
               { name: 'Sarah Wilson', role: 'Context Master', score: '98', color: 'text-blue-500' },
             ].map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-white/5 transition-all">
                   <div className="w-8 h-8 rounded-lg bg-[#1A0B2E] flex items-center justify-center font-black text-[10px] text-slate-500 uppercase border border-[#30363D]/30">{p.name[0]}</div>
                   <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-white leading-tight truncate">{p.name}</p>
                      <p className="text-[8px] text-slate-500 font-bold truncate uppercase">{p.role}</p>
                   </div>
                   <div className={`text-[9px] font-black italic ${p.color}`}>{p.score}%</div>
                </div>
             ))}
          </div>
        </div>

        {/* Vertical PR Widgets */}
        <div className="col-span-3 flex flex-col gap-3 overflow-y-auto pr-1">
           {PR_MENTIONS.map((m) => (
              <div key={m.id} className="glass-card p-3 rounded-2xl flex items-center gap-3 shrink-0">
                 <div className="w-8 h-8 rounded-xl bg-[#1A0B2E] flex items-center justify-center text-purple-400 border border-[#30363D]/30">
                    <Globe size={16} />
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-white truncate">{m.source}</p>
                    <p className="text-[9px] text-slate-500 truncate">{m.title}</p>
                 </div>
                 <button className="px-2 py-0.5 rounded-lg bg-slate-800 text-[8px] font-black text-slate-300 hover:text-white transition-all hover:bg-purple-600">
                    {m.status}
                 </button>
              </div>
           ))}
        </div>
      </div>
    </div>
  );
}
