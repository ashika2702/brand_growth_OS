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

const KPICard = ({ label, value, trend, trendVal, data, color, isCompare, prevValue, isVisible, onToggle, metricKey }: any) => {
  const brandColor = color === 'orange' ? '#fe4e02' : color === 'blue' ? '#00a3ff' : color === 'green' ? '#4cda87' : color === 'yellow' ? '#ffd700' : '#94A3B8';
  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] glass-card relative overflow-hidden group backdrop-blur-xl bg-surface-card flex flex-col`} 
         style={{ 
           borderColor: isVisible ? `${brandColor}80` : `${brandColor}10`,
           opacity: isVisible ? 1 : 0.7
         }}>
    
    <div className="flex justify-between items-start mb-1">
      <p className="text-[10px] font-bold text-text-muted tracking-tight uppercase">{label}</p>
      <input 
        type="checkbox" 
        checked={isVisible} 
        onChange={() => onToggle(metricKey)}
        className="w-3 h-3 rounded bg-surface-2 border-border-1 text-accent-blue focus:ring-0 cursor-pointer accent-accent-blue"
      />
    </div>

    <div className="flex flex-col gap-0.5 relative z-10">
      <div className="flex items-center gap-2">
        <h4 className="text-xl font-black text-text-primary tracking-tight">{value}</h4>
        {!isCompare && trend && (
          <span className={`text-[11px] font-bold ${trend === 'up' ? 'text-accent-green' : 'text-accent-red'}`}>
            {trend === 'up' ? '+' : '-'}{trendVal}
          </span>
        )}
      </div>
      {isCompare && (
        <div className="flex items-center gap-2 opacity-60">
          <span className="text-sm font-bold text-text-secondary">{prevValue}</span>
          <span className="text-[8px] font-bold text-text-muted uppercase tracking-widest">Prev. Period</span>
        </div>
      )}
    </div>

    <div className="mt-4 relative z-10 h-10">
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
  const [customCompareRange, setCustomCompareRange] = useState({ start: '', end: '' });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [aggregation, setAggregation] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [showAggDropdown, setShowAggDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'queries' | 'pages' | 'countries' | 'devices' | 'days'>('queries');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [showRowsDropdown, setShowRowsDropdown] = useState(false);
  
  // Comparison & Visibility State
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [visibleMetrics, setVisibleMetrics] = useState<string[]>(['clicks', 'impressions']);
  const [pickerTab, setPickerTab] = useState<'filter' | 'compare'>('filter');

  const toggleMetric = (metric: string) => {
    setVisibleMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric) 
        : [...prev, metric]
    );
  };

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
  const fetchData = useCallback(async (start?: string, end?: string, prevStart?: string, prevEnd?: string) => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/seo/${clientId}/performance`;
      const params = new URLSearchParams();
      if (start && end) {
        params.append('startDate', start);
        params.append('endDate', end);
      }
      if (prevStart && prevEnd) {
        params.append('prevStartDate', prevStart);
        params.append('prevEndDate', prevEnd);
      }
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
      
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
        const isYoY = dateRange.endsWith('-yoy');
        const cleanRange = dateRange.replace('-yoy', '');

        if (cleanRange === '1w') start.setDate(start.getDate() - 6);
        else if (cleanRange === '30d') start.setDate(start.getDate() - 27);
        else if (cleanRange === '3m') start.setMonth(start.getMonth() - 3);
        else if (cleanRange === '6m') start.setMonth(start.getMonth() - 6);
        else if (cleanRange === '12m') start.setMonth(start.getMonth() - 12);
        else if (cleanRange === '15m') start.setMonth(start.getMonth() - 15);
        
        const startDate = start.toISOString().split('T')[0];

        if (isCompareMode) {
          if (isYoY) {
            // Year Over Year: Same dates but 1 year ago
            const pStart = new Date(start.getTime());
            pStart.setFullYear(pStart.getFullYear() - 1);
            const pEnd = new Date(baseDate.getTime());
            pEnd.setFullYear(pEnd.getFullYear() - 1);
            fetchData(startDate, endDate, pStart.toISOString().split('T')[0], pEnd.toISOString().split('T')[0]);
          } else {
            // Previous Period: Immediately preceding dates
            const duration = baseDate.getTime() - start.getTime();
            const pEnd = new Date(start.getTime() - 1000 * 60 * 60 * 24);
            const pStart = new Date(pEnd.getTime() - duration);
            fetchData(startDate, endDate, pStart.toISOString().split('T')[0], pEnd.toISOString().split('T')[0]);
          }
        } else {
          fetchData(startDate, endDate);
        }
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

    const curTotalImps = data.trends.reduce((a, b) => a + (b.impressions || 0), 0);
    const curPos = curTotalImps > 0 
      ? data.trends.reduce((a, b) => a + (b.position * (b.impressions || 0)), 0) / curTotalImps
      : 0;
    
    const prevTotalImps = data.prevTrends.reduce((a, b) => a + (b.impressions || 0), 0);
    const prevPos = prevTotalImps > 0
      ? data.prevTrends.reduce((a, b) => a + (b.position * (b.impressions || 0)), 0) / prevTotalImps
      : 0;
    
    const posDiff = (curPos - prevPos).toFixed(1);

    const curCtr = (curClicks / (curImps || 1) * 100);
    const prevCtr = (prevClicks / (prevImps || 1) * 100);
    const ctrDiff = (curCtr - prevCtr).toFixed(1);

    return {
      clicks: { val: curClicks, prevVal: prevClicks, diff: clickDiff, status: Number(clickDiff) >= 0 ? 'up' : 'down' },
      impressions: { val: curImps, prevVal: prevImps, diff: impDiff, status: Number(impDiff) >= 0 ? 'up' : 'down' },
      position: { val: curPos, prevVal: prevPos, diff: posDiff, status: Number(posDiff) <= 0 ? 'up' : 'down' },
      ctr: { val: curCtr, prevVal: prevCtr, diff: ctrDiff, status: Number(ctrDiff) >= 0 ? 'up' : 'down' }
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
    
    // 1. Group Current Data
    const currentGrouped: Record<string, any> = {};
    data.trends.forEach(t => {
      const d = new Date(t.keys![0]);
      let key = t.keys![0];
      if (aggregation === 'weekly') key = getMonday(d).toISOString().split('T')[0];
      else if (aggregation === 'monthly') key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-01`;
      
      if (!currentGrouped[key]) currentGrouped[key] = { clicks: 0, impressions: 0, position: 0, count: 0, date: key };
      currentGrouped[key].clicks += t.clicks;
      currentGrouped[key].impressions += t.impressions;
      currentGrouped[key].position += t.position;
      currentGrouped[key].count += 1;
    });

    const currentSorted = Object.values(currentGrouped).sort((a: any, b: any) => a.date.localeCompare(b.date));

    // 2. Group Previous Data (if comparing)
    const prevGrouped: Record<string, any> = {};
    if (isCompareMode && data.prevTrends) {
      data.prevTrends.forEach(t => {
        const d = new Date(t.keys![0]);
        let key = t.keys![0];
        if (aggregation === 'weekly') key = getMonday(d).toISOString().split('T')[0];
        else if (aggregation === 'monthly') key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-01`;
        
        if (!prevGrouped[key]) prevGrouped[key] = { clicks: 0, impressions: 0, position: 0, count: 0, date: key };
        prevGrouped[key].clicks += t.clicks;
        prevGrouped[key].impressions += t.impressions;
        prevGrouped[key].position += t.position;
        prevGrouped[key].count += 1;
      });
    }

    const prevSorted = Object.values(prevGrouped).sort((a: any, b: any) => a.date.localeCompare(b.date));

    // 3. Create a unified map based on EXACT date matching
    const merged = [];
    
    // Create a quick lookup map for previous data
    const prevMap = prevGrouped; 

    for (let i = 0; i < currentSorted.length; i++) {
      const curr = currentSorted[i];
      const currD = new Date(curr.date);
      
      // Determine the exact date we want to compare against
      let prevKey = '';
      let prevFormatted = '';
      const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };

      if (isCompareMode) {
        if (dateRange.endsWith('-yoy')) {
          // YEAR OVER YEAR: Match exact same month/day from 1 year ago
          const targetD = new Date(currD.getTime());
          targetD.setFullYear(targetD.getFullYear() - 1);
          prevKey = targetD.toISOString().split('T')[0];
          prevFormatted = targetD.toLocaleDateString('en-US', options);
        } else {
          // PREVIOUS PERIOD: Match by index from the sorted previous list
          // This remains the best way for non-YoY (e.g. 7 days vs previous 7 days)
          const prevItem = prevSorted[i];
          if (prevItem) {
            prevKey = prevItem.date;
            const pd = new Date(prevItem.date);
            prevFormatted = pd.toLocaleDateString('en-US', options);
          }
        }
      }

      // Lookup the actual data for that date
      const prev = prevKey ? prevMap[prevKey] : null;
      
      const currFormatted = currD.toLocaleDateString('en-US', options);
      const dateLabel = `${currD.getMonth() + 1}/${currD.getDate()}`;

      merged.push({
        day: i + 1,
        date: dateLabel,
        currFormatted,
        prevFormatted,
        fullDate: curr.date,
        prevFullDate: prevKey,
        clicks: curr.clicks || 0,
        impressions: curr.impressions || 0,
        position: curr.position / curr.count,
        ctr: (curr.clicks / (curr.impressions || 1)) * 100,
        
        prevClicks: prev?.clicks || 0,
        prevImpressions: prev?.impressions || 0,
        prevPosition: prev ? prev.position / prev.count : 0,
        prevCtr: prev ? (prev.clicks / (prev.impressions || 1)) * 100 : 0,
      });
    }

    return merged;
  }, [data, aggregation, isCompareMode]);

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
              {isCompareMode ? 'Compare ' : ''}
              {dateRange === 'custom' ? `${customRange.start} - ${customRange.end}` : 
               dateRange.startsWith('1w') ? 'Last 7 Days' :
               dateRange.startsWith('30d') ? 'Last 28 Days' :
               dateRange.startsWith('3m') ? 'Last 3 Months' :
               dateRange.startsWith('6m') ? 'Last 6 Months' :
               dateRange.startsWith('12m') ? 'Last 12 Months' :
               'Select Date'}
              {dateRange.endsWith('-yoy') ? ' (YoY)' : ''}
              <ChevronDown size={14} className="text-slate-600" />
            </button>

           {showDatePicker && (
            <div className="absolute top-full right-0 mt-2 w-[320px] bg-surface-1/90 backdrop-blur-2xl p-0 rounded-[2rem] border border-border-1 z-[60] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-top-4 duration-300">
              {/* Tab Header */}
              <div className="flex border-b border-white/5 bg-white/2">
                <button 
                  onClick={() => setPickerTab('filter')}
                  className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
                    pickerTab === 'filter' ? 'text-accent-orange' : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  Filter
                  {pickerTab === 'filter' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-orange shadow-[0_0_10px_rgba(255,77,0,0.5)]" />}
                </button>
                <button 
                  onClick={() => setPickerTab('compare')}
                  className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
                    pickerTab === 'compare' ? 'text-accent-orange' : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  Compare
                  {pickerTab === 'compare' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-orange shadow-[0_0_10px_rgba(255,77,0,0.5)]" />}
                </button>
              </div>

              {/* Content Area */}
              <div className="p-5 max-h-[350px] overflow-y-auto no-scrollbar">
                {pickerTab === 'filter' ? (
                  <div className="flex flex-col gap-1">
                    {[
                      { id: '1w', label: 'Last 7 Days' },
                      { id: '30d', label: 'Last 28 Days' },
                      { id: '3m', label: 'Last 3 Months' },
                      { id: '6m', label: 'Last 6 Months' },
                      { id: '12m', label: 'Last 12 Months' },
                      { id: '15m', label: 'Last 15 Months' },
                    ].map(p => (
                      <button 
                        key={p.id}
                        onClick={() => { setDateRange(p.id); setIsCompareMode(false); setShowDatePicker(false); }}
                        className={`text-left px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex justify-between items-center ${
                          dateRange === p.id && !isCompareMode ? 'bg-accent-orange text-white' : 'text-text-muted hover:bg-surface-2 hover:text-text-primary'
                        }`}
                      >
                        {p.label}
                        {dateRange === p.id && !isCompareMode && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />}
                      </button>
                    ))}
                    <div className="border-t border-white/5 my-3 pt-3 space-y-4">
                      <p className="text-[9px] font-black uppercase text-text-muted px-2 tracking-widest">Custom Selection</p>
                      <div className="space-y-2">
                         <div className="flex flex-col gap-1 px-1">
                           <span className="text-[8px] font-black text-text-muted uppercase tracking-widest pl-1">Start Date</span>
                           <input 
                             type="date" 
                             className="w-full bg-surface-2 border border-border-1 rounded-xl p-3 text-[10px] text-text-primary outline-none focus:border-accent-orange transition-colors"
                             value={customRange.start}
                             onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                           />
                         </div>
                         <div className="flex flex-col gap-1 px-1">
                           <span className="text-[8px] font-black text-text-muted uppercase tracking-widest pl-1">End Date</span>
                           <input 
                             type="date" 
                             className="w-full bg-surface-2 border border-border-1 rounded-xl p-3 text-[10px] text-text-primary outline-none focus:border-accent-orange transition-colors"
                             value={customRange.end}
                             onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                           />
                         </div>
                         <button 
                            onClick={() => {
                              if (customRange.start && customRange.end) {
                                setDateRange('custom');
                                setIsCompareMode(false);
                                setShowDatePicker(false);
                                fetchData(customRange.start, customRange.end);
                              }
                            }}
                            className="w-full mt-2 py-3.5 bg-accent-orange/10 hover:bg-accent-orange text-accent-orange hover:text-white text-[10px] font-black uppercase rounded-2xl transition-all border border-accent-orange/20"
                         >
                           Apply Filter
                         </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {[
                      { id: '1w', label: 'Compare Last 7 Days to Previous Period' },
                      { id: '1w-yoy', label: 'Compare Last 7 Days Year Over Year' },
                      { id: '30d', label: 'Compare Last 28 Days to Previous Period' },
                      { id: '30d-yoy', label: 'Compare Last 28 Days Year Over Year' },
                      { id: '3m', label: 'Compare Last 3 Months to Previous Period' },
                      { id: '3m-yoy', label: 'Compare Last 3 Months Year Over Year' },
                      { id: '6m', label: 'Compare Last 6 Months to Previous Period' },
                    ].map(p => (
                      <button 
                        key={p.id}
                        onClick={() => { setDateRange(p.id); setIsCompareMode(true); setShowDatePicker(false); }}
                        className={`text-left px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex justify-between items-center ${
                          dateRange === p.id && isCompareMode ? 'bg-accent-orange text-white shadow-lg' : 'text-text-muted hover:bg-surface-2 hover:text-text-primary'
                        }`}
                      >
                        <span className="max-w-[80%] leading-relaxed">{p.label}</span>
                        {dateRange === p.id && isCompareMode && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />}
                      </button>
                    ))}
                    
                    {/* Custom Comparison Section */}
                    <div className="border-t border-white/5 my-3 pt-3 space-y-4">
                      <p className="text-[9px] font-black uppercase text-text-muted px-2 tracking-widest">Custom Comparison</p>
                      
                      <div className="space-y-4">
                        {/* Primary Range */}
                        <div className="space-y-2">
                           <p className="text-[7px] font-bold text-accent-orange uppercase tracking-[0.2em] px-1">Primary Period</p>
                           <div className="grid grid-cols-2 gap-2 px-1">
                             <div className="flex flex-col gap-1">
                               <span className="text-[8px] font-black text-text-muted uppercase tracking-widest pl-1">Start</span>
                               <input 
                                 type="date" 
                                 className="w-full bg-surface-2 border border-border-1 rounded-xl p-2.5 text-[9px] text-text-primary outline-none focus:border-accent-orange transition-colors"
                                 value={customRange.start}
                                 onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                               />
                             </div>
                             <div className="flex flex-col gap-1">
                               <span className="text-[8px] font-black text-text-muted uppercase tracking-widest pl-1">End</span>
                               <input 
                                 type="date" 
                                 className="w-full bg-surface-2 border border-border-1 rounded-xl p-2.5 text-[9px] text-text-primary outline-none focus:border-accent-orange transition-colors"
                                 value={customRange.end}
                                 onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                               />
                             </div>
                           </div>
                        </div>

                        <div className="flex justify-center py-1">
                          <div className="h-px w-8 bg-white/10 relative">
                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-1 px-2 text-[8px] font-black text-text-muted uppercase">vs</span>
                          </div>
                        </div>

                        {/* Comparison Range */}
                        <div className="space-y-2">
                           <p className="text-[7px] font-bold text-accent-orange/60 uppercase tracking-[0.2em] px-1">Compare To</p>
                           <div className="grid grid-cols-2 gap-2 px-1">
                             <div className="flex flex-col gap-1">
                               <span className="text-[8px] font-black text-text-muted uppercase tracking-widest pl-1">Start</span>
                               <input 
                                 type="date" 
                                 className="w-full bg-surface-2 border border-border-1 rounded-xl p-2.5 text-[9px] text-text-primary outline-none focus:border-accent-orange transition-colors"
                                 value={customCompareRange.start}
                                 onChange={(e) => setCustomCompareRange(prev => ({ ...prev, start: e.target.value }))}
                               />
                             </div>
                             <div className="flex flex-col gap-1">
                               <span className="text-[8px] font-black text-text-muted uppercase tracking-widest pl-1">End</span>
                               <input 
                                 type="date" 
                                 className="w-full bg-surface-2 border border-border-1 rounded-xl p-2.5 text-[9px] text-text-primary outline-none focus:border-accent-orange transition-colors"
                                 value={customCompareRange.end}
                                 onChange={(e) => setCustomCompareRange(prev => ({ ...prev, end: e.target.value }))}
                               />
                             </div>
                           </div>
                        </div>

                        <button 
                           onClick={() => {
                             if (customRange.start && customRange.end && customCompareRange.start && customCompareRange.end) {
                               setDateRange('custom');
                               setIsCompareMode(true);
                               setShowDatePicker(false);
                               fetchData(customRange.start, customRange.end, customCompareRange.start, customCompareRange.end);
                             }
                           }}
                           className="w-full py-3 bg-accent-orange text-white text-[10px] font-black uppercase rounded-2xl shadow-[0_4px_20px_rgba(255,77,0,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                          Apply Custom Comparison
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="p-4 border-t border-white/5 bg-white/2 flex gap-3">
                <button 
                  onClick={() => setShowDatePicker(false)}
                  className="flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-text-muted hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setShowDatePicker(false)}
                  className="flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest bg-accent-orange text-white shadow-[0_0_15px_rgba(255,77,0,0.3)]"
                >
                  Done
                </button>
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
          color="blue"
          isCompare={isCompareMode}
          prevValue={stats?.clicks.prevVal?.toLocaleString()}
          isVisible={visibleMetrics.includes('clicks')}
          onToggle={toggleMetric}
          metricKey="clicks"
        />
        <KPICard 
          label="Total Impressions" 
          value={stats?.impressions.val.toLocaleString()} 
          trend={stats?.impressions.status} 
          trendVal={`${stats?.impressions.diff}%`} 
          data={impSparklineData} 
          color="orange"
          isCompare={isCompareMode}
          prevValue={stats?.impressions.prevVal?.toLocaleString()}
          isVisible={visibleMetrics.includes('impressions')}
          onToggle={toggleMetric}
          metricKey="impressions"
        />
        <KPICard 
          label="Average CTR" 
          value={`${stats?.ctr?.val ? Number(stats.ctr.val).toFixed(1) : '0.0'}%`} 
          trend={stats?.ctr.status} 
          trendVal={`${stats?.ctr.diff}%`} 
          data={ctrSparklineData} 
          color="green"
          isCompare={isCompareMode}
          prevValue={`${stats?.ctr.prevVal?.toFixed(1)}%`}
          isVisible={visibleMetrics.includes('ctr')}
          onToggle={toggleMetric}
          metricKey="ctr"
        />
        <KPICard 
          label="Average Position" 
          value={stats?.position?.val ? Number(stats.position.val).toFixed(1) : '0.0'} 
          trend={stats?.position.status} 
          trendVal={stats?.position.diff} 
          data={posSparklineData} 
          color="yellow"
          isCompare={isCompareMode}
          prevValue={stats?.position.prevVal?.toFixed(1)}
          isVisible={visibleMetrics.includes('position')}
          onToggle={toggleMetric}
          metricKey="position"
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
                  <div className="flex flex-wrap items-center gap-4">
                    {visibleMetrics.includes('clicks') && (
                      <div className="flex items-center gap-2 group/legend">
                        <div className="w-2 h-2 rounded-full bg-[#00a3ff] shadow-[0_0_8px_rgba(0,163,255,0.5)]" />
                        <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest group-hover/legend:text-white transition-colors">Clicks</span>
                      </div>
                    )}
                    {visibleMetrics.includes('impressions') && (
                      <div className="flex items-center gap-2 group/legend ">
                        <div className="w-2 h-2 rounded-full bg-[#fe4e02] shadow-[0_0_8px_rgba(254,78,2,0.5)]" />
                        <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest group-hover/legend:text-white transition-colors">Impressions</span>
                      </div>
                    )}
                    {visibleMetrics.includes('ctr') && (
                      <div className="flex items-center gap-2 group/legend ">
                        <div className="w-2 h-2 rounded-full bg-[#4cda87] shadow-[0_0_8px_rgba(76,218,135,0.5)]" />
                        <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest group-hover/legend:text-white transition-colors">CTR</span>
                      </div>
                    )}
                    {visibleMetrics.includes('position') && (
                      <div className="flex items-center gap-2 group/legend ">
                        <div className="w-2 h-2 rounded-full bg-[#ffd700] shadow-[0_0_8px_rgba(255,215,0,0.5)]" />
                        <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest group-hover/legend:text-white transition-colors">Position</span>
                      </div>
                    )}
                  </div>
                 </div>
              </div>

              <div className="h-[240px] w-full relative z-10 ">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={trendChartData}>
                      <defs>
                        <linearGradient id="glow-clicks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00a3ff" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#00a3ff" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="glow-impressions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#fe4e02" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#fe4e02" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="glow-ctr" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4cda87" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#4cda87" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="glow-position" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ffd700" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#ffd700" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      
                      <XAxis 
                        dataKey={isCompareMode ? "day" : "date"} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#475569', fontSize: 9, fontWeight: 700 }} 
                        padding={{ left: 20, right: 20 }}
                        dy={10}
                        interval={aggregation === 'daily' ? "preserveStartEnd" : 0}
                        minTickGap={aggregation === 'daily' ? 40 : 0}
                      />
                      
                      {/* Dynamic Y-Axes Logic */}
                      {(() => {
                        const visibleCount = visibleMetrics.length;
                        return (
                          <>
                            {/* Clicks Axis */}
                            {visibleMetrics.includes('clicks') && (
                              <YAxis 
                                yAxisId="clicks"
                                orientation={visibleMetrics.indexOf('clicks') === 0 ? "left" : "right"}
                                hide={visibleCount >= 3}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#00a3ff', fontSize: 10, fontWeight: 900 }}
                                tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}
                              />
                            )}
                            
                            {/* Impressions Axis */}
                            {visibleMetrics.includes('impressions') && (
                              <YAxis 
                                yAxisId="impressions"
                                orientation={visibleMetrics.indexOf('impressions') === 0 ? "left" : "right"}
                                hide={visibleCount >= 3}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#fe4e02', fontSize: 10, fontWeight: 900 }}
                                tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}
                              />
                            )}

                            {/* CTR Axis */}
                            {visibleMetrics.includes('ctr') && (
                              <YAxis 
                                yAxisId="ctr"
                                orientation={visibleMetrics.indexOf('ctr') === 0 ? "left" : "right"}
                                hide={visibleCount >= 3}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#4cda87', fontSize: 10, fontWeight: 900 }}
                                tickFormatter={(v) => `${Number(v).toFixed(1)}%`}
                              />
                            )}

                            {/* Position Axis */}
                            {visibleMetrics.includes('position') && (
                              <YAxis 
                                yAxisId="position"
                                orientation={visibleMetrics.indexOf('position') === 0 ? "left" : "right"}
                                hide={visibleCount >= 3}
                                reversed={true}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#ffd700', fontSize: 10, fontWeight: 900 }}
                                domain={[1, 'auto']}
                                tickCount={6}
                                allowDecimals={false}
                              />
                            )}
                          </>
                        );
                      })()}
                      
                      <RechartsTooltip 
                        cursor={{ stroke: 'rgba(var(--text-muted-rgb), 0.2)', strokeWidth: 2 }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                             const data = payload[0].payload;
                             return (
                               <div className="bg-surface-1/80 backdrop-blur-xl p-5 border border-border-1 rounded-xl shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200 min-w-[200px]">
                                  <div className="flex flex-col border-b border-white/5 pb-2">
                                    <p className="text-[9px] font-black text-text-primary uppercase tracking-[0.2em]">
                                      {isCompareMode ? `Day ${data.day}` : data.currFormatted}
                                    </p>
                                  </div>
                                  
                                  <div className="space-y-4">
                                    {visibleMetrics.map(m => {
                                       const curVal = data[m];
                                       const prevVal = data[`prev${m.charAt(0).toUpperCase() + m.slice(1)}`];
                                       const color = m === 'clicks' ? '#00a3ff' : m === 'impressions' ? '#fe4e02' : m === 'ctr' ? '#4cda87' : '#ffd700';
                                       const label = m === 'clicks' ? 'Clicks' : m === 'impressions' ? 'Impressions' : m === 'ctr' ? 'CTR' : 'Position';
                                       
                                       return (
                                         <div key={m} className="space-y-2">
                                            {/* Current Row */}
                                            <div className="flex items-center justify-between gap-8">
                                               <div className="flex items-center gap-2">
                                                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}80` }} />
                                                  <span className="text-[9px] font-black text-text-primary uppercase tracking-widest">
                                                    {label}{isCompareMode ? `: ${data.currFormatted}` : ''}
                                                  </span>
                                               </div>
                                               <span className="text-[11px] font-black" style={{ color }}>
                                                 {typeof curVal === 'number' ? (m === 'ctr' || m === 'position' ? curVal.toFixed(1) : curVal.toLocaleString()) : curVal}
                                                 {m === 'ctr' ? '%' : ''}
                                               </span>
                                            </div>
                                            
                                            {/* Previous Row */}
                                            {isCompareMode && (
                                               <div className="flex items-center justify-between gap-8 pl-3.5">
                                                  <div className="flex items-center gap-2 opacity-50">
                                                     <div className="w-1.5 h-1.5 rounded-full border border-dashed" style={{ borderColor: color }} />
                                                     <span className="text-[8px] font-bold text-text-muted uppercase tracking-widest">
                                                       {label}: {data.prevFormatted}
                                                     </span>
                                                  </div>
                                                  <span className="text-[10px] font-bold text-text-secondary opacity-80">
                                                    {typeof prevVal === 'number' ? (m === 'ctr' || m === 'position' ? prevVal.toFixed(1) : prevVal.toLocaleString()) : prevVal}
                                                    {m === 'ctr' ? '%' : ''}
                                                  </span>
                                               </div>
                                            )}
                                         </div>
                                       );
                                    })}
                                  </div>
                               </div>
                             );
                          }
                          return null;
                        }}
                      />
                      
                       {/* Current Clicks */}
                       {visibleMetrics.includes('clicks') && (
                        <Area 
                          yAxisId="clicks"
                          type="monotone" 
                          dataKey="clicks" 
                          stroke="#00a3ff" 
                          strokeWidth={2} 
                          fillOpacity={1} 
                          fill="url(#glow-clicks)" 
                          dot={false}
                          animationDuration={2000}
                        />
                       )}

                       {/* Previous Clicks */}
                       {isCompareMode && visibleMetrics.includes('clicks') && (
                        <Line 
                          yAxisId="clicks"
                          type="monotone" 
                          dataKey="prevClicks" 
                          stroke="#00a3ff" 
                          strokeWidth={2} 
                          strokeDasharray="5 5"
                          opacity={0.4}
                          dot={false}
                          animationDuration={2000}
                        />
                         )}

                       {/* Current Impressions */}
                       {visibleMetrics.includes('impressions') && (
                        <Area 
                          yAxisId="impressions"
                          type="monotone" 
                          dataKey="impressions" 
                          stroke="#fe4e02" 
                          strokeWidth={2} 
                          fillOpacity={1} 
                          fill="url(#glow-impressions)" 
                          dot={false}
                          animationDuration={2000}
                        />
                       )}

                       {/* Previous Impressions */}
                       {isCompareMode && visibleMetrics.includes('impressions') && (
                        <Line 
                          yAxisId="impressions"
                          type="monotone" 
                          dataKey="prevImpressions" 
                          stroke="#fe4e02" 
                          strokeWidth={2} 
                          strokeDasharray="5 5"
                          opacity={0.4}
                          dot={false}
                          animationDuration={2000}
                        />
                       )}

                       {/* Current CTR */}
                       {visibleMetrics.includes('ctr') && (
                        <Line 
                          yAxisId="ctr"
                          type="monotone" 
                          dataKey="ctr" 
                          stroke="#4cda87" 
                          strokeWidth={2} 
                          dot={false}
                          animationDuration={1500}
                        />
                       )}

                       {/* Previous CTR */}
                       {isCompareMode && visibleMetrics.includes('ctr') && (
                        <Line 
                          yAxisId="ctr"
                          type="monotone" 
                          dataKey="prevCtr" 
                          stroke="#4cda87" 
                          strokeWidth={2} 
                          strokeDasharray="5 5"
                          opacity={0.4}
                          dot={false}
                          animationDuration={1500}
                        />
                       )}

                       {/* Current Position */}
                       {visibleMetrics.includes('position') && (
                        <Line 
                          yAxisId="position"
                          type="monotone" 
                          dataKey="position" 
                          stroke="#ffd700" 
                          strokeWidth={2} 
                          dot={false}
                          animationDuration={1500}
                        />
                       )}

                       {/* Previous Position */}
                       {isCompareMode && visibleMetrics.includes('position') && (
                        <Line 
                          yAxisId="position"
                          type="monotone" 
                          dataKey="prevPosition" 
                          stroke="#ffd700" 
                          strokeWidth={2} 
                          strokeDasharray="5 5"
                          opacity={0.4}
                          dot={false}
                          animationDuration={1500}
                        />
                       )}
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
             
             <div className="overflow-x-auto pb-4 seo-scrollbar">
                <table className={`w-full text-left border-collapse ${isCompareMode ? 'min-w-[1200px]' : 'min-w-full'}`}>
                    <thead>
                       <tr className="text-slate-600">
                          <th className={`pb-4 text-[9px] font-black uppercase tracking-widest px-3 text-left ${!isCompareMode ? 'w-[50%]' : 'w-[30%]'}`}>
                            {activeTab === 'queries' ? 'Queries' : activeTab === 'pages' ? 'Page' : activeTab === 'countries' ? 'Country' : activeTab === 'devices' ? 'Device' : 'Date'}
                          </th>
                          
                          {/* Dynamic Columns based on Comparison Mode */}
                          {!isCompareMode ? (
                            <>
                              <th className="pb-4 text-[9px] font-black uppercase tracking-widest px-4 text-center border-l border-slate-200 dark:border-white/10">Rank</th>
                              <th className="pb-4 text-[9px] font-black uppercase tracking-widest px-4 text-center border-l border-slate-200 dark:border-white/10">Clicks</th>
                              <th className="pb-4 text-[9px] font-black uppercase tracking-widest px-4 text-center border-l border-slate-200 dark:border-white/10">Impressions</th>
                              <th className="pb-4 text-[9px] font-black uppercase tracking-widest px-4 text-center border-l border-slate-200 dark:border-white/10">CTR</th>
                            </>
                          ) : (
                            <>
                              {/* Comparison View: Clicks */}
                              <th className="pb-4 text-[9px] font-black uppercase tracking-widest px-6 text-center border-l border-slate-200 dark:border-white/10">Clicks (Cur)</th>
                              <th className="pb-4 text-[9px] font-black uppercase tracking-widest px-6 text-center">Clicks (Prev)</th>
                              <th className="pb-4 text-[9px] font-black uppercase tracking-widest px-6 text-center pr-8">Diff</th>
                              
                              {/* Comparison View: Impressions */}
                              <th className="pb-4 text-[9px] font-black uppercase tracking-widest px-6 text-center border-l border-slate-200 dark:border-white/10">Imps (Cur)</th>
                              <th className="pb-4 text-[9px] font-black uppercase tracking-widest px-6 text-center">Imps (Prev)</th>
                              <th className="pb-4 text-[9px] font-black uppercase tracking-widest px-6 text-center">Diff</th>

                              {/* Comparison View: CTR */}
                              <th className="pb-4 text-[9px] font-black uppercase tracking-widest px-6 text-center border-l border-slate-200 dark:border-white/10">CTR (Cur)</th>
                              <th className="pb-4 text-[9px] font-black uppercase tracking-widest px-6 text-center">CTR (Prev)</th>
                              <th className="pb-4 text-[9px] font-black uppercase tracking-widest px-6 text-center">Diff</th>

                              {/* Comparison View: Position */}
                              <th className="pb-4 text-[9px] font-black uppercase tracking-widest px-6 text-center border-l border-slate-200 dark:border-white/10">Pos (Cur)</th>
                              <th className="pb-4 text-[9px] font-black uppercase tracking-widest px-6 text-center">Pos (Prev)</th>
                              <th className="pb-4 text-[9px] font-black uppercase tracking-widest px-6 text-center pr-8">Diff</th>
                            </>
                          )}
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

                          // Find Previous Row for Comparison
                          let prevRow: GSCMetricRow | undefined;
                          if (isCompareMode) {
                            const prevList = data?.[activeTab === 'queries' ? 'prevQueries' : activeTab === 'pages' ? 'prevPages' : activeTab === 'countries' ? 'prevCountries' : activeTab === 'devices' ? 'prevDevices' : 'prevTrends'] || [];
                            prevRow = prevList.find(pr => pr.keys?.[0] === row.keys?.[0]);
                          }

                          return (
                            <tr key={i} className="group hover:bg-white/[0.02] transition-all">
                               <td className="py-2 px-3">
                                  <div className="flex items-center gap-3">
                                     {activeTab === 'devices' && <DeviceIcon type={row.keys?.[0] || ''} />}
                                     <span className="text-[11px] font-bold text-text-primary group-hover:text-accent-blue transition-colors truncate max-full block uppercase tracking-tight">
                                        {activeTab === 'countries' ? getCountryName(displayKey) : displayKey}
                                     </span>
                                  </div>
                               </td>

                                {!isCompareMode ? (
                                 <>
                                   <td className="py-3 px-4 text-center border-l border-slate-200 dark:border-white/10">
                                      <div className={`w-7 h-7 flex items-center justify-center rounded-lg font-black text-[9px] mx-auto ${
                                        row.position <= 3 ? 'bg-accent-green/10 text-accent-green border border-accent-green/20' :
                                        row.position < 10 ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20' :
                                        'bg-accent-red/10 text-accent-red border border-accent-red/20'
                                      } shadow-xl`}>
                                         {row.position.toFixed(0)}
                                      </div>
                                   </td>
                                   <td className="py-3 px-4 text-[10px] font-black text-text-secondary text-center tabular-nums border-l border-slate-200 dark:border-white/10">{row.clicks.toLocaleString()}</td>
                                   <td className="py-3 px-4 text-[10px] font-black text-text-secondary text-center tabular-nums border-l border-slate-200 dark:border-white/10">{row.impressions.toLocaleString()}</td>
                                   <td className="py-3 px-4 text-[10px] font-black text-text-secondary text-center tabular-nums border-l border-slate-200 dark:border-white/10">{(row.ctr * 100).toFixed(1)}%</td>
                                 </>
                               ) : (
                                 <>
                                   {/* Clicks Comparison */}
                                   <td className="py-3 px-6 text-[10px] font-black text-text-primary text-center border-l border-slate-200 dark:border-white/10 tabular-nums">{row.clicks.toLocaleString()}</td>
                                   <td className="py-3 px-6 text-[10px] font-bold text-text-muted text-center tabular-nums">{prevRow?.clicks.toLocaleString() || '0'}</td>
                                   <td className={`py-3 px-6 text-[10px] font-black text-center tabular-nums ${row.clicks - (prevRow?.clicks || 0) >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                                     {row.clicks - (prevRow?.clicks || 0) >= 0 ? '+' : ''}{(row.clicks - (prevRow?.clicks || 0)).toLocaleString()}
                                   </td>

                                   {/* Impressions Comparison */}
                                   <td className="py-3 px-6 text-[10px] font-black text-text-primary text-center border-l border-slate-200 dark:border-white/10 tabular-nums">{row.impressions.toLocaleString()}</td>
                                   <td className="py-3 px-6 text-[10px] font-bold text-text-muted text-center tabular-nums">{prevRow?.impressions.toLocaleString() || '0'}</td>
                                   <td className={`py-3 px-6 text-[10px] font-black text-center tabular-nums ${row.impressions - (prevRow?.impressions || 0) >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                                      {row.impressions - (prevRow?.impressions || 0) >= 0 ? '+' : ''}{(row.impressions - (prevRow?.impressions || 0)).toLocaleString()}
                                   </td>

                                   {/* CTR Comparison */}
                                   <td className="py-3 px-6 text-[10px] font-black text-text-primary text-center border-l border-slate-200 dark:border-white/10 tabular-nums">{(row.ctr * 100).toFixed(1)}%</td>
                                   <td className="py-3 px-6 text-[10px] font-bold text-text-muted text-center tabular-nums">{(prevRow ? (prevRow.ctr * 100).toFixed(1) : '0.0')}%</td>
                                   <td className={`py-3 px-6 text-[10px] font-black text-center tabular-nums ${row.ctr - (prevRow?.ctr || 0) >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                                      {row.ctr - (prevRow?.ctr || 0) >= 0 ? '+' : ''}{((row.ctr - (prevRow?.ctr || 0)) * 100).toFixed(1)}%
                                   </td>

                                   {/* Position Comparison */}
                                   <td className="py-3 px-6 text-[10px] font-black text-text-primary text-center border-l border-slate-200 dark:border-white/10 tabular-nums">{row.position.toFixed(1)}</td>
                                   <td className="py-3 px-6 text-[10px] font-bold text-text-muted text-center tabular-nums">{prevRow?.position.toFixed(1) || '0.0'}</td>
                                   <td className={`py-3 px-6 text-[10px] font-black text-center pr-8 tabular-nums ${row.position - (prevRow?.position || 0) <= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                                      {row.position - (prevRow?.position || 0) <= 0 ? '' : '+'}{(row.position - (prevRow?.position || 0)).toFixed(1)}
                                   </td>
                                 </>
                               )}
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
