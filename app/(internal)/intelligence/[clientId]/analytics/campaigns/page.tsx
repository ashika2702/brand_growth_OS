"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Target, 
  Calendar,
  ChevronDown,
  ArrowLeft,
  Filter,
  Check,
  BarChart3,
  MousePointer2,
  Users,
  Activity,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip
} from 'recharts';

// --- Types ---
interface GA4Row {
  dimensionValues: { value: string }[];
  metricValues: { value: string }[];
}

interface CampaignData {
  campaigns: GA4Row[];
  campaignTotals: GA4Row | null;
  campaignSeries: GA4Row[];
}

// --- Utils ---
const COLORS = ['#FF4D00', '#00A3FF', '#37D67A', '#FFD700', '#37D67A', '#FFD700'];

const getCampaignStyle = (campaign: string, index: number) => {
  if (campaign === '(direct)') return { color: '#FF4D00', dashed: false };
  
  // Logic to skip orange for non-direct and cycle through others
  const styles = [
    { color: '#00A3FF', dashed: false }, // Blue
    { color: '#37D67A', dashed: false }, // Green
    { color: '#FFD700', dashed: false }, // Yellow
    { color: '#37D67A', dashed: true },  // Dotted Green
    { color: '#FFD700', dashed: true }   // Dotted Yellow
  ];
  
  // Adjusted index if direct is present at 0
  return styles[(index - 1) % styles.length] || styles[0];
};

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-1/90 backdrop-blur-xl border border-border-1 p-4 rounded-xl shadow-2xl">
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3 border-b border-border-1 pb-2">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color || entry.stroke }} />
                <span className="text-[10px] font-bold text-text-primary uppercase tracking-tighter truncate max-w-[150px]">{entry.name}</span>
              </div>
              <span className="text-[11px] font-black text-text-primary tabular-nums">{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function CampaignIntelligencePage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CampaignData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState('30d');
  const [customDates, setCustomDates] = useState<{ start: string; end: string } | null>(null);
  const [tempDates, setTempDates] = useState({ start: '', end: '' });
  const [isRangeOpen, setIsRangeOpen] = useState(false);
  const [hiddenChannels, setHiddenChannels] = useState<Set<string>>(new Set());
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

  const fetchData = useCallback(async (start?: string, end?: string) => {
    setLoading(true);
    try {
      let url = `/api/intelligence/${clientId}/analytics?`;
      if (start && end) {
        url += `startDate=${start}&endDate=${end}`;
      }
      
      const response = await fetch(url);
      const result = await response.json();
      if (result.error) throw new Error(result.message || result.error);
      setData(result);
    } catch (err: any) {
      setError(err.message);
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
      // GA4 usually has a 24-48hr delay for full data processing
      const baseDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000); 
      const endDate = baseDate.toISOString().split('T')[0];

      let start = new Date(baseDate.getTime());
      if (range === '7d') start.setDate(start.getDate() - 7);
      else if (range === '30d') start.setDate(start.getDate() - 30);
      else if (range === '90d') start.setDate(start.getDate() - 90);
      
      const startDate = start.toISOString().split('T')[0];
      fetchData(startDate, endDate);
    }
  }, [clientId, range, customDates, fetchData]);

  const campaignTableData = useMemo(() => {
    if (!data?.campaigns) return [];
    return data.campaigns.map(row => {
      const campaign = row.dimensionValues[0].value;
      const source = row.dimensionValues[1].value;
      const medium = row.dimensionValues[2].value;
      const metrics = row.metricValues.map(v => parseFloat(v.value));
      
      const campaignDisplay = campaign === '(direct)' ? 'Direct traffic' : campaign === '(organic)' ? 'Organic search' : campaign === '(referral)' ? 'Referral' : campaign;

      return {
        campaign,
        campaignDisplay,
        sourceMedium: `${source} / ${medium}`,
        activeUsers: metrics[0],
        sessions: metrics[1],
        engagedSessions: metrics[2],
        eventCount: metrics[3],
        conversions: metrics[4],
        engagementDuration: metrics[5],
        revenue: metrics[6],
        key: `${campaign}-${source}-${medium}` // Unique key for rows
      };
    }).sort((a, b) => b.activeUsers - a.activeUsers);
  }, [data]);

  const campaignTotalsData = useMemo(() => {
    if (!data?.campaignTotals) return null;
    const metrics = data.campaignTotals.metricValues.map(v => parseFloat(v.value));
    return {
      activeUsers: metrics[0],
      sessions: metrics[1],
      engagedSessions: metrics[2],
      eventCount: metrics[3],
      conversions: metrics[4],
      engagementDuration: metrics[5],
      revenue: metrics[6]
    };
  }, [data]);

  const topCampaignsAggregated = useMemo(() => {
    const agg = new Map<string, { campaign: string, activeUsers: number }>();
    campaignTableData.forEach(d => {
      const existing = agg.get(d.campaign) || { campaign: d.campaign, activeUsers: 0 };
      existing.activeUsers += d.activeUsers;
      agg.set(d.campaign, existing);
    });
    return Array.from(agg.values()).sort((a, b) => b.activeUsers - a.activeUsers).slice(0, 5);
  }, [campaignTableData]);

  const campaignTrendData = useMemo(() => {
    if (!data?.campaignSeries) return [];
    
    const topNames = topCampaignsAggregated.map(d => d.campaign);
    const dateMap = new Map<string, any>();
    
    data.campaignSeries.forEach(row => {
      const campaign = row.dimensionValues[0].value;
      const dateStr = row.dimensionValues[1].value;
       
      const y = dateStr.slice(0, 4);
      const m = dateStr.slice(4, 6);
      const d = dateStr.slice(6, 8);
      
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const formattedDate = `${monthNames[parseInt(m)-1]} ${d}`;

      const existing = dateMap.get(dateStr) || { 
        date: formattedDate, 
        sortKey: dateStr,
        Total: 0,
        ...Object.fromEntries(topNames.map(c => [c, 0]))
      };
      
      const value = parseInt(row.metricValues[0].value);
      existing.Total += value;
      if (topNames.includes(campaign)) {
        existing[campaign] = (existing[campaign] || 0) + value;
      }
      dateMap.set(dateStr, existing);
    });
    
    return Array.from(dateMap.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [data, topCampaignsAggregated]);

  if (loading && !data) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-accent-orange/20 border-t-accent-orange rounded-full animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted animate-pulse">Syncing Campaign Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-4 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Back to Analytics</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-orange/10 border border-accent-orange/20 flex items-center justify-center">
              <Target className="text-accent-orange" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-text-primary tracking-tight uppercase">Non-Google Campaigns</h1>
              <p className="text-text-muted text-xs font-bold tracking-widest mt-1">Manual UTM & Social performance breakdown</p>
            </div>
          </div>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-4">
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsRangeOpen(!isRangeOpen)}
              className="flex items-center gap-3 bg-surface-2 border border-border-1 px-6 py-4 rounded-3xl hover:border-accent-orange/30 transition-all min-w-[220px] group shadow-sm"
            >
              <Calendar size={18} className="text-accent-orange" />
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-primary truncate">
                {customDates 
                  ? `${new Date(customDates.start).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} - ${new Date(customDates.end).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}` 
                  : range === '7d' ? 'Last One Week' : range === '30d' ? 'Last 30 Days' : 'Last 3 Months'}
              </span>
              <ChevronDown size={14} className={`text-text-muted ml-auto transition-transform duration-300 ${isRangeOpen ? 'rotate-180' : ''}`} />
            </button>

            {isRangeOpen && (
              <div className="absolute top-full right-0 mt-3 w-72 glass-card border border-border-1 rounded-[2rem] p-5 animate-in zoom-in-95 duration-200 z-[100] shadow-2xl">
                <div className="space-y-1 mb-4">
                  {[
                    { id: '7d', label: 'Last One Week' },
                    { id: '30d', label: 'Last 30 Days' },
                    { id: '90d', label: 'Last 3 Months' }
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
                      <div className="space-y-2">
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
              </div>
            )}
          </div>

          <button onClick={() => fetchData()} className="p-4 bg-surface-2 rounded-2xl border border-border-1 text-text-muted hover:text-text-primary transition-all group shadow-sm">
            <RefreshCw size={18} className="group-active:rotate-180 transition-transform duration-500" />
          </button>
        </div>
      </div>

      {loading && data && (
        <div className="fixed top-20 right-8 z-[100] animate-in fade-in slide-in-from-right-4">
           <div className="bg-surface-2 border border-border-1 rounded-full px-4 py-2 flex items-center gap-3 shadow-xl">
              <div className="w-2 h-2 bg-accent-orange rounded-full animate-ping" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-text-primary">Updating Live Data...</span>
           </div>
        </div>
      )}

      {/* Main Campaign Layout */}
      <div className="glass-card p-10 rounded-[2.5rem] border border-border-1 relative overflow-hidden group">
        <div className="flex flex-col gap-10">
           <div className="flex justify-between items-start">
             <div>
               <h2 className="text-lg font-bold text-text-primary tracking-tight uppercase flex items-center gap-2">
                  <Activity className="text-accent-orange" size={24} /> Performance Timeline
               </h2>
               <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mt-1">Comparison of top performing manual campaigns</p>
             </div>
             
             <div className="flex flex-wrap gap-4 justify-end max-w-[60%]">
                  {topCampaignsAggregated.map((d, i) => {
                    const isVisible = !hiddenChannels.has(d.campaign);
                    const { color, dashed } = getCampaignStyle(d.campaign, i);
                    const display = d.campaign === '(direct)' ? 'Direct traffic' : d.campaign === '(organic)' ? 'Organic search' : d.campaign === '(referral)' ? 'Referral' : d.campaign;

                    return (
                      <div 
                        key={d.campaign} 
                        className={`flex items-center gap-3 bg-surface-2 pl-4 pr-3 py-2 rounded-2xl border border-border-1 transition-all cursor-pointer hover:bg-surface-3 ${isVisible ? 'opacity-100' : 'opacity-40'}`}
                        onClick={() => {
                           const next = new Set(hiddenChannels);
                           if (isVisible) next.add(d.campaign);
                           else next.delete(d.campaign);
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
                          <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest truncate max-w-[100px]" title={display}>{display}</span>
                          <span className="text-sm font-bold tracking-tighter" style={{ color: color }}>
                            {d.activeUsers.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
           </div>

           {/* Trend Chart */}
           <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={campaignTrendData}>
                    <defs>
                      {topCampaignsAggregated.map((d, i) => {
                        const { color } = getCampaignStyle(d.campaign, i);
                        const campaignId = d.campaign.replace(/\s+/g, '-').replace(/[()]/g, '');
                        return (
                          <linearGradient key={d.campaign} id={`color-campaign-${campaignId}`} x1="0" y1="0" x2="0" y2="1">
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
                    {topCampaignsAggregated
                       .filter(d => !hiddenChannels.has(d.campaign))
                       .map((d, i) => {
                         const { color, dashed } = getCampaignStyle(d.campaign, i);
                         const campaignId = d.campaign.replace(/\s+/g, '-').replace(/[()]/g, '');
                         return (
                           <Area key={d.campaign} type="monotone" dataKey={d.campaign} stroke={color} strokeWidth={2.5} fillOpacity={1} fill={`url(#color-campaign-${campaignId})`} strokeDasharray={dashed ? "5 5" : "0"} />
                         );
                    })}
                 </AreaChart>
              </ResponsiveContainer>
           </div>

           {/* High-Density Table */}
           <div className="overflow-hidden border border-border-1 rounded-[2rem] bg-surface-2/30">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-surface-2 border-b border-border-1 text-[8px] font-bold text-text-muted uppercase tracking-widest ">
                      <td className="p-5 pl-8">Campaign Intelligence</td>
                      <td className="p-5 text-right">Active Users</td>
                      <td className="p-5 text-right">Sessions</td>
                      <td className="p-5 text-right">Engaged Sessions</td>
                      <td className="p-5 text-right">Eng. Rate</td>
                      <td className="p-5 text-right">Avg Duration</td>
                      <td className="p-5 text-right">Conversions</td>
                      <td className="p-5 text-right pr-8">Revenue</td>
                    </tr>
                 </thead>
                  <tbody>
                    {campaignTotalsData && (
                        <tr className="bg-surface-2/50 border-b border-border-2 text-text-primary">
                          <td className="p-5 pl-8">
                             <div className="flex items-center gap-4">
                                <div className="p-2.5 rounded-xl bg-surface-2 border border-border-1 text-text-primary">
                                  <BarChart3 size={14} />
                                </div>
                                <span className="text-[11px] font-bold uppercase tracking-tighter">Total</span>
                             </div>
                          </td>
                          <td className="p-5 text-right"><span className="text-[11px] font-bold">{campaignTotalsData.activeUsers.toLocaleString()}</span></td>
                          <td className="p-5 text-right"><span className="text-[11px] font-bold">{campaignTotalsData.sessions.toLocaleString()}</span></td>
                          <td className="p-5 text-right"><span className="text-[11px] font-bold">{campaignTotalsData.engagedSessions.toLocaleString()}</span></td>
                          <td className="p-5 text-right"><span className="text-[11px] font-bold">{(campaignTotalsData.engagedSessions / Math.max(campaignTotalsData.sessions, 1) * 100).toFixed(1)}%</span></td>
                          <td className="p-5 text-right"><span className="text-[11px] font-bold text-accent-blue">{formatDuration(campaignTotalsData.engagementDuration / Math.max(campaignTotalsData.activeUsers, 1))}</span></td>
                          <td className="p-5 text-right"><span className="text-[11px] font-bold text-accent-green">{campaignTotalsData.conversions.toLocaleString()}</span></td>
                          <td className="p-5 text-right pr-8"><span className="text-[11px] font-bold">${campaignTotalsData.revenue.toFixed(0)}</span></td>
                        </tr>
                      )}
                    {campaignTableData.length > 0 ? (
                      campaignTableData.map((row) => (
                         <tr key={row.key} className="group hover:bg-surface-3/50 transition-colors border-b border-border-1 last:border-0 text-text-secondary">
                            <td className="p-5 pl-8">
                               <div className="flex flex-col">
                                  <span className="text-[11px] font-bold text-text-primary uppercase tracking-tighter truncate max-w-[300px]" title={row.campaignDisplay}>
                                     {row.campaignDisplay}
                                  </span>
                                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-1">{row.sourceMedium}</span>
                                </div>
                            </td>
                            <td className="p-5 text-right"><span className="text-[11px] font-bold text-text-primary">{row.activeUsers.toLocaleString()}</span></td>
                            <td className="p-5 text-right"><span className="text-[11px] font-bold">{row.sessions.toLocaleString()}</span></td>
                            <td className="p-5 text-right"><span className="text-[11px] font-bold">{row.engagedSessions.toLocaleString()}</span></td>
                            <td className="p-5 text-right"><span className="text-[11px] font-bold">{(row.engagedSessions / Math.max(row.sessions, 1) * 100).toFixed(1)}%</span></td>
                            <td className="p-5 text-right"><span className="text-[11px] font-bold text-accent-blue">{formatDuration(row.engagementDuration / Math.max(row.activeUsers, 1))}</span></td>
                            <td className="p-5 text-right"><span className="text-[11px] font-bold text-accent-green">{row.conversions.toLocaleString()}</span></td>
                            <td className="p-5 text-right pr-8"><span className="text-[11px] font-bold text-text-primary">${row.revenue.toFixed(0)}</span></td>
                         </tr>
                      ))
                    ) : (
                      <tr>
                         <td colSpan={8} className="p-10 text-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">No manual campaigns detected in this period</p>
                         </td>
                      </tr>
                    )}
                  </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
}
