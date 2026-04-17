"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  RefreshCw, 
  Users, 
  Clock, 
  Target, 
  Globe, 
  MousePointer2, 
  Filter,
  BarChart3,
  ExternalLink,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  Cell
} from 'recharts';

// --- Types ---
interface RealtimeRow {
  dimensionValues: { value: string }[];
  metricValues: { value: string }[];
}

interface RealtimeData {
  totalActive: number;
  timeline: RealtimeRow[];
  geo: RealtimeRow[];
  sources: RealtimeRow[];
  pages: RealtimeRow[];
  events: RealtimeRow[];
}

// --- Components ---

export default function RealtimeOverview() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RealtimeData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/intelligence/${clientId}/analytics/realtime`);
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch realtime data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30s polling
    return () => clearInterval(interval);
  }, [fetchData]);

  // --- Process Data ---
  const timelineData = useMemo(() => {
    if (!data?.timeline) return [];
    // GA4 returns minuteOffset (0 to 29). We want to pad missing minutes.
    const minutes = Array.from({ length: 30 }, (_, i) => ({
      minute: `-${29 - i}m`,
      users: 0,
      offset: 29 - i
    }));

    data.timeline.forEach(row => {
      const offset = parseInt(row.dimensionValues[0].value);
      const index = 29 - offset;
      if (index >= 0 && index < 30) {
        minutes[index].users = parseInt(row.metricValues[0].value);
      }
    });

    return minutes;
  }, [data]);

  const activeInLast5 = useMemo(() => {
    if (!data?.timeline) return 0;
    return data.timeline
      .filter(row => parseInt(row.dimensionValues[0].value) <= 5)
      .reduce((acc, row) => acc + parseInt(row.metricValues[0].value), 0);
  }, [data]);

  if (loading && !data) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 bg-[#0A0C10]">
        <div className="w-10 h-10 border-[3px] border-accent-blue/20 border-t-accent-blue rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Establishing Realtime Connection...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0A0C10] overflow-hidden select-none text-white">
      {/* Top Header Barra */}
      <div className="h-14 bg-white/5 backdrop-blur-xl border-b border-white/5 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all">
            <ArrowLeft size={18} />
          </button>
          <div className="h-6 w-[1px] bg-white/10 mx-1" />
          <h1 className="text-sm font-black text-white tracking-tight uppercase">Realtime Overview</h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-accent-green/10 border border-accent-green/20 rounded-full ml-2">
             <span className="w-1.5 h-1.5 bg-accent-green rounded-full animate-pulse" />
             <span className="text-[8px] font-black text-accent-green uppercase tracking-tighter">Live</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Last Updated</p>
            <p className="text-[10px] font-bold text-white">{lastUpdated.toLocaleTimeString()}</p>
          </div>
          <button 
            onClick={() => fetchData()} 
            disabled={refreshing}
            className={`p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-slate-400 transition-all ${refreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-blue/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-purple/5 blur-[120px] pointer-events-none" />

        {/* Timeline Hero */}
        <div className="grid grid-cols-12 gap-6 relative z-10">
            {/* Realtime KPI & Chart */}
            <div className="col-span-12 glass-card p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row gap-12">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-blue/50 to-transparent" />
                
                {/* Left Side: Big Numbers */}
                <div className="lg:w-1/3 flex flex-col justify-center">
                    <div className="mb-8">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4 border-b border-dashed border-white/10 inline-block">Active users in last 30 minutes</p>
                        <h2 className="text-8xl font-black text-white tracking-tighter drop-shadow-[0_0_25px_rgba(255,255,255,0.1)]">{data?.totalActive || 0}</h2>
                    </div>
                    
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4 border-b border-dashed border-white/10 inline-block">Active users in last 5 minutes</p>
                        <h2 className="text-5xl font-black text-white tracking-tighter">{activeInLast5}</h2>
                        <div className="flex items-center gap-2 mt-6 p-3 bg-white/5 rounded-2xl border border-white/5 inline-flex">
                            <Users size={14} className="text-accent-blue" />
                            <span className="text-[10px] font-bold text-slate-400 italic">Real-time engagement pulse</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Timeline Chart */}
                <div className="lg:w-2/3 flex flex-col h-[300px]">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                            <Clock size={12} className="text-accent-blue" /> Active Users Per Minute
                        </h3>
                        <div className="flex gap-4">
                           <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">-30 min</span>
                           <span className="text-[9px] font-black text-accent-blue uppercase tracking-tighter">Live now</span>
                        </div>
                    </div>
                    <div className="h-[220px] w-full" key={loading ? 'loading' : 'ready'}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={timelineData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis dataKey="minute" hide />
                                <YAxis hide domain={[0, 'auto']} />
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#13171F', border: '1px solid #ffffff10', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ fontSize: '10px', fontWeight: 'bold', color: '#fff' }}
                                    labelStyle={{ color: '#64748b', fontSize: '9px', fontWeight: 'black', textTransform: 'uppercase', marginBottom: '8px' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                />
                                <Bar dataKey="users" radius={[4, 4, 0, 0]}>
                                    {timelineData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 29 ? '#3E80FF' : 'rgba(255,255,255,0.1)'} className="transition-all duration-500" />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Sub Widgets Grid */}
            <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                
                {/* Device Breakdown Card */}
                <RealtimeCard title="Active users by Device" footerLink="/analytics">
                    <div className="space-y-2">
                        {data?.sources.slice(0, 5).map((row, i) => (
                            <BreakdownItem 
                                key={i}
                                label={row.dimensionValues[0].value || 'Desktop'}
                                value={row.metricValues[0].value}
                                percentage={Math.round((parseInt(row.metricValues[0].value) / (data.totalActive || 1)) * 100)}
                                color="bg-accent-blue"
                            />
                        ))}
                        {!data?.sources.length && (
                            <div className="py-12 text-center opacity-20 italic text-[10px] font-bold uppercase tracking-widest">Awaiting Pulse...</div>
                        )}
                    </div>
                </RealtimeCard>

                {/* Geography Map Summary */}
                <RealtimeCard title="Active users by Geography" footerLink="/analytics">
                    <div className="flex-1 flex flex-col justify-center items-center relative py-6">
                        <Globe className="text-white/5 w-32 h-32 absolute animate-pulse" />
                        <div className="relative z-10 w-full space-y-4">
                            {data?.geo.slice(0, 4).map((row, i) => (
                                <div key={i} className="flex items-center gap-4 transition-all hover:translate-x-1">
                                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-accent-blue shrink-0 shadow-lg">
                                        <MapPin size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[11px] font-black text-white uppercase tracking-tight">{row.dimensionValues[1].value}</p>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{row.dimensionValues[0].value}</p>
                                    </div>
                                    <span className="text-sm font-black text-white italic drop-shadow-md">{row.metricValues[0].value}</span>
                                </div>
                            ))}
                            {!data?.geo.length && (
                                <div className="py-12 text-center opacity-20 italic text-[10px] font-bold uppercase tracking-widest flex flex-col items-center gap-4">
                                     <Globe size={32} className="opacity-20 translate-y-2" />
                                     Awaiting Signal...
                                </div>
                            )}
                        </div>
                    </div>
                </RealtimeCard>

                {/* Content Card */}
                <RealtimeCard title="Views by Page title" footerLink="/analytics">
                    <div className="space-y-5">
                        {data?.pages.slice(0, 5).map((row, i) => (
                            <div key={i} className="flex justify-between items-start group cursor-default">
                                <div className="max-w-[80%]">
                                    <p className="text-[10px] font-black text-white line-clamp-1 group-hover:text-accent-blue transition-colors uppercase tracking-[0.1em]">{row.dimensionValues[0].value}</p>
                                    <p className="text-[8px] font-bold text-slate-500 truncate opacity-60 uppercase tracking-widest mt-1">Live Interaction</p>
                                </div>
                                <span className="text-[10px] font-black bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-white italic shrink-0">{row.metricValues[0].value}</span>
                            </div>
                        ))}
                        {!data?.pages.length && (
                            <div className="py-12 text-center opacity-20 italic text-[10px] font-bold uppercase tracking-widest">Awaiting Pulse...</div>
                        )}
                    </div>
                </RealtimeCard>

                {/* Events Card */}
                <RealtimeCard title="Event count by Event name" footerLink="/analytics">
                    <div className="space-y-2">
                        {data?.events.slice(0, 5).map((row, i) => (
                            <BreakdownItem 
                                key={i}
                                label={row.dimensionValues[0].value}
                                value={row.metricValues[0].value}
                                percentage={Math.round((parseInt(row.metricValues[0].value) / (data.events.reduce((acc, r) => acc + parseInt(r.metricValues[0].value), 0) || 1)) * 100)}
                                color="bg-accent-orange"
                            />
                        ))}
                        {!data?.events.length && (
                            <div className="py-12 text-center opacity-20 italic text-[10px] font-bold uppercase tracking-widest">Awaiting Pulse...</div>
                        )}
                    </div>
                </RealtimeCard>

                {/* Key Events Card */}
                <RealtimeCard title="Key events by Event name" footerLink="/analytics">
                    <div className="flex-1 flex flex-col justify-center items-center text-center p-8 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                        <Target className="text-slate-600 mb-4" size={40} />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Silence in Core Matrix</p>
                        <p className="text-[9px] text-slate-600 mt-2 italic max-w-[150px]">Defining conversion events in GA4 activates this neural link.</p>
                    </div>
                </RealtimeCard>

                {/* Intelligence Insights Card */}
                <RealtimeCard title="Intelligence Pulse">
                    <div className="flex-1 flex flex-col justify-between">
                         <div className="space-y-6 mt-2">
                            <div className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 transition-all hover:bg-white/5 group">
                                <div className="w-2.5 h-2.5 rounded-full bg-accent-blue mt-1.5 animate-ping opacity-75" />
                                <div>
                                    <p className="text-[10px] font-black text-white uppercase tracking-[0.15em] group-hover:text-accent-blue transition-colors">Neural Spike Detected</p>
                                    <p className="text-[9px] text-slate-500 font-bold mt-1 line-clamp-2">Direct infiltration detected. Anomalous user behavior cluster identified on homepage.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-4 rounded-2xl bg-white/[0.01] border border-white/5 opacity-50 grayscale">
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-700 mt-1.5" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Signal Stabilization</p>
                                    <p className="text-[9px] text-slate-600 font-bold mt-1">Acquisition channels are currently operating within standard predicted variance.</p>
                                </div>
                            </div>
                         </div>
                         <div className="mt-8 p-4 rounded-2xl bg-accent-blue/10 border border-accent-blue/30 text-white flex items-center justify-between shadow-[0_0_30px_rgba(62,128,255,0.1)]">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-accent-blue/20 rounded-xl">
                                    <BarChart3 size={16} className="text-accent-blue" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-blue">Neural Forecast</span>
                             </div>
                             <span className="text-[10px] font-black italic text-accent-green px-3 py-1 bg-accent-green/10 rounded-full border border-accent-green/20">STABLE</span>
                         </div>
                    </div>
                </RealtimeCard>

            </div>
        </div>
      </div>
    </div>
  );
}

const RealtimeCard = ({ title, children, footerLink }: any) => (
  <div className="glass-card shadow-2xl p-8 rounded-[2.5rem] border border-white/5 flex flex-col h-full group transition-all hover:border-white/10">
    <div className="flex justify-between items-center mb-10 shrink-0">
      <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.25em] flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-accent-blue/30 group-hover:bg-accent-blue transition-colors" /> {title}
      </h3>
      {footerLink && <ChevronRight size={14} className="text-slate-700 group-hover:text-accent-blue transition-all group-hover:translate-x-1" />}
    </div>
    <div className="flex-1 flex flex-col min-h-0">
      {children}
    </div>
    {footerLink && (
        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
             <span className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-600">Deep Link Active</span>
             <ExternalLink size={12} className="text-slate-800" />
        </div>
    )}
  </div>
);

const BreakdownItem = ({ label, value, percentage, color = "bg-accent-blue" }: any) => (
  <div className="py-3 group/item">
    <div className="flex justify-between items-center mb-2.5">
      <span className="text-[11px] font-black text-slate-300 truncate pr-4 group-hover/item:text-white transition-colors uppercase tracking-tight">{label}</span>
      <div className="text-right shrink-0">
        <span className="text-[12px] font-black text-white italic">{value}</span>
        {percentage && <span className="text-[9px] text-slate-500 ml-2 font-bold tracking-tighter">{percentage}%</span>}
      </div>
    </div>
    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/[0.02]">
      <div 
        className={`h-full ${color} rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(62,128,255,0.4)] opacity-70 group-hover/item:opacity-100`} 
        style={{ width: `${percentage || 100}%` }} 
      />
    </div>
  </div>
);
