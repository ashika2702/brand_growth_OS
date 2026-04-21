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
  ChevronRight,
  Smartphone,
  Zap,
  Activity
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
  events: RealtimeRow[];
  keyEvents: RealtimeRow[];
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
    const interval = setInterval(fetchData, 60000); // 60s polling
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
      <div className="h-full flex flex-col items-center justify-center gap-4 bg-background">
        <div className="w-10 h-10 border-[3px] border-accent-blue/20 border-t-accent-blue rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-text-muted italic">Establishing Realtime Connection...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden select-none text-text-primary">
      {/* Top Header Barra */}
      <div className="h-14 bg-surface-1 border-b border-border-1 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-surface-2 rounded-lg text-text-muted hover:text-text-primary transition-all">
            <ArrowLeft size={18} />
          </button>
          <div className="h-6 w-[1px] bg-border-1 mx-1" />
          <h1 className="text-sm font-bold text-text-primary tracking-tight">Realtime Overview</h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-accent-green/10 border border-accent-green/20 rounded-full ml-2">
            <span className="w-1.5 h-1.5 bg-accent-green rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-accent-green uppercase tracking-tight">Live</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Last Updated</p>
            <p className="text-[11px] font-bold text-text-primary">{lastUpdated.toLocaleTimeString()}</p>
          </div>
          <button
            onClick={() => fetchData()}
            disabled={refreshing}
            className={`p-2.5 bg-surface-2 hover:bg-surface-3 rounded-xl border border-border-1 text-text-dim transition-all ${refreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar relative">
        {/* Background Glow Removed for Light Mode Harmonization */}

        {/* Timeline Hero */}
        <div className="grid grid-cols-12 gap-4 relative z-10">
          {/* Realtime KPI & Chart (Top Left) */}
          <div className="col-span-12 lg:col-span-8 glass-card p-6 rounded-[2rem] relative overflow-hidden flex flex-col lg:flex-row gap-8">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-blue/50 to-transparent" />

            {/* Left Side: Big Numbers */}
            <div className="lg:w-1/3 flex flex-col justify-center">
              <div className="mb-8">
                <p className="text-xs font-bold text-text-muted tracking-tight mb-3 border-b border-dashed border-border-1 inline-block pb-1">Active users (last 30 min)</p>
                <h2 className="text-4xl font-black text-text-primary tracking-tighter drop-shadow-[0_0_25px_rgba(255,255,255,0.1)]">{data?.totalActive || 0}</h2>
              </div>

              <div>
                <p className="text-xs font-bold text-text-muted tracking-tight mb-3 border-b border-dashed border-border-1 inline-block pb-1">Active users (last 5 min)</p>
                <h2 className="text-4xl font-black text-text-primary tracking-tighter">{activeInLast5}</h2>
              </div>
            </div>

            {/* Right Side: Timeline Chart */}
            <div className="lg:w-2/3 flex flex-col h-[300px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold text-text-secondary tracking-tight flex items-center gap-2">
                  <Clock size={12} className="text-accent-blue" /> User Activity Timeline
                </h3>
                <div className="flex gap-4">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-tight">-30 min</span>
                  <span className="text-[10px] font-bold text-accent-blue uppercase tracking-tight">Live</span>
                </div>
              </div>
              <div className="flex-1 w-full min-h-[200px]" key={loading ? 'loading' : 'ready'}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[...timelineData].reverse()} margin={{ bottom: 30, top: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-1)" vertical={false} />
                    <XAxis
                      dataKey="offset"
                      axisLine={{ stroke: 'var(--border-2)' }}
                      tickLine={{ stroke: 'var(--border-2)' }}
                      tickSize={8}
                      tick={{ fontSize: 11, fill: 'var(--text-secondary)', fontWeight: 900, dy: 10 }}
                      ticks={[0, 4, 9, 14, 19, 24, 29]}
                      height={60}
                      tickFormatter={(val) => {
                        const offsetNum = parseInt(val);
                        return `-${offsetNum + 1}m`;
                      }}
                    />

                    <RechartsTooltip
                      contentStyle={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-1)', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                      itemStyle={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-primary)' }}
                      labelStyle={{ color: 'var(--text-muted)', fontSize: '9px', fontWeight: 'black', textTransform: 'uppercase', marginBottom: '8px' }}
                      cursor={{ fill: 'var(--border-1)' }}
                    />
                    <Bar dataKey="users" radius={[2, 2, 0, 0]} barSize={10} fill="var(--border-2)">
                      {[...timelineData].reverse().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--accent-blue)' : 'var(--border-2)'} className="transition-all duration-500" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Geography (Top Right) */}
          <div className="col-span-12 lg:col-span-4">
            <RealtimeCard title="Active users by Geography" icon={<Globe size={14} className="text-accent-blue" />} footerLink="/analytics">
              <div className="flex-1 flex flex-col justify-center items-center relative py-6">
                <Globe className="text-white/5 w-24 h-24 absolute animate-pulse opacity-10" />
                <div className="relative z-10 w-full space-y-2">
                  {data?.geo.slice(0, 8).map((row, i) => (
                    <div key={i} className="flex items-center gap-4 transition-all hover:translate-x-1">
                      <div className="w-10 h-10 rounded-2xl bg-surface-2 border border-border-1 flex items-center justify-center text-accent-blue shrink-0 shadow-lg">
                        <MapPin size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-text-primary tracking-tight">{row.dimensionValues[1].value}</p>
                        <p className="text-[10px] font-medium text-text-muted">{row.dimensionValues[0].value}</p>
                      </div>
                      <span className="text-base font-bold text-text-primary drop-shadow-sm">{row.metricValues[0].value}</span>
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
          </div>

          {/* Bottom Row Widgets */}
          <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">

            {/* Device Breakdown Card */}
            <RealtimeCard title="Active users by Device" icon={<Smartphone size={14} className="text-accent-blue" />} footerLink="/analytics">
              <div className="space-y-1">
                {data?.sources.slice(0, 10).map((row, i) => (
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

            {/* Events Card */}
            <RealtimeCard title="Event count by Event name" icon={<Zap size={14} className="text-accent-orange" />} footerLink="/analytics">
              <div className="space-y-1">
                {data?.events.slice(0, 10).map((row, i) => (
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
            <RealtimeCard title="Key events by Event name" icon={<Target size={14} className="text-accent-green" />} footerLink="/analytics">
              <div className="space-y-1">
                {data?.keyEvents && data.keyEvents.length > 0 ? (
                  data.keyEvents.slice(0, 10).map((row, i) => (
                    <BreakdownItem
                      key={i}
                      label={row.dimensionValues[0].value}
                      value={row.metricValues[0].value}
                      percentage={Math.round((parseInt(row.metricValues[0].value) / (data.keyEvents.reduce((acc, r) => acc + parseInt(r.metricValues[0].value), 0) || 1)) * 100)}
                      color="bg-accent-green"
                    />
                  ))
                ) : (
                  <div className="flex-1 flex flex-col justify-center items-center text-center p-8 bg-surface-2 rounded-[2rem] border border-dashed border-border-2 my-2">
                    <Target className="text-text-dim mb-4" size={40} />
                    <p className="text-xs font-bold tracking-tight text-text-muted">Awaiting Conversion Signals</p>
                    <p className="text-[10px] text-text-dim mt-2 italic max-w-[170px]">Conversion events will appear here as they trigger in GA4.</p>
                  </div>
                )}
              </div>
            </RealtimeCard>

          </div>
        </div>
      </div>
    </div>
  );
}

const RealtimeCard = ({ title, children, footerLink, icon }: any) => (
  <div className="glass-card p-6 rounded-[1.5rem] flex flex-col h-full group transition-all hover:-translate-y-1 backdrop-blur-2xl relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-border-2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="flex justify-between items-center mb-6 shrink-0">
      <h3 className="text-xs font-bold text-text-secondary tracking-tight flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-surface-2 border border-border-1 flex items-center justify-center transition-colors group-hover:bg-accent-blue/10 group-hover:border-accent-blue/20">
          {icon || <Activity size={14} className="text-accent-blue" />}
        </div>
        {title}
      </h3>
      {footerLink && <ChevronRight size={14} className="text-text-dim group-hover:text-accent-blue transition-all group-hover:translate-x-1" />}
    </div>
    <div className="flex-1 flex flex-col min-h-0">
      {children}
    </div>
  </div>
);

const BreakdownItem = ({ label, value, percentage, color = "bg-accent-blue" }: any) => (
  <div className="py-3 group/item">
    <div className="flex justify-between items-center mb-2">
      <span className="text-xs font-semibold text-text-secondary truncate pr-4 group-hover/item:text-text-primary transition-colors tracking-tight">{label}</span>
      <div className="text-right shrink-0">
        <span className="text-sm font-bold text-text-primary">{value}</span>
        {percentage && <span className="text-[10px] text-text-muted ml-2 font-bold tracking-tight">{percentage}%</span>}
      </div>
    </div>
    <div className="w-full h-1.5 bg-surface-2 rounded-full overflow-hidden border border-border-1">
      <div
        className={`h-full ${color} rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(62,128,255,0.4)] opacity-70 group-hover/item:opacity-100`}
        style={{ width: `${percentage || 100}%` }}
      />
    </div>
  </div>
);
