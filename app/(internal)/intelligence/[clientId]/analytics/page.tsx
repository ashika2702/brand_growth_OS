"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { 
  BarChart3, 
  Users, 
  Clock, 
  Target, 
  ArrowUpRight, 
  RefreshCw, 
  MousePointer2,
  Calendar,
  ChevronDown,
  ArrowLeft,
  Search,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Filter
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// --- Types ---
interface GA4Row {
  dimensionValues: { value: string }[];
  metricValues: { value: string }[];
}

interface GA4Data {
  rows: GA4Row[];
  totals: { value: string }[];
  realtime: string;
  geo: GA4Row[];
  events: GA4Row[];
  behavior: GA4Row[];
}

// --- Utils ---
const COLORS = ['#37D67A', '#00A3FF', '#FF4D00', '#94A3B8', '#7C3AED'];

const KPICard = ({ label, value, subtext, icon: Icon, color }: any) => {
  const brandColor = color === 'green' ? '#37D67A' : color === 'blue' ? '#00A3FF' : color === 'orange' ? '#FF4D00' : '#94A3B8';
  return (
    <div className="glass-card p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group shadow-2xl transition-all hover:scale-[1.02]">
      <div className="absolute top-0 right-0 w-32 h-32 blur-[40px] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity" 
           style={{ backgroundColor: brandColor }} />
      
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 group-hover:text-white transition-colors">
          <Icon size={20} />
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{label}</p>
          <h4 className="text-2xl font-black text-white tracking-tighter mt-1">{value}</h4>
        </div>
      </div>
      <p className="text-[10px] font-bold text-slate-500 italic mt-2">{subtext}</p>
    </div>
  );
};

export default function GA4Dashboard() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<GA4Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState('30d');
  const searchParams = useSearchParams();
  const view = searchParams.get('view');

  // Handle auto-scroll to view
  useEffect(() => {
    if (view && !loading && data) {
      setTimeout(() => {
        const element = document.getElementById(view);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, [view, loading, data]);

  const fetchData = useCallback(async (start?: string, end?: string) => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/intelligence/${clientId}/analytics`;
      if (start && end) url += `?startDate=${start}&endDate=${end}`;
      
      const res = await fetch(url);
      const result = await res.json();
      
      if (res.status === 401 || result.error === 'not_connected') {
        setError('not_connected');
        return;
      }

      if (result.error) throw new Error(result.error);
      setData(result);
    } catch (err: any) {
      console.error('Failed to load GA4 data');
      setError(err.message || 'failed');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (clientId) {
      const now = new Date();
      const baseDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000); // GA4 usually has 24hr delay
      const endDate = baseDate.toISOString().split('T')[0];

      let start = new Date(baseDate.getTime());
      if (range === '1w') start.setDate(start.getDate() - 7);
      else if (range === '30d') start.setDate(start.getDate() - 30);
      else if (range === '3m') start.setMonth(start.getMonth() - 3);
      
      const startDate = start.toISOString().split('T')[0];
      fetchData(startDate, endDate);
    }
  }, [clientId, range, fetchData]);

  // --- Computed Views ---
  const chartData = useMemo(() => {
    if (!data?.rows) return [];
    return data.rows.map(row => {
      const dateStr = row.dimensionValues[0].value; // YYYYMMDD
      const formattedDate = `${dateStr.slice(4, 6)}/${dateStr.slice(6, 8)}`;
      return {
        date: formattedDate,
        users: parseInt(row.metricValues[0].value),
        sessions: parseInt(row.metricValues[1].value),
        sortKey: dateStr
      };
    }).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [data]);

  const sourceData = useMemo(() => {
    if (!data?.behavior) return [];
    return data.behavior.slice(0, 5).map(row => ({
      source: row.dimensionValues[0].value,
      page: row.dimensionValues[1].value,
      users: parseInt(row.metricValues[0].value),
      sessions: parseInt(row.metricValues[1].value)
    }));
  }, [data]);

  const geoData = useMemo(() => {
    if (!data?.geo) return [];
    return data.geo.slice(0, 5).map(row => ({
      country: row.dimensionValues[0].value,
      city: row.dimensionValues[1].value,
      users: parseInt(row.metricValues[0].value)
    }));
  }, [data]);

  const eventData = useMemo(() => {
    if (!data?.events) return [];
    return data.events.slice(0, 8).map(row => ({
      name: row.dimensionValues[0].value,
      count: parseInt(row.metricValues[0].value)
    }));
  }, [data]);

  if (loading && !data) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-accent-green/20 border-t-accent-green rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 animate-pulse">Syncing Intelligence Pipeline...</p>
      </div>
    );
  }

  if (error === 'not_connected' || error === 'not_configured') {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="max-w-md w-full glass-card p-10 rounded-[3rem] border border-white/5 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center border mx-auto mb-4 bg-accent-green/10 text-accent-green border-accent-green/20">
            <BarChart3 size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic text-balance">Analytics Required</h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              {error === 'not_configured' 
                ? "Google Analytics is connected, but a Property ID hasn't been set for this client workspace." 
                : "Google Analytics 4 is not yet connected for this client. Link your account to activate revenue intelligence."}
            </p>
          </div>
          <button 
            onClick={() => router.push(`/crm/${clientId}`)}
            className="w-full py-4 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] bg-accent-green shadow-[0_10px_20px_rgba(55,214,122,0.2)]"
          >
            Go to Integration Settings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto no-scrollbar pb-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <button onClick={() => router.back()} className="p-2 bg-white/5 rounded-xl text-slate-500 hover:text-white transition-colors">
               <ArrowLeft size={16} />
             </button>
             <h1 id="realtime" className="text-2xl font-black text-white tracking-tighter uppercase italic">Platform Analytics</h1>
             
             {/* Live Indicator */}
             <div className="flex items-center gap-2 px-3 py-1 bg-accent-green/10 border border-accent-green/20 rounded-full ml-2">
                <span className="w-1.5 h-1.5 bg-accent-green rounded-full animate-pulse" />
                <span className="text-[9px] font-black uppercase text-accent-green tracking-widest">{data?.realtime || '0'} LIVE</span>
             </div>
          </div>
          <p className="text-slate-500 text-xs font-medium ml-11">Advanced intelligence on user lifecycle and site engagement.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
            {['1w', '30d', '3m'].map(p => (
              <button 
                key={p} 
                onClick={() => setRange(p)}
                className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${range === p ? 'bg-accent-green text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {p}
              </button>
            ))}
          </div>
          <button onClick={() => fetchData()} className="p-3 bg-white/5 rounded-xl border border-white/5 text-slate-500 hover:text-white transition-all group">
            <RefreshCw size={16} className="group-active:rotate-180 transition-transform duration-500" />
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard 
          label="Total Users" 
          value={data?.totals[0]?.value || '0'} 
          subtext="Unique users in chosen period" 
          icon={Users} 
          color="green" 
        />
        <KPICard 
          label="Sessions" 
          value={data?.totals[1]?.value || '0'} 
          subtext="Total engagement sessions" 
          icon={Monitor} 
          color="blue" 
        />
        <KPICard 
          label="Conversions" 
          value={data?.totals[2]?.value || '0'} 
          subtext="Key actions completed" 
          icon={Target} 
          color="orange" 
        />
        <KPICard 
          label="Bounce Rate" 
          value={`${(parseFloat(data?.totals[3]?.value || '0') * 100).toFixed(1)}%`} 
          subtext="Single page session percentage" 
          icon={MousePointer2} 
          color="grey" 
        />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-12 gap-6">
        {/* Engagement Trend */}
        <div className="col-span-12 lg:col-span-8 glass-card p-8 rounded-[2.5rem] border border-white/5 min-h-[400px] flex flex-col relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-accent-green/5 blur-[100px] pointer-events-none" />
           
           <div className="flex justify-between items-center mb-8 relative z-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                <BarChart3 size={14} className="text-accent-green" /> User Traffic Flow
              </h3>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent-green" />
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Active Users</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent-blue" />
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Sessions</span>
                 </div>
              </div>
           </div>

           <div className="flex-1 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#37D67A" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#37D67A" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00A3FF" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#00A3FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="rgba(255,255,255,0.2)" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontWeight: 700 }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.2)" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontWeight: 700 }}
                  />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#13171F', border: '1px solid #ffffff10', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                    labelStyle={{ color: '#64748b', fontSize: '9px', fontWeight: 'black', textTransform: 'uppercase', marginBottom: '8px' }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#37D67A" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                  <Area type="monotone" dataKey="sessions" stroke="#00A3FF" strokeWidth={3} fillOpacity={1} fill="url(#colorSessions)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Traffic Sources */}
        <div className="col-span-12 lg:col-span-4 glass-card p-8 rounded-[2.5rem] border border-white/5 flex flex-col">
           <h3 id="acquisition" className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-8 flex items-center gap-2">
             <Filter size={14} className="text-accent-orange" /> Acquisition Insight
           </h3>
           
           <div className="space-y-1 relative flex-1">
             {sourceData.map((item, y) => (
                <div key={y} className="flex flex-col gap-2 p-4 rounded-2xl transition-all hover:bg-white/5 group border border-transparent hover:border-white/5">
                   <div className="flex justify-between items-center">
                     <span className="text-[11px] font-black text-white uppercase tracking-tighter truncate max-w-[140px]">{item.source}</span>
                     <span className="text-[10px] font-black text-accent-green italic">{item.users} Users</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-accent-green rounded-full opacity-60 group-hover:opacity-100 transition-opacity" 
                            style={{ width: `${(item.users / (parseInt(data?.totals[0]?.value || '1'))) * 100}%` }} />
                     </div>
                   </div>
                   <div className="flex justify-between items-center text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                      <span>{item.sessions} Sessions</span>
                      <span className="truncate max-w-[80px]">{item.page}</span>
                   </div>
                </div>
             ))}

             {sourceData.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-20">
                  <Globe size={40} className="mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No Acquisition Data</p>
                </div>
             )}
           </div>
           
           <button className="w-full py-4 mt-6 bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white rounded-2xl border border-white/10 transition-all">
             Full Behavior Report
           </button>
        </div>

        {/* Geographic Reach */}
        <div className="col-span-12 lg:col-span-5 glass-card p-8 rounded-[2.5rem] border border-white/5 flex flex-col relative overflow-hidden group">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-8 flex items-center gap-2 relative z-10">
             <Globe size={14} className="text-accent-blue" /> Geographic Reach
           </h3>
           
           <div className="space-y-4 relative z-10">
              {geoData.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                   <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                         <span className="text-[10px] font-black text-white uppercase tracking-tighter">{item.city}, {item.country}</span>
                         <span className="text-[10px] font-bold text-accent-blue">{item.users} Users</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-accent-blue rounded-full" style={{ width: `${(item.users / (parseInt(data?.totals[0]?.value || '1'))) * 100}%` }} />
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Event Explorer */}
        <div className="col-span-12 lg:col-span-7 glass-card p-8 rounded-[2.5rem] border border-white/5 flex flex-col relative overflow-hidden group">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-8 flex items-center gap-2 relative z-10">
              <MousePointer2 size={14} className="text-accent-green" /> Event Explorer
            </h3>
            
            <div className="grid grid-cols-2 gap-3 relative z-10">
               {eventData.map((item, i) => (
                 <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center group/item hover:border-accent-green/30 transition-all cursor-default">
                    <div>
                      <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest group-hover/item:text-accent-green transition-colors">Action</p>
                      <p className="text-[11px] font-black text-white italic tracking-tighter">{item.name}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-black text-white tracking-tighter">{item.count.toLocaleString()}</p>
                       <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest italic">Total events</p>
                    </div>
                 </div>
               ))}
            </div>
        </div>
      </div>
    </div>
  );
}
