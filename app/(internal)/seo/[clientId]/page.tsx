"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
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
  ChevronLeft,
  ChevronRight,
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
  queries: GSCMetricRow[];
  pages: GSCMetricRow[];
  countries: GSCMetricRow[];
  devices: GSCMetricRow[];
  trends: GSCMetricRow[];
  prevQueries: GSCMetricRow[];
  prevPages: GSCMetricRow[];
  prevCountries: GSCMetricRow[];
  prevDevices: GSCMetricRow[];
  prevTrends: GSCMetricRow[];
  range: {
    startDate: string;
    endDate: string;
    prevStart: string;
    prevEnd: string;
  };
}

// --- Utils ---
const COUNTRY_MAP: Record<string, string> = {
  'AFG': 'Afghanistan', 'ALB': 'Albania', 'DZA': 'Algeria', 'AND': 'Andorra', 'AGO': 'Angola', 
  'ARG': 'Argentina', 'ARM': 'Armenia', 'AUS': 'Australia', 'AUT': 'Austria', 'AZE': 'Azerbaijan',
  'BHS': 'Bahamas', 'BHR': 'Bahrain', 'BGD': 'Bangladesh', 'BRB': 'Barbados', 'BLR': 'Belarus', 
  'BEL': 'Belgium', 'BLZ': 'Belize', 'BEN': 'Benin', 'BTN': 'Bhutan', 'BOL': 'Bolivia', 
  'BIH': 'Bosnia and Herzegovina', 'BWA': 'Botswana', 'BRA': 'Brazil', 'BRN': 'Brunei', 'BGR': 'Bulgaria', 
  'BFA': 'Burkina Faso', 'BDI': 'Burundi', 'KHM': 'Cambodia', 'CMR': 'Cameroon', 'CAN': 'Canada', 
  'CPV': 'Cape Verde', 'CAF': 'Central African Republic', 'TCD': 'Chad', 'CHL': 'Chile', 'CHN': 'China',
  'COL': 'Colombia', 'COM': 'Comoros', 'COG': 'Congo', 'COD': 'Congo (DRC)', 'CRI': 'Costa Rica', 
  'HRV': 'Croatia', 'CUB': 'Cuba', 'CYP': 'Cyprus', 'CZE': 'Czechia', 'DNK': 'Denmark', 
  'DJI': 'Djibouti', 'DMA': 'Dominica', 'DOM': 'Dominican Republic', 'ECU': 'Ecuador', 'EGY': 'Egypt', 
  'SLV': 'El Salvador', 'GNQ': 'Equatorial Guinea', 'ERI': 'Eritrea', 'EST': 'Estonia', 'SWZ': 'Eswatini', 
  'ETH': 'Ethiopia', 'FJI': 'Fiji', 'FIN': 'Finland', 'FRA': 'France', 'GAB': 'Gabon', 
  'GMB': 'Gambia', 'GEO': 'Georgia', 'DEU': 'Germany', 'GHA': 'Ghana', 'GRC': 'Greece', 
  'GRD': 'Grenada', 'GTM': 'Guatemala', 'GIN': 'Guinea', 'GNB': 'Guinea-Bissau', 'GUY': 'Guyana', 
  'HTI': 'Haiti', 'HND': 'Honduras', 'HUN': 'Hungary', 'ISL': 'Iceland', 'IND': 'India', 
  'IDN': 'Indonesia', 'IRN': 'Iran', 'IRQ': 'Iraq', 'IRL': 'Ireland', 'ISR': 'Israel', 
  'ITA': 'Italy', 'JAM': 'Jamaica', 'JPN': 'Japan', 'JOR': 'Jordan', 'KAZ': 'Kazakhstan', 
  'KEN': 'Kenya', 'KIR': 'Kiribati', 'KWT': 'Kuwait', 'KGZ': 'Kyrgyzstan', 'LAO': 'Laos', 
  'LVA': 'Latvia', 'LBN': 'Lebanon', 'LSO': 'Lesotho', 'LBR': 'Liberia', 'LBY': 'Libya', 
  'LIE': 'Liechtenstein', 'LTU': 'Lithuania', 'LUX': 'Luxembourg', 'MDG': 'Madagascar', 'MWI': 'Malawi',
  'MYS': 'Malaysia', 'MDV': 'Maldives', 'MLI': 'Mali', 'MLT': 'Malta', 'MHL': 'Marshall Islands', 
  'MRT': 'Mauritania', 'MUS': 'Mauritius', 'MEX': 'Mexico', 'FSM': 'Micronesia', 'MDA': 'Moldova', 
  'MCO': 'Monaco', 'MNG': 'Mongolia', 'MNE': 'Montenegro', 'MAR': 'Morocco', 'MOZ': 'Mozambique', 
  'MMR': 'Myanmar', 'NAM': 'Namibia', 'NRU': 'Nauru', 'NPL': 'Nepal', 'NLD': 'Netherlands', 
  'NZL': 'New Zealand', 'NIC': 'Nicaragua', 'NER': 'Niger', 'NGA': 'Nigeria', 'PRK': 'North Korea', 
  'MKD': 'North Macedonia', 'NOR': 'Norway', 'OMN': 'Oman', 'PAK': 'Pakistan', 'PLW': 'Palau', 
  'PAN': 'Panama', 'PNG': 'Papua New Guinea', 'PRY': 'Paraguay', 'PER': 'Peru', 'PHL': 'Philippines', 
  'POL': 'Poland', 'PRT': 'Portugal', 'QAT': 'Qatar', 'ROU': 'Romania', 'RUS': 'Russia', 
  'RWA': 'Rwanda', 'KNA': 'Saint Kitts and Nevis', 'LCA': 'Saint Lucia', 'VCG': 'Saint Vincent', 'WSM': 'Samoa',
  'SMR': 'San Marino', 'STP': 'Sao Tome and Principe', 'SAU': 'Saudi Arabia', 'SEN': 'Senegal', 'SRB': 'Serbia', 
  'SYC': 'Seychelles', 'SLE': 'Sierra Leone', 'SGP': 'Singapore', 'SVK': 'Slovakia', 'SVN': 'Slovenia', 
  'SLB': 'Solomon Islands', 'SOM': 'Somalia', 'ZAF': 'South Africa', 'KOR': 'South Korea', 'SSD': 'South Sudan', 
  'ESP': 'Spain', 'LKA': 'Sri Lanka', 'SDN': 'Sudan', 'SUR': 'Suriname', 'SWE': 'Sweden', 
  'CHE': 'Switzerland', 'SYR': 'Syria', 'TWN': 'Taiwan', 'TJK': 'Tajikistan', 'TZA': 'Tanzania', 
  'THA': 'Thailand', 'TLS': 'Timor-Leste', 'TGO': 'Togo', 'TON': 'Tonga', 'TTO': 'Trinidad and Tobago', 
  'TUN': 'Tunisia', 'TUR': 'Turkey', 'TKM': 'Turkmenistan', 'TUV': 'Tuvalu', 'UGA': 'Uganda', 
  'UKR': 'Ukraine', 'ARE': 'United Arab Emirates', 'GBR': 'United Kingdom', 'USA': 'United States', 'URY': 'Uruguay', 
  'UZB': 'Uzbekistan', 'VUT': 'Vanuatu', 'VAT': 'Vatican City', 'VEN': 'Venezuela', 'VNM': 'Vietnam', 
  'YEM': 'Yemen', 'ZMB': 'Zambia', 'ZWE': 'Zimbabwe', 'ZZZ': 'Unknown Region'
};

const getCountryName = (code: string) => {
  if (!code) return 'Unknown';
  const clean = code.toUpperCase().trim();
  return COUNTRY_MAP[clean] || clean;
};

const DeviceIcon = ({ type, size = 14 }: { type: string, size?: number }) => {
  const t = type.toLowerCase();
  if (t === 'mobile' || t === 'smartphone') return <Zap size={size} className="text-accent-orange" />;
  if (t === 'desktop') return <Globe size={size} className="text-accent-blue" />;
  if (t === 'tablet') return <BarChart3 size={size} className="text-accent-green" />;
  return <Search size={size} />;
};

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
    <div className={`p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] glass-card relative overflow-hidden group backdrop-blur-xl bg-surface-card`} 
         style={{ 
           borderColor: `${brandColor}40` 
         }}>
    {/* Subtle Glow Accent */}
    <div className="absolute -top-10 -right-10 w-24 h-24 blur-[40px] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity"
         style={{ backgroundColor: brandColor }} />
    
    <p className="text-[10px] font-bold text-text-muted mb-1 tracking-tight uppercase">{label}</p>
    <div className="flex items-center gap-2 mb-3 relative z-10">
      <h4 className="text-xl font-black text-text-primary tracking-tight">{value}</h4>
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
  const [activeTab, setActiveTab] = useState<'queries' | 'pages' | 'countries' | 'devices' | 'days'>('queries');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [showRowsDropdown, setShowRowsDropdown] = useState(false);

  const aggRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);

  // Click outside to close implementation
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (aggRef.current && !aggRef.current.contains(event.target as Node)) {
        setShowAggDropdown(false);
      }
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
      if (rowsRef.current && !rowsRef.current.contains(event.target as Node)) {
        setShowRowsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  useEffect(() => {
    setCurrentPage(0);
  }, [activeTab]);

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

    // Position is still best averaged from queries for focus on ranked terms
    const curPos = data.queries.reduce((a, b) => a + (b.position || 0), 0) / (data.queries.length || 1);
    const prevPos = data.prevQueries.reduce((a, b) => a + (b.position || 0), 0) / (data.prevQueries.length || 1);
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
        <div className="max-w-md w-full glass-card p-10 rounded-[2rem] border border-white/5 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center border mx-auto mb-4 bg-accent-orange/10 text-accent-orange border-accent-orange/20">
            <ShieldAlert size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-text-primary tracking-tight uppercase font-sans text-balance">
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
    <div className="h-full bg-background p-2 lg:p-8 flex flex-col gap-6 overflow-y-auto no-scrollbar animate-in fade-in duration-1000 relative">
      {/* Background Plasma Blobs for Glass Depth - Removed per user request */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      </div>

      <div className="relative z-10 flex flex-col gap-6">
      
      {/* Header Area */}
      <div className="flex justify-between items-center px-2 ">
        <div className="space-y-1">
          <h1 className="text-xl font-black text-text-primary tracking-tight uppercase italic">SEO Performance</h1>
        </div>

        <div className="flex items-center gap-4 relative">
          {/* Aggregation Type Dropdown */}
          <div className="relative" ref={aggRef}>
            <button 
              onClick={() => setShowAggDropdown(!showAggDropdown)}
              className="px-4 py-3 bg-surface-1 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-text-secondary border border-border-1 hover:border-white/20 transition-all shadow-md group"
            >
              <BarChart3 size={14} className="text-accent-orange" />
              {aggregation}
              <ChevronDown size={14} className={`text-slate-600 transition-transform ${showAggDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showAggDropdown && (
              <div className="absolute top-full right-0 mt-2 w-32 bg-surface-1/80 backdrop-blur-xl p-2 rounded-3xl border border-border-1 z-[30] shadow-2xl animate-in fade-in slide-in-from-top-2">
                {(['daily', 'weekly', 'monthly'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => { setAggregation(mode); setShowAggDropdown(false); }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      aggregation === mode ? 'bg-accent-orange text-white' : 'text-text-muted hover:bg-surface-2 hover:text-text-primary'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={dateRef}>
            <button 
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="px-4 py-3 bg-surface-1 rounded-2xl flex items-center gap-3 text-xs font-black text-text-primary border border-border-1 hover:border-white/20 transition-all shadow-md"
            >
              <Calendar size={14} className="text-accent-orange" />
              {dateRange === 'custom' ? `${customRange.start} - ${customRange.end}` : 
               dateRange === '1w' ? 'Last One Week' :
               dateRange === '30d' ? 'Last 30 Days' :
               'Last 3 Months'}
              <ChevronDown size={14} className="text-slate-600" />
            </button>

          {showDatePicker && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-surface-1/80 backdrop-blur-xl p-4 rounded-3xl border border-border-1 z-50 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2">
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
                      dateRange === p.id ? 'bg-accent-orange text-white' : 'text-text-muted hover:bg-surface-2 hover:text-text-primary'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
                <div className="border-t border-border-1 my-2 pt-2 space-y-3">
                  <p className="text-[8px] font-black uppercase text-text-muted px-4">Custom Range</p>
                  <div className="px-2 space-y-2">
                     <input 
                       type="date" 
                       className="w-full bg-surface-2 border border-border-1 rounded-lg p-2 text-[10px] text-text-primary outline-none focus:border-accent-orange transition-colors"
                       onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                     />
                     <input 
                       type="date" 
                       className="w-full bg-surface-2 border border-border-1 rounded-lg p-2 text-[10px] text-text-primary outline-none focus:border-accent-orange transition-colors"
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
                        className="w-full py-2 bg-surface-3 hover:bg-accent-orange text-text-primary hover:text-white text-[10px] font-black uppercase rounded-lg transition-all"
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
    </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <div className="glass-card p-6 lg:p-8 rounded-[2rem] border border-border-1 relative overflow-hidden group">
              {/* Card Background Glow Removed */}
              
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
                        cursor={{ stroke: 'rgba(var(--text-muted-rgb), 0.2)', strokeWidth: 2 }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                             return (
                               <div className="bg-surface-1/80 backdrop-blur-xl p-5 border border-border-1 rounded-xl shadow-2xl space-y-3 animate-in fade-in zoom-in duration-200">
                                 <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">{payload[0].payload.date}</p>
                                 <div className="flex items-center justify-between gap-8">
                                    <div className="flex items-center gap-2">
                                       <div className="w-1.5 h-1.5 rounded-full bg-accent-orange shadow-[0_0_10px_rgba(255,77,0,0.5)]" />
                                       <span className="text-[9px] font-black text-text-primary uppercase tracking-widest">Clicks</span>
                                    </div>
                                    <span className="text-[10px] font-black text-accent-orange">{payload[0].value.toLocaleString()}</span>
                                 </div>
                                 <div className="flex items-center justify-between gap-8">
                                    <div className="flex items-center gap-2">
                                       <div className="w-1.5 h-1.5 rounded-full bg-accent-blue shadow-[0_0_10px_rgba(0,163,255,0.5)]" />
                                       <span className="text-[9px] font-black text-text-primary uppercase tracking-widest">Impressions</span>
                                    </div>
                                    <span className="text-[10px] font-black text-accent-blue">{payload[1]?.value.toLocaleString()}</span>
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
          <div className="glass-card p-6 rounded-[2rem] border border-border-1">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 p-3">
                <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">Performance</h3>
                
                <div className="flex items-center p-1 bg-white/5 rounded-2xl border border-white/5 relative h-10">
                  {(['queries', 'pages', 'countries', 'devices', 'days'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`relative px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all duration-300 z-10 ${
                        activeTab === tab ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <span className="absolute inset-0 bg-accent-orange rounded-xl -z-10 shadow-[0_0_15px_rgba(255,77,0,0.3)] animate-in fade-in zoom-in duration-300" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
             
             <div className="overflow-x-auto">
                <table className="w-full table-fixed text-left border-separate border-spacing-y-1.5">
                   <thead>
                      <tr className="text-slate-600">
                         {[(activeTab === 'queries' ? 'Queries' : activeTab === 'pages' ? 'Page' : activeTab === 'countries' ? 'Country' : activeTab === 'devices' ? 'Device' : 'Date'), 'Rank', 'Clicks', 'Impressions', 'CTR'].map(t => (
                            <th key={t} className={`pb-4 text-[9px] font-black uppercase tracking-widest px-3 ${['Queries', 'Page', 'Country', 'Device', 'Date'].includes(t) ? 'w-[75%]' : 'w-[10%]'}`}>{t}</th>
                         ))}
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {(() => {
                        const rawData = data?.[activeTab === 'days' ? 'trends' : activeTab] || [];
                        // Sort by date descending if in 'days' tab
                        const sortedData = activeTab === 'days' 
                          ? [...rawData].sort((a,b) => (b.keys?.[0] || '').localeCompare(a.keys?.[0] || ''))
                          : rawData;

                        // Apply Pagination
                        const paginatedData = sortedData.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

                        return paginatedData.map((row, i) => {
                          let displayKey = row.keys?.[0] || 'Unknown';
                          
                          if (activeTab === 'days' && displayKey !== 'Unknown') {
                            const d = new Date(displayKey);
                            displayKey = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                          }

                          return (
                            <tr key={i} className="group hover:bg-white/[0.02] transition-all">
                               <td className="py-2 px-3">
                                  <div className="flex items-center gap-3">
                                     {activeTab === 'devices' && <DeviceIcon type={row.keys?.[0] || ''} />}
                                     <span className="text-[13px] font-semibold text-text-primary group-hover:text-accent-blue transition-colors truncate max-full block">
                                        {activeTab === 'countries' ? getCountryName(displayKey) : displayKey}
                                     </span>
                                  </div>
                               </td>
                             <td className="py-2 px-3 text-center">
                                <div className={`w-7 h-7 flex items-center justify-center rounded-lg font-black text-[9px] ${
                                  row.position <= 3 ? 'bg-accent-green/10 text-accent-green border border-accent-green/20' :
                                  row.position < 10 ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20' :
                                  'bg-accent-red/10 text-accent-red border border-accent-red/20'
                                } shadow-xl`}>
                                   {row.position.toFixed(0)}
                                </div>
                             </td>
                              <td className="py-2 px-3 text-[10px] font-black text-text-secondary">{row.clicks.toLocaleString()}</td>
                              <td className="py-2 px-3 text-[10px] font-black text-text-secondary">{row.impressions.toLocaleString()}</td>
                              <td className="py-2 px-3 text-[10px] font-black text-text-secondary">{(row.ctr * 100).toFixed(1)}%</td>
                          </tr>
                        );
                      })
                    })()}
                   </tbody>
                </table>
             </div>

             {/* Pagination Controls */}
             {data && (data[activeTab === 'days' ? 'trends' : activeTab]?.length || 0) > 0 && (
               <div className="mt-8 flex flex-col sm:flex-row items-center justify-end gap-6 px-4 py-4 border-t border-white/5">
                 <div className="flex items-center gap-3 relative" ref={rowsRef}>
                   <span className="text-[10px] font-black uppercase text-text-muted tracking-widest">Rows per page:</span>
                   <button 
                     onClick={() => setShowRowsDropdown(!showRowsDropdown)}
                     className="flex items-center gap-2 px-3 py-1.5 bg-surface-2 rounded-xl text-[11px] font-black text-text-primary hover:bg-surface-3 transition-all border border-border-1"
                   >
                     {rowsPerPage}
                     <ChevronDown size={14} className={`text-slate-500 transition-transform ${showRowsDropdown ? 'rotate-180' : ''}`} />
                   </button>

                   {showRowsDropdown && (
                     <div className="absolute bottom-full right-0 mb-2 w-20 bg-surface-1/80 backdrop-blur-xl border border-border-1 rounded-2xl p-1 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
                       {[10, 25, 50, 100].map(size => (
                         <button
                           key={size}
                           onClick={() => { setRowsPerPage(size); setCurrentPage(0); setShowRowsDropdown(false); }}
                           className={`w-full text-left px-4 py-2 rounded-xl text-[10px] font-black transition-all ${
                             rowsPerPage === size ? 'bg-accent-orange text-white' : 'text-text-muted hover:bg-surface-2 hover:text-text-primary'
                           }`}
                         >
                           {size}
                         </button>
                       ))}
                     </div>
                   )}
                 </div>

                 <div className="flex items-center gap-6">
                   <span className="text-[10px] font-black uppercase text-text-muted tracking-widest tabular-nums ">
                     {Math.min(currentPage * rowsPerPage + 1, (data[activeTab === 'days' ? 'trends' : activeTab]?.length || 0))} - {Math.min((currentPage + 1) * rowsPerPage, (data[activeTab === 'days' ? 'trends' : activeTab]?.length || 0))} 
                     <span className="text-text-muted mx-1">of</span> 
                     {(data[activeTab === 'days' ? 'trends' : activeTab]?.length || 0)}
                   </span>

                   <div className="flex items-center gap-2">
                     <button 
                       disabled={currentPage === 0}
                       onClick={() => setCurrentPage(p => p - 1)}
                       className="p-2 bg-surface-2 rounded-xl text-text-primary disabled:opacity-20 disabled:cursor-not-allowed hover:bg-surface-3 transition-all border border-border-1"
                     >
                       <ChevronLeft size={16} />
                     </button>
                     <button 
                       disabled={(currentPage + 1) * rowsPerPage >= (data[activeTab === 'days' ? 'trends' : activeTab]?.length || 0)}
                       onClick={() => setCurrentPage(p => p + 1)}
                       className="p-2 bg-surface-2 rounded-xl text-text-primary disabled:opacity-20 disabled:cursor-not-allowed hover:bg-surface-3 transition-all border border-border-1"
                     >
                       <ChevronRight size={16} />
                     </button>
                   </div>
                 </div>
               </div>
             )}
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
    </div>
  );
}
