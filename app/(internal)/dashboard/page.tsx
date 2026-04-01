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
  { stage: 'New', leads: 120, fill: '#FF4D00' },
  { stage: 'Qualified', leads: 85, fill: '#3388FF' },
  { stage: 'Proposal', leads: 42, fill: '#33FF88' },
  { stage: 'Negotiation', leads: 28, fill: '#FF3333' },
  { stage: 'Closed', leads: 64, fill: '#FF4D00' },
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
        {[{ label: 'Appointments', value: '500', icon: Users, color: 'text-accent-blue', bg: 'bg-accent-blue/10' },
          { label: 'Operations', value: '104', icon: Zap, color: 'text-accent-orange', bg: 'bg-accent-orange/10' },
          { label: 'New Patients', value: '150', icon: Brain, color: 'text-accent-green', bg: 'bg-accent-green/10' },
          { label: 'Earnings', value: '$20,500', icon: DollarSign, color: 'text-accent-blue', bg: 'bg-accent-blue/10' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-4 rounded-[20px] flex items-center gap-3 group cursor-pointer hover:border-accent-blue/20 transition-all border border-border-1 bg-surface-1">
            <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} shadow-lg shadow-black/5 group-hover:scale-105 transition-transform`}>
              <stat.icon size={20} />
            </div>
              <div className="flex-1">
                <p className="text-[9px] uppercase font-black text-text-muted tracking-[0.1em] mb-0.5">{stat.label}</p>
                <h4 className="text-xl font-black text-text-primary leading-none tracking-tight">{stat.value}</h4>
              </div>
              <button className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-surface-2">
                <MoreVertical size={12} />
              </button>
            </div>
        ))}
      </div>

      {/* Middle Row: Big Charts & Calendar */}
      <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Main Area Chart */}
        <div className="col-span-6 glass-card p-4 rounded-[24px] flex flex-col border border-border-1 bg-surface-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-black text-text-primary uppercase tracking-[0.2em] flex items-center gap-2">
              <TrendingUp size={14} className="text-accent-orange" /> Portfolio Growth
            </h3>
            <div className="flex gap-1.5">
              <button className="text-[8px] font-black px-2.5 py-0.5 bg-accent-orange rounded-full text-white uppercase italic shadow-lg shadow-accent-orange/10">Weekly</button>
              <button className="text-[8px] font-black px-2.5 py-0.5 bg-surface-2 rounded-full text-text-muted hover:bg-surface-3 uppercase transition-all border border-border-1">Monthly</button>
            </div>
          </div>
          <div className="flex-1 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PERFORMANCE_DATA}>
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
        <div className="col-span-3 glass-card p-4 rounded-[24px] flex flex-col border border-border-1 bg-surface-1">
           <h3 className="text-[10px] font-black text-text-primary uppercase tracking-[0.2em] mb-4">Performance</h3>
           <div className="flex-1 h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={LEAD_DATA}>
                <Bar dataKey="leads" radius={[4, 4, 0, 0]} barSize={12} fill="var(--accent-blue)" />
                <XAxis dataKey="stage" hide />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ display: 'none' }} />
              </BarChart>
            </ResponsiveContainer>
           </div>
           <div className="mt-4 pt-4 border-t border-border-1">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.15em] mb-0.5">Growth Index</p>
                  <h5 className="text-xl font-black text-text-primary tracking-tight">82%</h5>
                </div>
                <div className="px-1.5 py-0.5 rounded-lg bg-accent-green/10 text-accent-green text-[8px] font-black italic shadow-lg shadow-accent-green/5">+12%</div>
              </div>
           </div>
        </div>

        {/* Small Calendar */}
        <div className="col-span-3 glass-card p-4 rounded-[24px] flex flex-col border border-border-1 bg-surface-1">
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-black text-text-primary uppercase tracking-[0.2em]">Schedule</h3>
              <Plus size={14} className="text-text-muted cursor-pointer hover:text-text-primary transition-colors" />
           </div>
           <div className="grid grid-cols-7 gap-1 flex-1 content-start">
             {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
               <div key={`${d}-${i}`} className="text-[9px] font-black text-text-muted text-center mb-1.5">{d}</div>
             ))}
             {CALENDAR_DAYS.map(day => (
               <div key={day} className={`text-[9px] font-black h-7 flex items-center justify-center rounded-lg cursor-pointer transition-all ${day === 13 ? 'bg-accent-orange text-white shadow-xl shadow-accent-orange/20 scale-105' : 'hover:bg-surface-2 text-text-muted hover:text-text-primary'}`}>
                 {day}
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Bottom Row: Table & Lists */}
      <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Lead Table */}
        <div className="col-span-6 glass-card p-4 rounded-[24px] overflow-hidden flex flex-col border border-border-1 bg-surface-1">
          <div className="flex justify-between items-center mb-4 shrink-0 px-1">
            <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.2em]">Active Intelligence Feed</h3>
            <button className="text-[9px] font-black text-accent-orange uppercase hover:text-accent-orange/80 transition-colors tracking-widest">View All</button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar rounded-xl border border-border-1/50">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-surface-2/80 backdrop-blur-md border-b border-border-1 z-10">
                <tr>
                  {['Client', 'Context', 'Status', 'Actions'].map(th => (
                    <th key={th} className="py-2 text-[9px] font-black text-text-muted uppercase tracking-[0.15em] px-3">{th}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-1/30 text-[10px]">
                {[
                  { name: 'Acme Corp', context: 'Q4 Strategy', status: 'In Progress', color: 'text-accent-orange', progress: 65 },
                  { name: 'Globex', context: 'PR Campaign', status: 'Completed', color: 'text-accent-green', progress: 100 },
                  { name: 'Stark Ind', context: 'SEO Audit', status: 'In Review', color: 'text-accent-blue', progress: 82 },
                  { name: 'Wayne Ent', context: 'Leads Hook', status: 'Discovery', color: 'text-text-muted', progress: 15 },
                  { name: 'Aperture', context: 'Social Boost', status: 'Active', color: 'text-accent-blue', progress: 45 },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-surface-2/50 transition-colors cursor-pointer group text-[10px]">
                    <td className="py-2.5 px-3 font-black text-text-primary">{row.name}</td>
                    <td className="py-2.5 px-3 text-text-muted font-medium">{row.context}</td>
                    <td className={`py-2.5 px-3 font-black italic ${row.color}`}>{row.status}</td>
                    <td className="py-2.5 px-3">
                       <div className="w-16 h-1 bg-surface-3 rounded-full overflow-hidden border border-border-1">
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
        <div className="col-span-3 glass-card p-4 rounded-[24px] flex flex-col border border-border-1 bg-surface-1">
          <h3 className="text-[10px] font-black text-text-primary uppercase tracking-[0.2em] mb-4">Top Architects</h3>
          <div className="space-y-3 flex-1 overflow-y-auto pr-1 no-scrollbar">
             {[
               { name: 'Sarah Wilson', role: 'Context Master', score: '98', color: 'text-accent-green' },
               { name: 'Mike Ross', role: 'GTM Strategist', score: '94', color: 'text-accent-blue' },
               { name: 'Elena K.', role: 'SEO Engineer', score: '91', color: 'text-accent-orange' },
               { name: 'David B.', role: 'PR Architect', score: '88', color: 'text-accent-green' },
               { name: 'Sarah Wilson', role: 'Context Master', score: '98', color: 'text-accent-blue' },
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
           {PR_MENTIONS.map((m) => (
              <div key={m.id} className="glass-card p-3 rounded-[20px] flex items-center gap-3 shrink-0 border border-border-1 bg-surface-1 hover:border-accent-orange/30">
                 <div className="w-8 h-8 rounded-xl bg-surface-2 flex items-center justify-center text-accent-orange border border-border-1 group-hover:scale-105 transition-transform">
                    <Globe size={16} />
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
