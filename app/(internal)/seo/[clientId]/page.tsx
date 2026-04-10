"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { 
  Globe, 
  TrendingUp, 
  BarChart3, 
  Zap,
  ArrowUpRight,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Calendar,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart,
  AreaChart,
  Area, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';

// --- Types ---
interface GSCMetricRow {
  keys?: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface PerformanceData {
  keywords: GSCMetricRow[];
  trends: GSCMetricRow[];
  prevKeywords: GSCMetricRow[];
  prevTrends: GSCMetricRow[];
  range: {
    startDate: string;
    endDate: string;
    prevStart: string;
    prevEnd: string;
  };
}

// --- Components ---

const Sparkline = ({ data, color }: { data: any[], color: string }) => (
  <div className="h-10 w-full overflow-hidden">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area 
          type="monotone" 
          dataKey="val" 
          stroke={color} 
          strokeWidth={2} 
          fillOpacity={1} 
          fill={`url(#grad-${color})`} 
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const KPICard = ({ label, value, trend, trendVal, data, color }: any) => {
  const brandColor = color === 'orange' ? '#FF4D00' : color === 'blue' ? '#00A3FF' : color === 'green' ? '#00FF9D' : '#94A3B8';
  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] shadow-xl relative overflow-hidden group`} 
         style={{ 
           backgroundColor: `${brandColor}08`, 
           borderColor: `${brandColor}25` 
         }}>
    {/* Subtle Glow Accent */}
    <div className="absolute -top-10 -right-10 w-24 h-24 blur-[40px] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity"
         style={{ backgroundColor: brandColor }} />
    
    <p className="text-[10px] font-bold text-slate-400 mb-1 tracking-tight uppercase">{label}</p>
    <div className="flex items-center gap-2 mb-3 relative z-10">
      <h4 className="text-xl font-black text-white tracking-tighter">{value}</h4>
      {trend && (
        <span className={`text-[11px] font-bold ${trend === 'up' ? 'text-accent-green' : 'text-accent-red'}`}>
          {trend === 'up' ? '+' : '-'}{trendVal}
        </span>
      )}
    </div>
    <div className="mt-auto relative z-10">
      <Sparkline data={data} color={brandColor} />
    </div>
  </div>
  );
};

export default function ClientSEODashboard() {
  const params = useParams();
  const clientId = params.clientId as string;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PerformanceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30d');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [aggregation, setAggregation] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [showAggDropdown, setShowAggDropdown] = useState(false);

  // --- Data Fetching ---
  const fetchData = useCallback(async (start?: string, end?: string) => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/seo/${clientId}/performance`;
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
      console.error('Failed to load SEO data');
      setError(err.message || 'failed');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (clientId) {
      if (dateRange !== 'custom') {
        // Calculate dates based on range
        // GSC usually has 48hr delay
        const now = new Date();
        const baseDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
        const endDate = baseDate.toISOString().split('T')[0];

        let start = new Date(baseDate.getTime());
        if (dateRange === '1w') start.setDate(start.getDate() - 7);
        else if (dateRange === '30d') start.setDate(start.getDate() - 30);
        else if (dateRange === '3m') start.setMonth(start.getMonth() - 3);
        
        const startDate = start.toISOString().split('T')[0];
        fetchData(startDate, endDate);
      }
    }
  }, [clientId, dateRange, fetchData]);

  // --- Computed Stats ---
  const stats = useMemo(() => {
    if (!data) return null;
    
    // Use TRENDS for totals to include anonymized queries that are hidden in the keywords list
    const curClicks = data.trends.reduce((a, b) => a + (b.clicks || 0), 0);
    const prevClicks = data.prevTrends.reduce((a, b) => a + (b.clicks || 0), 0);
    const clickDiff = ((curClicks - prevClicks) / (prevClicks || 1) * 100).toFixed(1);

    const curImps = data.trends.reduce((a, b) => a + (b.impressions || 0), 0);
    const prevImps = data.prevTrends.reduce((a, b) => a + (b.impressions || 0), 0);
    const impDiff = ((curImps - prevImps) / (prevImps || 1) * 100).toFixed(1);

    // Position is still best averaged from keywords for focus on ranked terms
    const curPos = data.trends.reduce((a, b) => a + (b.position || 0), 0) / (data.trends.length || 1);
    const prevPos = data.prevTrends.reduce((a, b) => a + (b.position || 0), 0) / (data.prevTrends.length || 1);
    const posDiff = (curPos - prevPos).toFixed(1);

    const curCtr = (curClicks / (curImps || 1) * 100);
    const prevCtr = (prevClicks / (prevImps || 1) * 100);
    const ctrDiff = (curCtr - prevCtr).toFixed(1);

    return {
      clicks: { val: curClicks, diff: clickDiff, status: Number(clickDiff) >= 0 ? 'up' : 'down' },
      impressions: { val: curImps, diff: impDiff, status: Number(impDiff) >= 0 ? 'up' : 'down' },
      position: { val: curPos.toFixed(1), diff: posDiff, status: Number(posDiff) <= 0 ? 'up' : 'down' },
      ctr: { val: curCtr.toFixed(1), diff: ctrDiff, status: Number(ctrDiff) >= 0 ? 'up' : 'down' }
    };
  }, [data]);

  // Helper to get Monday of the week
  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(date.setDate(diff));
  };

  // Transform trend data for charts with Aggregation
  const trendChartData = useMemo(() => {
    if (!data?.trends) return [];
    
    // Grouping Logic
    const grouped: Record<string, any> = {};
    
    data.trends.forEach(t => {
      const d = new Date(t.keys![0]);
      let key = t.keys![0]; // Default daily
      
      if (aggregation === 'weekly') {
        const monday = getMonday(d);
        key = monday.toISOString().split('T')[0];
      } else if (aggregation === 'monthly') {
        key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-01`;
      }
      
      if (!grouped[key]) {
        grouped[key] = {
          date: key,
          clicks: 0,
          impressions: 0,
          position: 0,
          count: 0
        };
      }
      
      grouped[key].clicks += t.clicks;
      grouped[key].impressions += t.impressions;
      grouped[key].position += t.position;
      grouped[key].count += 1;
    });

    return Object.values(grouped).map(g => {
      const d = new Date(g.date);
      return {
        date: `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear().toString().slice(-2)}`,
        clicks: g.clicks,
        impressions: g.impressions,
        position: g.position / g.count,
        sortKey: g.date
      };
    }).sort((a,b) => a.sortKey.localeCompare(b.sortKey));
  }, [data, aggregation]);

  const clickSparklineData = useMemo(() => trendChartData.map(d => ({ val: d.clicks })), [trendChartData]);
  const impSparklineData = useMemo(() => trendChartData.map(d => ({ val: d.impressions })), [trendChartData]);
  const posSparklineData = useMemo(() => trendChartData.map(d => ({ val: d.position })), [trendChartData]);
  const ctrSparklineData = useMemo(() => trendChartData.map(d => ({ val: (d.clicks / (d.impressions || 1)) })), [trendChartData]);

  if (loading && !data) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent-orange/20 border-t-accent-orange rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted animate-pulse">
            Synchronizing Neural Search Data...
          </p>
        </div>
      </div>
    );
  }

  if (error === 'not_connected') {
    return (
       <div className="h-full flex items-center justify-center p-8">
        <div className="max-w-md w-full glass-card p-10 rounded-[3rem] border border-white/5 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center border mx-auto mb-4 bg-accent-orange/10 text-accent-orange border-accent-orange/20">
            <ShieldAlert size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase font-sans text-balance">
              CONNECTION REQUIRED
            </h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Google Search Console is not yet connected for this client workspace. Link your account to activate autonomous SEO monitoring.
            </p>
          </div>
          <button 
            onClick={() => window.location.href = `/crm/${clientId}`}
            className="w-full py-4 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] bg-accent-orange shadow-[0_10px_20px_rgba(255,77,0,0.2)]"
          >
            Connect Console in Integrations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background p-2 lg:p-8 flex flex-col gap-4 overflow-y-auto no-scrollbar animate-in fade-in duration-1000">
      
      {/* Header Area */}
      <div className="flex justify-between items-center px-2">
        <div className="space-y-1">
          <h1 className="text-xl font-black text-white tracking-tighter uppercase">Performance</h1>
        </div>

        <div className="flex items-center gap-4 relative">
          {/* Aggregation Type Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowAggDropdown(!showAggDropdown)}
              className="px-6 py-3 bg-[#13171F] rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-text-secondary border border-white/10 hover:border-white/20 transition-all shadow-2xl"
            >
              <BarChart3 size={14} className="text-accent-orange" />
              {aggregation}
              <ChevronDown size={14} className={`text-slate-600 transition-transform ${showAggDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showAggDropdown && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-[#13171F] p-2 rounded-3xl border border-white/10 z-[30] shadow-2xl animate-in fade-in slide-in-from-top-2">
                {(['daily', 'weekly', 'monthly'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => { setAggregation(mode); setShowAggDropdown(false); }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      aggregation === mode ? 'bg-accent-orange text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="px-6 py-3 bg-[#13171F] rounded-2xl flex items-center gap-3 text-xs font-black text-white border border-white/10 hover:border-white/20 transition-all shadow-2xl"
          >
            <Calendar size={14} className="text-accent-orange" />
            {dateRange === 'custom' ? `${customRange.start} - ${customRange.end}` : 
             dateRange === '1w' ? 'Last One Week' :
             dateRange === '30d' ? 'Last 30 Days' :
             'Last 3 Months'}
            <ChevronDown size={14} className="text-slate-600" />
          </button>

          {showDatePicker && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-[#13171F] p-4 rounded-3xl border border-white/10 z-50 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2">
              <div className="flex flex-col gap-1">
                {[
                  { id: '1w', label: 'Last One Week' },
                  { id: '30d', label: 'Last 30 Days' },
                  { id: '3m', label: 'Last 3 Months' },
                ].map(p => (
                  <button 
                    key={p.id}
                    onClick={() => { setDateRange(p.id); setShowDatePicker(false); }}
                    className={`text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      dateRange === p.id ? 'bg-accent-orange text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
                <div className="border-t border-white/5 my-2 pt-2 space-y-3">
                  <p className="text-[8px] font-black uppercase text-slate-600 px-4">Custom Range</p>
                  <div className="px-2 space-y-2">
                     <input 
                       type="date" 
                       className="w-full bg-white/5 border border-white/5 rounded-lg p-2 text-[10px] text-white outline-none focus:border-accent-orange transition-colors"
                       onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                     />
                     <input 
                       type="date" 
                       className="w-full bg-white/5 border border-white/5 rounded-lg p-2 text-[10px] text-white outline-none focus:border-accent-orange transition-colors"
                       onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                     />
                     <button 
                        onClick={() => {
                          if (customRange.start && customRange.end) {
                            setDateRange('custom');
                            setShowDatePicker(false);
                            fetchData(customRange.start, customRange.end);
                          }
                        }}
                        className="w-full py-2 bg-white/10 hover:bg-accent-orange text-white text-[10px] font-black uppercase rounded-lg transition-all"
                     >
                       Apply Custom
                     </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          label="Total Clicks" 
          value={stats?.clicks.val.toLocaleString()} 
          trend={stats?.clicks.status} 
          trendVal={`${stats?.clicks.diff}%`} 
          data={clickSparklineData} 
          color="orange" 
        />
        <KPICard 
          label="Impressions" 
          value={stats?.impressions.val.toLocaleString()} 
          trend={stats?.impressions.status} 
          trendVal={`${stats?.impressions.diff}%`} 
          data={impSparklineData} 
          color="blue" 
        />
        <KPICard 
          label="Avg. Position" 
          value={stats?.position.val} 
          trend={stats?.position.status} 
          trendVal={stats?.position.diff} 
          data={posSparklineData} 
          color="grey" 
        />
        <KPICard 
          label="CTR" 
          value={`${stats?.ctr.val}%`} 
          trend={stats?.ctr.status} 
          trendVal={`${stats?.ctr.diff}%`} 
          data={ctrSparklineData} 
          color="green" 
        />
      </div>

      {/* Charts & Insights Area */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Trend Area */}
        <div className="col-span-12 flex flex-col gap-6">
          
          {/* Unified Intelligence Trend Chart */}
          <div className="bg-[#13171F]/50 backdrop-blur-3xl p-6 lg:p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-accent-blue/10 blur-[100px] opacity-20 transition-all group-hover:bg-accent-orange/10 duration-1000" />
              
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-7 relative z-10 gap-4 mt-1">
                 <div className="space-y-1">
                    
                 </div>
                 
                 <div className="flex items-center gap-4 ">
                    <div className="flex items-center gap-2 group/legend">
                       <div className="w-2 h-2 rounded-full bg-accent-orange shadow-[0_0_8px_rgba(255,77,0,0.5)]" />
                       <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest group-hover/legend:text-white transition-colors">Clicks</span>
                    </div>
                    <div className="flex items-center gap-2 group/legend ">
                       <div className="w-2 h-2 rounded-full bg-accent-blue shadow-[0_0_8px_rgba(0,163,255,0.5)]" />
                       <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest group-hover/legend:text-white transition-colors">Impressions</span>
                    </div>
                 </div>
              </div>

              <div className="h-[240px] w-full relative z-10 ">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={trendChartData}>
                      <defs>
                        <linearGradient id="glow-orange" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF4D00" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#FF4D00" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="glow-blue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00A3FF" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#00A3FF" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#475569', fontSize: 9, fontWeight: 700 }} 
                        padding={{ left: 20, right: 20 }}
                        dy={10}
                        interval={aggregation === 'daily' ? "preserveStartEnd" : 0}
                        minTickGap={aggregation === 'daily' ? 40 : 0}
                      />
                      
                      {/* Left Axis: Clicks (Orange) */}
                      <YAxis 
                        yAxisId="left"
                        orientation="left"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#FF4D00', fontSize: 10, fontWeight: 900 }}
                        tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}
                      />
                      
                      {/* Right Axis: Impressions (Blue) */}
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#00A3FF', fontSize: 10, fontWeight: 900 }}
                        tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}
                      />
                      
                      <RechartsTooltip 
                        cursor={{ stroke: '#ffffff10', strokeWidth: 2 }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                             return (
                               <div className="bg-[#13171F] p-5 border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-3 backdrop-blur-xl">
                                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{payload[0].payload.date}</p>
                                 <div className="flex items-center justify-between gap-8">
                                    <div className="flex items-center gap-2">
                                       <div className="w-2 h-2 rounded-full bg-accent-orange shadow-[0_0_10px_rgba(255,77,0,0.5)]" />
                                       <span className="text-[10px] font-black text-white uppercase tracking-widest">Clicks</span>
                                    </div>
                                    <span className="text-sm font-black text-accent-orange italic">{payload[0].value.toLocaleString()}</span>
                                 </div>
                                 <div className="flex items-center justify-between gap-8">
                                    <div className="flex items-center gap-2">
                                       <div className="w-2 h-2 rounded-full bg-accent-blue shadow-[0_0_10px_rgba(0,163,255,0.5)]" />
                                       <span className="text-[10px] font-black text-white uppercase tracking-widest">Impressions</span>
                                    </div>
                                    <span className="text-sm font-black text-accent-blue italic">{payload[1]?.value.toLocaleString()}</span>
                                 </div>
                               </div>
                             );
                          }
                          return null;
                        }}
                      />
                      
                      {/* Clicks: Monotone Pulse */}
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="clicks" 
                        stroke="#FF4D00" 
                        strokeWidth={2} 
                        dot={{ r: 2, fill: '#FF4D00', strokeWidth: 1, stroke: '#13171F' }}
                        activeDot={{ r: 4, fill: '#fff', stroke: '#FF4D00', strokeWidth: 2 }}
                        animationDuration={1500}
                      />

                      {/* Impressions: Monotone Area */}
                      <Area 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="impressions" 
                        stroke="#00A3FF" 
                        strokeWidth={2} 
                        fillOpacity={1} 
                        fill="url(#glow-blue)" 
                        animationDuration={2000}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Keyword Performance Table */}
          <div className="bg-[#13171F]/50 p-6 rounded-[2rem] border border-white/5">
             <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-6">Keywords</h3>
             
             <div className="overflow-x-auto">
                <table className="w-full table-fixed text-left border-separate border-spacing-y-1.5">
                   <thead>
                      <tr className="text-slate-600">
                         {['Keyword', 'Rank', 'Clicks', 'Impressions', 'CTR'].map(t => (
                           <th key={t} className={`pb-4 text-[9px] font-black uppercase tracking-widest px-3 ${t === 'Keyword' ? 'w-[50%]' : 'w-[12.5%]'}`}>{t}</th>
                         ))}
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {data?.keywords.map((kw, i) => {
                        
                        return (
                          <tr key={i} className="group hover:bg-white/[0.02] transition-all">
                             <td className="py-1 px-3">
                                <span className="text-[13px] font-black font-semibold text-slate-300 group-hover:text-white transition-colors">{kw.keys?.[0]}</span>
                             </td>
                             <td className="py-1 px-3 text-center">
                                <div className={`w-7 h-7 flex items-center justify-center rounded-lg font-black text-[9px] ${
                                  kw.position <= 3 ? 'bg-accent-green/10 text-accent-green border border-accent-green/20' :
                                  kw.position < 10 ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20' :
                                  'bg-accent-red/10 text-accent-red border border-accent-red/20'
                                } shadow-xl`}>
                                   {kw.position.toFixed(0)}
                                </div>
                             </td>
                             <td className="py-1 px-3 text-[10px] font-black text-slate-400">{kw.clicks.toLocaleString()}</td>
                             <td className="py-1 px-3 text-[10px] font-black text-slate-400">{kw.impressions.toLocaleString()}</td>
                             <td className="py-1 px-3 text-[10px] font-black text-slate-400">{(kw.ctr * 100).toFixed(1)}%</td>
                          </tr>
                        );
                      })}
                   </tbody>
                </table>
             </div>
          </div>
        </div>

        {/* Sidebar Space Optimized for Future Intelligence Features */}
        <div className="hidden lg:col-span-3 flex-col gap-8">
           {/* Space intentionally reserved or hidden for full-width chart focus */}
        </div>

      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

    </div>
  );
}
