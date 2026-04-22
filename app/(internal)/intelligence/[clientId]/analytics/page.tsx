"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
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
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Search,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Filter,
  Check
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
  acquisition: GA4Row[];
  acquisitionTable: GA4Row[];
  acquisitionTableTotals: GA4Row | null;
  acquisitionBreakdown: GA4Row[];
  sessionAcquisition: GA4Row[];
  sessionTable: GA4Row[];
  sessionTableTotals: GA4Row | null;
}

// --- Utils ---
const COLORS = ['#37D67A', '#00A3FF', '#FF4D00', '#94A3B8', '#7C3AED', '#FFD700', '#FF00FF'];

const CHANNEL_COLORS: Record<string, string> = {
  'Direct': '#FF4D00',          // Orange
  'Organic Search': '#00A3FF',  // Blue
  'Organic Social': '#00A3FF',  // Blue
  'Unassigned': '#37D67A',      // Green
  'Referral': '#94A3B8',
  'Email': '#7C3AED',
  'Paid Search': '#FFD700',
  'Paid Social': '#FFD700'
};
const LAYER_PRIORITY: Record<string, number> = {
  'Direct': 10,
  'Organic Search': 9,
  'Organic Social': 8,
  'Unassigned': 7,
  'Paid Search': 6,
  'Paid Social': 5,
  'Total': 1
};

const CHANNEL_ICONS: Record<string, any> = {
  'Direct': MousePointer2,
  'Organic Search': Search,
  'Organic Social': Globe,
  'Referral': ArrowUpRight,
  'Email': Target,
  'Unassigned': RefreshCw
};

const KPICard = ({ label, value, subtext, icon: Icon, color }: any) => {
  const brandColor = color === 'green' ? '#37D67A' : color === 'blue' ? '#00A3FF' : color === 'orange' ? '#FF4D00' : '#94A3B8';
  return (
    <div className="glass-card p-6 rounded-[1.5rem] border border-border-1 relative overflow-hidden group transition-all hover:scale-[1.02]">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-2xl bg-surface-2 border border-border-1 text-text-muted group-hover:text-text-primary transition-colors">
          <Icon size={20} />
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold uppercase text-text-muted tracking-widest">{label}</p>
          <h4 className="text-2xl font-bold text-text-primary tracking-tight mt-1">{value}</h4>
        </div>
      </div>
      <p className="text-[10px] font-semibold text-text-muted mt-2">{subtext}</p>
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
  const [customDates, setCustomDates] = useState<{ start: string; end: string } | null>(null);
  const [tempDates, setTempDates] = useState({ start: '', end: '' });
  const [isRangeOpen, setIsRangeOpen] = useState(false);
  
  const [hiddenChannels, setHiddenChannels] = useState<Set<string>>(new Set());
  const [geoPage, setGeoPage] = useState(1);
  const [eventsPage, setEventsPage] = useState(1);
  const searchParams = useSearchParams();
  const view = searchParams.get('view');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isRangeOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsRangeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isRangeOpen]);

  // Reset pagination on data change
  useEffect(() => {
    setGeoPage(1);
    setEventsPage(1);
  }, [data]);

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
      if (customDates) {
        fetchData(customDates.start, customDates.end);
        return;
      }

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
  }, [clientId, range, customDates, fetchData]);

  // --- Computed Views ---
  
  // 1. Existing Charts Data
  const chartData = useMemo(() => {
    if (!data?.rows) return [];
    return data.rows.map(row => {
      const dateStr = row.dimensionValues[0].value; // YYYYMMDD
      const y = dateStr.slice(0, 4);
      const m = dateStr.slice(4, 6);
      const d = dateStr.slice(6, 8);
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const fullDate = `${monthNames[parseInt(m)-1]} ${d}, ${y}`;
      const formattedDate = `${m}/${d}`;
      
      return {
        date: formattedDate,
        fullDate,
        users: parseInt(row.metricValues[0].value),
        sessions: parseInt(row.metricValues[1].value),
        sortKey: dateStr
      };
    }).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [data]);

  const acquisitionTableData = useMemo(() => {
    if (!data?.acquisitionTable) return [];
    
    const returningMap = new Map<string, number>();
    data.acquisitionBreakdown?.forEach(row => {
       const channel = row.dimensionValues[0].value;
       const type = row.dimensionValues[1].value;
       if (type.toLowerCase().includes('returning')) {
         returningMap.set(channel, parseInt(row.metricValues[0].value));
       }
    });
    
    return data.acquisitionTable.map(row => {
      const channel = row.dimensionValues[0].value;
      const metrics = row.metricValues.map(v => parseFloat(v.value));
      
      return {
        channel,
        totalUsers: metrics[0],
        newUsers: metrics[1],
        activeUsers: metrics[2],
        returningUsers: returningMap.get(channel) || 0,
        engagementDuration: metrics[3],
        engagedSessions: metrics[4],
        eventCount: metrics[5],
        keyEvents: metrics[6],
        keyEventRate: metrics[7] || 0
      };
    }).sort((a, b) => b.totalUsers - a.totalUsers);
  }, [data]);

  // 2.1. Acquisition Table Totals
  const acquisitionTotalsData = useMemo(() => {
    if (!data?.acquisitionTableTotals) return null;
    
    let totalReturning = 0;
    data.acquisitionBreakdown?.forEach(row => {
       const type = row.dimensionValues[1].value;
       if (type.toLowerCase().includes('returning')) {
         totalReturning += parseInt(row.metricValues[0].value);
       }
    });

    const metrics = data.acquisitionTableTotals.metricValues.map(v => parseFloat(v.value));
    
    return {
      channel: 'Total',
      totalUsers: metrics[0],
      newUsers: metrics[1],
      activeUsers: metrics[2],
      returningUsers: totalReturning,
      engagementDuration: metrics[3],
      engagedSessions: metrics[4],
      eventCount: metrics[5],
      keyEvents: metrics[6],
      keyEventRate: metrics[7] || 0
    };
  }, [data]);

  // 3. Acquisition Chart Data (Top 5 Channels Flow)
  const acquisitionChartData = useMemo(() => {
    if (!data?.acquisition) return [];
    
    const topChannels = acquisitionTableData.slice(0, 5).map(d => d.channel);
    const dateMap = new Map<string, any>();
    
    data.acquisition.forEach(row => {
      const channel = row.dimensionValues[0].value;
      const dateStr = row.dimensionValues[1].value; // YYYYMMDD
      
      const y = dateStr.slice(0, 4);
      const m = dateStr.slice(4, 6);
      const d = dateStr.slice(6, 8);
      
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const fullDate = `${monthNames[parseInt(m)-1]} ${d}, ${y}`;
      const formattedDate = `${m}/${d}`;

      const existing = dateMap.get(dateStr) || { 
        date: formattedDate, 
        fullDate: fullDate,
        sortKey: dateStr,
        Total: 0,
        ...Object.fromEntries(topChannels.map(c => [c, 0]))
      };
      
      const value = parseInt(row.metricValues[0].value);
      existing.Total += value;
      if (topChannels.includes(channel)) {
        existing[channel] += value;
      }
      dateMap.set(dateStr, existing);
    });
    
    return Array.from(dateMap.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [data, acquisitionTableData]);

  // Custom Glassmorphism Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const sortedPayload = [...payload].sort((a, b) => {
        if (a.name === 'Total') return -1;
        if (b.name === 'Total') return 1;
        return (b.value || 0) - (a.value || 0);
      });

      return (
        <div className="p-6 rounded-[1rem] border border-border-1 backdrop-blur-3xl bg-surface-1/80 shadow-[0_20px_50px_rgba(0,0,0,0.2)] space-y-4 min-w-[200px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
          <div className="pb-3 border-b border-border-1 relative z-10">
            <p className="text-sm font-bold text-text-primary tracking-tighter">{data.fullDate}</p>
          </div>
          <div className="space-y-2.5">
            {sortedPayload.map((entry: any, index: number) => {
              const color = entry.name === 'Total' ? '#00A3FF' : (CHANNEL_COLORS[entry.name] || entry.color);
              return (
                <div key={index} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted whitespace-nowrap">{entry.name}</span>
                  </div>
                  <span className="text-xs font-bold tracking-tight" style={{ color }}>{entry.value.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

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
    return data.geo.map(row => ({
      country: row.dimensionValues[0].value,
      city: row.dimensionValues[1].value,
      users: parseInt(row.metricValues[0].value)
    }));
  }, [data]);

  const formatDuration = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const eventData = useMemo(() => {
    if (!data?.events) return [];
    return data.events.map(row => ({
      name: row.dimensionValues[0].value,
      count: parseInt(row.metricValues[0].value)
    }));
  }, [data]);

  const trafficTableData = useMemo(() => {
    if (!data?.sessionTable) return [];
    return data.sessionTable.map(row => {
      const channel = row.dimensionValues[0].value;
      const metrics = row.metricValues.map(v => parseFloat(v.value));
      return {
        channel,
        sessions: metrics[0],
        engagedSessions: metrics[1],
        engagementRate: metrics[2],
        eventsPerSession: metrics[3],
        keyEventRate: metrics[4],
        avgDuration: metrics[5],
        eventCount: metrics[6],
        keyEvents: metrics[7]
      };
    }).sort((a, b) => b.sessions - a.sessions);
  }, [data]);

  const trafficTotalsData = useMemo(() => {
    if (!data?.sessionTableTotals) return null;
    const metrics = data.sessionTableTotals.metricValues.map(v => parseFloat(v.value));
    return {
      sessions: metrics[0],
      engagedSessions: metrics[1],
      engagementRate: metrics[2],
      eventsPerSession: metrics[3],
      keyEventRate: metrics[4],
      avgDuration: metrics[5],
      eventCount: metrics[6],
      keyEvents: metrics[7]
    };
  }, [data]);
  
  // --- Pagination Logic ---
  const geoPerPage = 5;
  const totalGeoPages = Math.ceil(geoData.length / geoPerPage);
  const paginatedGeoSubject = useMemo(() => {
    return geoData.slice((geoPage - 1) * geoPerPage, geoPage * geoPerPage);
  }, [geoData, geoPage]);

  const eventsPerPage = 8;
  const totalEventsPages = Math.ceil(eventData.length / eventsPerPage);
  const paginatedEventsSubject = useMemo(() => {
    return eventData.slice((eventsPage - 1) * eventsPerPage, eventsPage * eventsPerPage);
  }, [eventData, eventsPage]);

  const trafficChartData = useMemo(() => {
     if (!data?.sessionAcquisition) return [];
     const topChannels = trafficTableData.slice(0, 5).map(d => d.channel);
     const dateMap = new Map<string, any>();
     
     data.sessionAcquisition.forEach(row => {
       const channel = row.dimensionValues[0].value;
       const dateStr = row.dimensionValues[1].value;
       const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
       const y = dateStr.slice(0, 4);
       const m = dateStr.slice(4, 6);
       const d = dateStr.slice(6, 8);
       const fullDate = `${monthNames[parseInt(m)-1]} ${d}, ${y}`;
       const formattedDate = `${m}/${d}`;

       const existing = dateMap.get(dateStr) || { 
         date: formattedDate, 
         fullDate: fullDate,
         sortKey: dateStr,
         Total: 0,
         ...Object.fromEntries(topChannels.map(c => [c, 0]))
       };
       
       const value = parseInt(row.metricValues[0].value);
       existing.Total += value;
       if (topChannels.includes(channel)) {
         existing[channel] += value;
       }
       dateMap.set(dateStr, existing);
     });
     return Array.from(dateMap.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [data, trafficTableData]);

  if (loading && !data) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-accent-green/20 border-t-accent-green rounded-full animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted animate-pulse">Syncing Intelligence Pipeline...</p>
      </div>
    );
  }

  if (error === 'not_connected' || error === 'not_configured') {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="max-w-md w-full glass-card p-10 rounded-[2rem] border border-white/5 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center border mx-auto mb-4 bg-accent-green/10 text-accent-green border-accent-green/20">
            <BarChart3 size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-text-primary tracking-tight uppercase text-balance">Analytics Required</h2>
            <p className="text-xs text-text-muted font-medium leading-relaxed">
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
    <div className="bg-background flex flex-col gap-6 pb-20 animate-in fade-in duration-700 p-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <button onClick={() => router.back()} className="p-2 bg-surface-2 rounded-xl text-text-muted hover:text-text-primary transition-colors border border-border-1">
               <ArrowLeft size={16} />
             </button>
              <h1 id="realtime" className="text-2xl font-bold text-text-primary tracking-tight uppercase">
                {view === 'traffic_acquisition' ? 'Traffic Acquisition' : 'Platform Analytics'}
              </h1>
              
              {/* Live Indicator */}
              {view !== 'traffic_acquisition' && (
                <div className="flex items-center gap-2 px-3 py-1 bg-accent-green/10 border border-accent-green/20 rounded-full ml-2">
                   <span className="w-1.5 h-1.5 bg-accent-green rounded-full animate-pulse" />
                   <span className="text-[9px] font-bold uppercase text-accent-green tracking-widest">{data?.realtime || '0'} LIVE</span>
                </div>
              )}
           </div>
           <p className="text-text-muted text-xs font-medium ml-11">
             {view === 'traffic_acquisition' 
               ? 'Intelligence on how individual sessions are initiated and performing.' 
               : 'Advanced intelligence on user lifecycle and site engagement.'}
           </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Date Range Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsRangeOpen(!isRangeOpen)}
              className="flex items-center gap-3 px-6 py-4 bg-surface-2 border border-border-1 rounded-3xl text-[10px] font-bold uppercase tracking-widest text-text-primary hover:bg-surface-3 transition-all min-w-[200px]"
            >
              <Calendar size={16} className="text-accent-orange" />
              <span className="truncate">
                {customDates ? `${customDates.start} - ${customDates.end}` : range === '1w' ? 'Last One Week' : range === '30d' ? 'Last 30 Days' : 'Last 3 Months'}
              </span>
              <ChevronDown size={14} className={`ml-auto transition-transform ${isRangeOpen ? 'rotate-180' : ''}`} />
            </button>

            {isRangeOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 glass-card border border-border-1 rounded-[2rem] p-5 animate-in zoom-in-95 duration-200 z-[100]">
                <div className="space-y-1 mb-4">
                  {[
                    { id: '1w', label: 'Last One Week' },
                    { id: '30d', label: 'Last 30 Days' },
                    { id: '3m', label: 'Last 3 Months' }
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => { setRange(r.id); setCustomDates(null); setIsRangeOpen(false); }}
                      className={`w-full text-left px-5 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${range === r.id && !customDates ? 'bg-accent-orange text-white shadow-[0_10px_20px_rgba(255,77,0,0.2)]' : 'text-text-muted hover:bg-surface-3 hover:text-text-primary'}`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-border-1">
                   <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest mb-4 ml-2">Custom Range</p>
                      <div className="relative">
                        <input 
                          type="date"
                          value={tempDates.start}
                          onChange={(e) => setTempDates({ ...tempDates, start: e.target.value })}
                          className="w-full bg-surface-2 border border-border-1 rounded-xl px-4 py-3 text-[10px] font-bold text-text-primary focus:outline-none focus:border-accent-orange/50 transition-all"
                        />
                        <Calendar size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                      </div>
                      <div className="relative">
                        <input 
                          type="date"
                          value={tempDates.end}
                          onChange={(e) => setTempDates({ ...tempDates, end: e.target.value })}
                          className="w-full bg-surface-2 border border-border-1 rounded-xl px-4 py-3 text-[10px] font-bold text-text-primary focus:outline-none focus:border-accent-orange/50 transition-all"
                        />
                        <Calendar size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                      </div>
                      <button 
                        onClick={() => {
                          if (tempDates.start && tempDates.end) {
                            setCustomDates(tempDates);
                            setIsRangeOpen(false);
                          }
                        }}
                        className="w-full py-4 bg-surface-3 hover:bg-accent-orange/10 border border-border-2 text-text-primary text-[10px] font-bold uppercase tracking-widest rounded-2xl transition-all shadow-xl active:scale-95"
                      >
                        Apply Custom
                      </button>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => fetchData()} className="p-4 bg-surface-2 rounded-2xl border border-border-1 text-text-muted hover:text-text-primary transition-all group">
            <RefreshCw size={18} className="group-active:rotate-180 transition-transform duration-500" />
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

      {view === 'traffic_acquisition' ? (
        <div className="space-y-6">
           <div className="glass-card p-10 rounded-[2rem] border border-border-1 relative overflow-hidden group">
              <div className="flex flex-col gap-10">
                 {/* Section Header */}
                 <div className="flex justify-between items-start">
                   <div>
                     <h2 className="text-xl font-bold text-text-primary tracking-tight uppercase flex items-center gap-2">
                        <ArrowUpRight className="text-accent-blue" size={24} /> Traffic Acquisition
                     </h2>
                     <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mt-1">Session primary channel group breakdown</p>
                   </div>
                   
                   <div className="flex flex-wrap gap-4 justify-end max-w-[60%]">
                       {trafficTableData.slice(0, 5).map((d, i) => {
                         const isVisible = !hiddenChannels.has(d.channel);
                         const color = CHANNEL_COLORS[d.channel] || '#94A3B8';
                         
                         return (
                           <div 
                             key={i} 
                             className={`flex items-center gap-3 bg-surface-2 pl-4 pr-3 py-2 rounded-2xl border border-border-1 transition-all cursor-pointer hover:bg-surface-3 ${isVisible ? 'opacity-100' : 'opacity-40'}`}
                             onClick={() => {
                                const next = new Set(hiddenChannels);
                                if (isVisible) next.add(d.channel);
                                else next.delete(d.channel);
                                setHiddenChannels(next);
                             }}
                           >
                             <div 
                               className={`w-3 h-3 rounded-[3px] border-2 transition-all flex items-center justify-center`}
                               style={{ borderColor: color, backgroundColor: isVisible ? color : 'transparent' }}
                             >
                               {isVisible && <Check size={8} strokeWidth={4} className="text-black" />}
                             </div>
                             <div className="flex flex-col items-end">
                               <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{d.channel}</span>
                               <span className="text-sm font-bold tracking-tighter" style={{ color: color }}>
                                 {d.sessions.toLocaleString()}
                               </span>
                             </div>
                           </div>
                         );
                       })}
                    </div>
                 </div>

                 {/* Chart */}
                 <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trafficChartData}>
                         <defs>
                           {trafficTableData.slice(0, 5).map((d, i) => {
                             const color = CHANNEL_COLORS[d.channel] || COLORS[i % COLORS.length];
                             const channelId = d.channel.replace(/\s+/g, '-');
                             return (
                               <linearGradient key={i} id={`color-traffic-${channelId}`} x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor={color} stopOpacity={0.15}/>
                                 <stop offset="95%" stopColor={color} stopOpacity={0}/>
                               </linearGradient>
                             );
                           })}
                         </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-1)" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          stroke="var(--border-2)" 
                          fontSize={9} 
                          tickLine={false} 
                          axisLine={false} 
                          tick={{ fontWeight: 700, fill: 'var(--text-muted)' }}
                          dy={10}
                          interval="preserveStartEnd"
                          minTickGap={40}
                        />
                        <YAxis 
                          stroke="var(--border-2)" 
                          fontSize={9} 
                          tickLine={false} 
                          axisLine={false} 
                          tick={{ fontWeight: 700, fill: 'var(--text-muted)' }}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="Total" stroke="#00A3FF" strokeWidth={2} fillOpacity={0} strokeDasharray="5 5" />
                        {trafficTableData.slice(0, 5)
                           .filter(d => !hiddenChannels.has(d.channel))
                           .map((d, i) => {
                             const color = CHANNEL_COLORS[d.channel] || COLORS[i % COLORS.length];
                             const channelId = d.channel.replace(/\s+/g, '-');
                             return (
                               <Area key={d.channel} type="monotone" dataKey={d.channel} stroke={color} strokeWidth={2.5} fillOpacity={1} fill={`url(#color-traffic-${channelId})`} />
                             );
                        })}
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>

                 {/* Table */}
                 <div className="overflow-hidden border border-border-1 rounded-3xl bg-surface-2/30">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="bg-surface-2 border-b border-border-1 text-[9px] font-bold text-text-muted uppercase tracking-widest">
                            <td className="p-5 pl-8">Channel Group</td>
                            <td className="p-5 text-right">Sessions</td>
                            <td className="p-5 text-right">Engaged Sessions</td>
                            <td className="p-5 text-right">Engagement Rate</td>
                            <td className="p-5 text-right">Events / Session</td>
                            <td className="p-5 text-right">Avg Engagement</td>
                            <td className="p-5 text-right">Event Count</td>
                            <td className="p-5 text-right">Key Events</td>
                            <td className="p-5 text-right pr-8">Key Event Rate</td>
                          </tr>
                       </thead>
                        <tbody>
                           {trafficTotalsData && (
                             <tr className="bg-surface-2/50 border-b border-border-2">
                               <td className="p-5 pl-8">
                                 <span className="text-[11px] font-bold text-text-primary uppercase tracking-tighter">Total</span>
                               </td>
                               <td className="p-5 text-right"><span className="text-[11px] font-bold text-text-primary">{trafficTotalsData.sessions.toLocaleString()}</span></td>
                               <td className="p-5 text-right"><span className="text-[11px] font-bold text-text-secondary">{trafficTotalsData.engagedSessions.toLocaleString()}</span></td>
                               <td className="p-5 text-right"><span className="text-[11px] font-bold text-text-secondary">{(trafficTotalsData.engagementRate * 100).toFixed(2)}%</span></td>
                               <td className="p-5 text-right"><span className="text-[11px] font-bold text-text-secondary">{trafficTotalsData.eventsPerSession.toFixed(2)}</span></td>
                               <td className="p-5 text-right"><span className="text-[11px] font-bold text-text-secondary">{formatDuration(trafficTotalsData.avgDuration)}</span></td>
                               <td className="p-5 text-right"><span className="text-[11px) font-bold text-text-secondary">{trafficTotalsData.eventCount.toLocaleString()}</span></td>
                               <td className="p-5 text-right"><span className="text-[11px] font-bold text-accent-green">{trafficTotalsData.keyEvents.toLocaleString()}</span></td>
                               <td className="p-5 text-right pr-8"><span className="text-[11px] font-bold text-text-primary">{(trafficTotalsData.keyEventRate * 100).toFixed(2)}%</span></td>
                             </tr>
                           )}
                           {trafficTableData.map((row, i) => {
                             const Icon = CHANNEL_ICONS[row.channel] || Monitor;
                             return (
                               <tr key={i} className="group hover:bg-surface-3/50 transition-colors border-b border-border-1 last:border-0">
                                 <td className="p-5 pl-8">
                                    <div className="flex items-center gap-4">
                                       <div className="p-2.5 rounded-xl bg-surface-2 border border-border-1 text-text-muted group-hover:text-text-primary transition-colors">
                                         <Icon size={14} />
                                       </div>
                                       <span className="text-[11px] font-bold text-text-primary tracking-tighter uppercase">{row.channel}</span>
                                    </div>
                                 </td>
                                 <td className="p-5 text-right"><span className="text-[11px] font-bold text-text-primary">{row.sessions.toLocaleString()}</span></td>
                                 <td className="p-5 text-right"><span className="text-[11px] font-bold text-text-secondary">{row.engagedSessions.toLocaleString()}</span></td>
                                 <td className="p-5 text-right"><span className="text-[11px] font-bold text-text-secondary">{(row.engagementRate * 100).toFixed(2)}%</span></td>
                                 <td className="p-5 text-right"><span className="text-[11px] font-bold text-text-secondary">{row.eventsPerSession.toFixed(2)}</span></td>
                                 <td className="p-5 text-right"><span className="text-[11px] font-bold text-accent-blue">{formatDuration(row.avgDuration)}</span></td>
                                 <td className="p-5 text-right"><span className="text-[11px] font-bold text-text-secondary">{row.eventCount.toLocaleString()}</span></td>
                                 <td className="p-5 text-right"><span className="text-[11px] font-bold text-accent-green">{row.keyEvents.toLocaleString()}</span></td>
                                 <td className="p-5 text-right pr-8"><span className="text-[11px] font-bold text-text-primary">{(row.keyEventRate * 100).toFixed(2)}%</span></td>
                               </tr>
                             );
                           })}
                        </tbody>
                    </table>
                 </div>
              </div>
           </div>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            <div className="glass-card p-10 rounded-[2rem] border border-border-1 relative overflow-hidden group">
              <div className="flex flex-col gap-10">
                 <div className="flex justify-between items-start">
                   <div>
                     <h2 className="text-xl font-bold text-text-primary tracking-tight uppercase flex items-center gap-2">
                        <ArrowUpRight className="text-accent-green" size={24} /> User Acquisition
                     </h2>
                     <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mt-1">First user primary channel group</p>
                   </div>
                   
                   <div className="flex flex-wrap gap-4 justify-end max-w-[60%]">
                       {acquisitionTableData.slice(0, 5).map((d, i) => {
                         const isVisible = !hiddenChannels.has(d.channel);
                         const color = CHANNEL_COLORS[d.channel] || '#94A3B8';
                         
                         return (
                           <div 
                             key={i} 
                             className={`flex items-center gap-3 bg-surface-2 pl-4 pr-3 py-2 rounded-2xl border border-border-1 transition-all cursor-pointer hover:bg-surface-3 ${isVisible ? 'opacity-100' : 'opacity-40'}`}
                             onClick={() => {
                                const next = new Set(hiddenChannels);
                                if (isVisible) next.add(d.channel);
                                else next.delete(d.channel);
                                setHiddenChannels(next);
                             }}
                           >
                             <div 
                               className={`w-3 h-3 rounded-[3px] border-2 transition-all flex items-center justify-center`}
                               style={{ borderColor: color, backgroundColor: isVisible ? color : 'transparent' }}
                             >
                               {isVisible && <Check size={8} strokeWidth={4} className="text-black" />}
                             </div>
                             <div className="flex flex-col items-end">
                               <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{d.channel}</span>
                               <span className="text-sm font-bold tracking-tighter" style={{ color: color }}>
                                 {d.totalUsers.toLocaleString()}
                               </span>
                             </div>
                           </div>
                         );
                       })}
                    </div>
                 </div>

                 <div className="h-[300px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={acquisitionChartData}>
                        <defs>
                          {acquisitionTableData.slice(0, 5).map((d, i) => {
                            const color = CHANNEL_COLORS[d.channel] || COLORS[i % COLORS.length];
                            const channelId = d.channel.replace(/\s+/g, '-');
                            return (
                              <linearGradient key={i} id={`color-${channelId}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.15}/>
                                <stop offset="95%" stopColor={color} stopOpacity={0}/>
                              </linearGradient>
                            );
                          })}
                        </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="var(--border-1)" vertical={false} />
                       <XAxis 
                         dataKey="date" 
                         stroke="var(--border-2)" 
                         fontSize={9} 
                         tickLine={false} 
                         axisLine={false} 
                         tick={{ fontWeight: 700, fill: 'var(--text-muted)' }}
                         dy={10}
                         interval="preserveStartEnd"
                         minTickGap={40}
                       />
                       <YAxis 
                         stroke="var(--border-2)" 
                         fontSize={9} 
                         tickLine={false} 
                         axisLine={false} 
                         tick={{ fontWeight: 700, fill: 'var(--text-muted)' }}
                       />
                       <RechartsTooltip 
                         content={<CustomTooltip />} 
                         offset={25}
                         cursor={{ stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 2 }}
                       />
                          <Area 
                            type="monotone" 
                            dataKey="Total" 
                            stroke="#00A3FF"
                            strokeWidth={2} 
                            fillOpacity={0} 
                            strokeDasharray="5 5"
                          />
                          {[...acquisitionTableData.slice(0, 5)]
                            .filter(d => !hiddenChannels.has(d.channel))
                            .sort((a, b) => (LAYER_PRIORITY[a.channel] || 0) - (LAYER_PRIORITY[b.channel] || 0))
                            .map((d, i) => {
                              const color = CHANNEL_COLORS[d.channel] || COLORS[i % COLORS.length];
                              const channelId = d.channel.replace(/\s+/g, '-');
                              return (
                                <Area 
                                  key={d.channel}
                                  type="monotone" 
                                  dataKey={d.channel} 
                                  stroke={color}
                                  strokeWidth={2.5} 
                                  fillOpacity={1} 
                                  fill={`url(#color-${channelId})`} 
                                  strokeDasharray={d.channel === 'Paid Social' ? "5 5" : "0"}
                                />
                              );
                            })}
                     </AreaChart>
                   </ResponsiveContainer>
                 </div>

                 <div className="overflow-hidden border border-border-1 rounded-3xl bg-surface-2/30">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="bg-surface-2 border-b border-border-1 text-[9px] font-bold text-text-muted uppercase tracking-widest">
                            <td className="p-5 pl-8">Channel Group</td>
                            <td className="p-5 text-right">Total Users</td>
                            <td className="p-5 text-right">New Users</td>
                            <td className="p-5 text-right">Returning</td>
                            <td className="p-5 text-right">Avg Engagement</td>
                            <td className="p-5 text-right">Engaged Sessions / User</td>
                            <td className="p-5 text-right">Event Count</td>
                            <td className="p-5 text-right">Key Events</td>
                            <td className="p-5 text-right pr-8">Key Event Rate</td>
                          </tr>
                       </thead>
                        <tbody>
                           {acquisitionTotalsData && (
                             <tr className="bg-surface-2/50 border-b border-border-2">
                               <td className="p-5 pl-8">
                                 <div className="flex items-center gap-4">
                                   <div className="p-2.5 rounded-xl bg-surface-2 border border-border-1 text-text-primary">
                                     <BarChart3 size={14} />
                                   </div>
                                   <span className="text-[11px] font-bold text-text-primary uppercase tracking-tighter">Total</span>
                                 </div>
                               </td>
                               <td className="p-5 text-right">
                                  <span className="text-[11px] font-bold text-text-primary">{acquisitionTotalsData.totalUsers.toLocaleString()}</span>
                               </td>
                               <td className="p-5 text-right">
                                  <span className="text-[11px] font-bold text-text-secondary">{acquisitionTotalsData.newUsers.toLocaleString()}</span>
                               </td>
                               <td className="p-5 text-right">
                                  <span className="text-[11px] font-bold text-text-secondary">{acquisitionTotalsData.returningUsers.toLocaleString()}</span>
                               </td>
                               <td className="p-5 text-right">
                                  <span className="text-[11px] font-bold text-text-secondary">
                                    {Math.floor((acquisitionTotalsData.engagementDuration / Math.max(acquisitionTotalsData.activeUsers, 1)))}s
                                  </span>
                               </td>
                               <td className="p-5 text-right">
                                  <span className="text-[11px] font-bold text-text-secondary">
                                    {(acquisitionTotalsData.engagedSessions / Math.max(acquisitionTotalsData.activeUsers, 1)).toFixed(2)}
                                  </span>
                               </td>
                               <td className="p-5 text-right">
                                  <span className="text-[11px] font-bold text-text-secondary">{acquisitionTotalsData.eventCount.toLocaleString()}</span>
                               </td>
                               <td className="p-5 text-right">
                                  <span className="text-[11px] font-bold text-accent-green">{acquisitionTotalsData.keyEvents.toLocaleString()}</span>
                               </td>
                               <td className="p-5 text-right pr-8">
                                    <div className="flex flex-col items-end">
                                      <span className="text-[11px] font-bold text-text-primary">{(acquisitionTotalsData.keyEventRate * 100).toFixed(2)}%</span>
                                    </div>
                               </td>
                             </tr>
                           )}
                           {acquisitionTableData.map((row, i) => {
                            const Icon = CHANNEL_ICONS[row.channel] || Monitor;
                            const avgTime = row.engagementDuration / Math.max(row.activeUsers, 1);

                            return (
                              <tr key={i} className="group hover:bg-surface-3/50 transition-colors border-b border-border-1 last:border-0">
                                <td className="p-5 pl-8">
                                   <div className="flex items-center gap-4">
                                      <div className="p-2.5 rounded-xl bg-surface-2 border border-border-1 text-text-muted group-hover:text-text-primary transition-colors">
                                        <Icon size={14} />
                                      </div>
                                      <span className="text-[11px] font-bold text-text-primary tracking-tighter uppercase">{row.channel}</span>
                                   </div>
                                </td>
                                <td className="p-5 text-right">
                                   <span className="text-[11px] font-bold text-text-primary">{row.totalUsers.toLocaleString()}</span>
                                </td>
                                <td className="p-5 text-right">
                                   <span className="text-[11px] font-bold text-text-secondary">{row.newUsers.toLocaleString()}</span>
                                </td>
                                <td className="p-5 text-right">
                                   <span className="text-[11px] font-bold text-text-secondary">{row.returningUsers.toLocaleString()}</span>
                                </td>
                                <td className="p-5 text-right">
                                   <span className="text-[11px] font-bold text-accent-blue">{formatDuration(avgTime)}</span>
                                </td>
                                 <td className="p-5 text-right">
                                    <span className="text-[11px] font-bold text-text-secondary">
                                      {(row.engagedSessions / Math.max(row.activeUsers, 1)).toFixed(2)}
                                    </span>
                                 </td>
                                <td className="p-5 text-right">
                                   <span className="text-[11px] font-bold text-text-secondary">{row.eventCount.toLocaleString()}</span>
                                </td>
                                <td className="p-5 text-right">
                                   <span className="text-[11px] font-bold text-accent-green">{row.keyEvents.toLocaleString()}</span>
                                </td>
                                <td className="p-5 text-right pr-8">
                                   <div className="flex flex-col items-end">
                                     <span className="text-[11px] font-bold text-text-primary">{(row.keyEventRate * 100).toFixed(2)}%</span>
                                   </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                    </table>
                 </div>
              </div>
           </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <button 
              onClick={() => router.push(`/intelligence/${clientId}/analytics?view=traffic_acquisition`)}
              className="col-span-12 lg:col-span-7 glass-card p-8 rounded-[2rem] border border-border-1 min-h-[350px] flex flex-col relative overflow-hidden group text-left transition-all hover:scale-[1.01] hover:border-accent-green/20"
            >
               <div className="absolute top-0 right-0 w-64 h-64 bg-accent-green/5 blur-[100px] pointer-events-none" />
               <div className="flex justify-between items-center mb-8 relative z-10">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-primary flex items-center gap-2">
                    <BarChart3 size={14} className="text-accent-green" /> Traffic Overview
                  </h3>
                  <div className="flex gap-4">
                     <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent-green" />
                        <span className="text-[9px] font-bold uppercase text-text-muted tracking-widest">Active Users</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent-blue" />
                        <span className="text-[9px] font-bold uppercase text-text-muted tracking-widest">Sessions</span>
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
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-1)" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="var(--border-2)" 
                        fontSize={9} 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fontWeight: 700, fill: 'var(--text-muted)' }}
                        interval="preserveStartEnd"
                        minTickGap={40}
                      />
                      <YAxis 
                        stroke="var(--border-2)" 
                        fontSize={9} 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fontWeight: 700, fill: 'var(--text-muted)' }}
                      />
                      <RechartsTooltip 
                        content={<CustomTooltip />} 
                        offset={25}
                        cursor={{ stroke: 'var(--border-1)', strokeWidth: 2 }}
                      />
                      <Area type="monotone" dataKey="users" stroke="#37D67A" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                      <Area type="monotone" dataKey="sessions" stroke="#00A3FF" strokeWidth={3} fillOpacity={1} fill="url(#colorSessions)" />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
              </button>

            <div className="col-span-12 lg:col-span-5 glass-card p-8 rounded-[2rem] border border-border-1 flex flex-col relative overflow-hidden group">
               <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-primary mb-8 flex items-center gap-2 relative z-10">
                 <Globe size={14} className="text-accent-blue" /> Geographic Reach
               </h3>
               <div className="space-y-4 relative z-10 flex-1 overflow-y-auto no-scrollbar">
                  {paginatedGeoSubject.map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                       <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                             <span className="text-[10px] font-bold text-text-primary uppercase tracking-tighter">{item.city}, {item.country}</span>
                             <span className="text-[10px] font-bold text-accent-blue">{item.users} Users</span>
                          </div>
                          <div className="w-full h-1 bg-surface-2 rounded-full overflow-hidden">
                             <div className="h-full bg-accent-blue rounded-full" style={{ width: `${(item.users / (parseInt(data?.totals[0]?.value || '1'))) * 100}%` }} />
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
               {totalGeoPages > 1 && (
                 <div className="flex items-center justify-between mt-auto pt-6 border-t border-border-1/30 relative z-10 transition-all animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest font-mono">Page {geoPage.toString().padStart(2, '0')} / {totalGeoPages.toString().padStart(2, '0')}</span>
                    <div className="flex gap-2">
                       <button 
                         disabled={geoPage === 1}
                         onClick={() => setGeoPage(prev => Math.max(1, prev - 1))}
                         className="p-2 rounded-xl bg-surface-2/50 border border-border-1 text-text-muted hover:text-text-primary hover:border-accent-blue/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90"
                       >
                         <ChevronLeft size={14} />
                       </button>
                       <button 
                         disabled={geoPage === totalGeoPages}
                         onClick={() => setGeoPage(prev => Math.min(totalGeoPages, prev + 1))}
                         className="p-2 rounded-xl bg-surface-2/50 border border-border-1 text-text-muted hover:text-text-primary hover:border-accent-blue/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90"
                       >
                         <ChevronRight size={14} />
                       </button>
                    </div>
                 </div>
               )}
            </div>

            <div className="col-span-12 glass-card p-8 rounded-[2rem] border border-border-1 flex flex-col relative overflow-hidden group">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-primary mb-8 flex items-center gap-2 relative z-10">
                  <MousePointer2 size={14} className="text-accent-green" /> Event Explorer
                </h3>
                <div className="grid grid-cols-4 gap-3 relative z-10">
                   {paginatedEventsSubject.map((item, i) => (
                     <div key={i} className="bg-surface-2 p-4 rounded-2xl border border-border-1 flex justify-between items-center group/item hover:border-accent-green/30 transition-all cursor-default">
                        <div>
                          <p className="text-[8px] font-bold uppercase text-text-muted tracking-widest group-hover/item:text-accent-green transition-colors">Action</p>
                          <p className="text-[11px] font-bold text-text-primary tracking-tighter">{item.name}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-sm font-bold text-text-primary tracking-tighter">{item.count.toLocaleString()}</p>
                           <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest">Total events</p>
                        </div>
                     </div>
                   ))}
                </div>
                {totalEventsPages > 1 && (
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-border-1/30 relative z-10 transition-all animate-in fade-in slide-in-from-bottom-2 duration-500">
                     <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest font-mono">Page {eventsPage.toString().padStart(2, '0')} / {totalEventsPages.toString().padStart(2, '0')}</span>
                     <div className="flex gap-2">
                        <button 
                          disabled={eventsPage === 1}
                          onClick={() => setEventsPage(prev => Math.max(1, prev - 1))}
                          className="p-2 rounded-xl bg-surface-2/50 border border-border-1 text-text-muted hover:text-text-primary hover:border-accent-green/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <button 
                          disabled={eventsPage === totalEventsPages}
                          onClick={() => setEventsPage(prev => Math.min(totalEventsPages, prev + 1))}
                          className="p-2 rounded-xl bg-surface-2/50 border border-border-1 text-text-muted hover:text-text-primary hover:border-accent-green/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90"
                        >
                          <ChevronRight size={14} />
                        </button>
                     </div>
                  </div>
                )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
