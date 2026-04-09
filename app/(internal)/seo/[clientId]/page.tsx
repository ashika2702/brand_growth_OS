"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { 
  Globe, 
  TrendingUp, 
  BarChart3, 
  ShieldCheck,
  Zap,
  ArrowUpRight,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

export default function ClientSEODashboard() {
  const params = useParams();
  const clientId = params.clientId as string;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    clicks: 0,
    impressions: 0,
    avgPosition: 0,
    ctr: 0
  });
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/seo/${clientId}/performance`);
      const result = await res.json();
      
      if (res.status === 401 || result.error === 'not_connected') {
        setError('not_connected');
        return;
      }

      if (result.rows) {
        setData(result.rows);
        
        // Calculate basic stats
        const totalClicks = result.rows.reduce((acc: number, r: any) => acc + r.clicks, 0);
        const totalImps = result.rows.reduce((acc: number, r: any) => acc + r.impressions, 0);
        const avgPos = result.rows.reduce((acc: number, r: any) => acc + r.position, 0) / result.rows.length;
        const avgCtr = (totalClicks / totalImps) * 100;
        
        setStats({
          clicks: totalClicks,
          impressions: totalImps,
          avgPosition: Number(avgPos.toFixed(1)) || 0,
          ctr: Number(avgCtr.toFixed(1)) || 0
        });
      }
    } catch (err) {
      console.error('Failed to load SEO data');
      setError('failed');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (clientId) fetchData();
  }, [clientId, fetchData]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent-orange/20 border-t-accent-orange rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted animate-pulse italic">
            Synchronizing Neural Search Data...
          </p>
        </div>
      </div>
    );
  }

  if (error === 'not_connected' || error === 'permission_denied') {
    const isPermission = error === 'permission_denied';
    
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="max-w-md w-full glass-card p-10 rounded-[3rem] border border-white/5 text-center space-y-6">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border mx-auto mb-4 ${
            isPermission ? 'bg-accent-red/10 text-accent-red border-accent-red/20' : 'bg-accent-orange/10 text-accent-orange border-accent-orange/20'
          }`}>
            {isPermission ? <ShieldAlert size={40} /> : <AlertCircle size={40} />}
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase font-sans text-balance">
              {isPermission ? 'GSC PERMISSION DENIED' : 'CONNECTION REQUIRED'}
            </h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              {isPermission 
                ? "Your Google account doesn't have access to this website in Search Console. Please verify your property URL and account permissions."
                : "Google Search Console is not yet connected for this client workspace. Link your account to activate autonomous SEO monitoring."
              }
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => window.location.href = `/crm/${clientId}`}
              className={`w-full py-4 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] ${
                isPermission ? 'bg-accent-red shadow-[0_10px_20px_rgba(255,50,50,0.2)]' : 'bg-accent-orange shadow-[0_10px_20px_rgba(255,77,0,0.2)]'
              }`}
            >
              {isPermission ? 'Verify Settings' : 'Connect Console in Integrations'}
            </button>
            
            {isPermission && (
              <a 
                href="https://search.google.com/search-console" 
                target="_blank" 
                rel="noreferrer"
                className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
              >
                Open Google Search Console ↗
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto no-scrollbar pb-8 animate-in fade-in duration-700">
      
      {/* Header Area */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-accent-orange/10 flex items-center justify-center text-accent-orange border border-accent-orange/20">
              <Globe size={24} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">SEO Intelligence</h1>
          </div>
          <p className="text-slate-500 font-medium transition-colors">Client ID: <span className="text-accent-orange/70">{clientId}</span> | Autonomous Rank Monitoring Active</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchData}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all flex items-center gap-2 group"
          >
            <RefreshCw size={14} className="text-accent-orange group-hover:rotate-180 transition-transform duration-500" /> 
            Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Clicks', value: stats.clicks.toLocaleString(), trend: '+5.2%', color: 'text-accent-green', icon: TrendingUp },
          { label: 'Impressions', value: stats.impressions.toLocaleString(), trend: '+12.4%', color: 'text-accent-blue', icon: BarChart3 },
          { label: 'Avg. Position', value: stats.avgPosition || 'N/A', trend: '-0.3', color: 'text-accent-orange', icon: Globe },
          { label: 'Click-Through Rate', value: `${stats.ctr}%`, trend: '+0.8%', color: 'text-accent-green', icon: Zap },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-5 rounded-[1.5rem] border border-white/5 hover:border-white/10 transition-colors group">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest">{stat.label}</p>
              <stat.icon size={12} className="text-slate-700 group-hover:text-white transition-colors" />
            </div>
            <div className="flex items-baseline gap-2">
              <h4 className="text-2xl font-black text-white">{stat.value}</h4>
              <span className={`text-[10px] font-black italic ${stat.color}`}>{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Keyword Health Table */}
        <div className="col-span-12 lg:col-span-8 glass-card p-8 rounded-[2.5rem] border border-white/5 overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <TrendingUp size={14} className="text-accent-blue" /> Ranking Intelligence
            </h3>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-accent-green" />
                 <span className="text-[8px] font-black uppercase text-slate-500">Top 3</span>
               </div>
               <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-accent-orange" />
                 <span className="text-[8px] font-black uppercase text-slate-500">Striking Distance</span>
               </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  {['Keyword Query', 'Clicks', 'Impressions', 'CTR', 'Position', 'Growth'].map(th => (
                    <th key={th} className="pb-4 text-[9px] font-black text-slate-600 uppercase tracking-widest px-4">{th}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data && data.length > 0 ? data.map((row, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors group cursor-pointer">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">{row.keys?.[0] || 'Unknown'}</span>
                        <ArrowUpRight size={12} className="text-slate-700 group-hover:text-accent-orange transition-colors" />
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs font-black text-slate-400">{row.clicks}</td>
                    <td className="py-4 px-4 text-xs font-black text-slate-400">{row.impressions}</td>
                    <td className="py-4 px-4 text-xs font-black text-accent-blue">{(row.ctr * 100).toFixed(1)}%</td>
                    <td className="py-4 px-4">
                      <span className={`text-sm font-black italic px-3 py-1 rounded-lg ${
                        row.position <= 3 ? 'text-accent-green bg-accent-green/10' : 
                        row.position <= 10 ? 'text-white bg-white/5' : 
                        'text-accent-orange bg-accent-orange/10'
                      }`}>
                        #{row.position.toFixed(0)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-accent-orange" style={{ width: `${Math.min(100, (1/row.position)*100)}%` }} />
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic">No keyword data found or Search Console not connected.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Training / Nova Insight Panel */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          
          <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent flex-1">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-accent-blue/10 flex items-center justify-center text-accent-blue border border-accent-blue/20">
                  <ShieldCheck size={18} />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Nova Insights</h3>
             </div>

             <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                   <div className="flex items-center gap-2 text-accent-green">
                      <CheckCircle2 size={14} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Growth Detected</span>
                   </div>
                   <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      Your neural search presence is expanding. Recommend creating a new landing page for "Pricing" to capture higher intent leads.
                   </p>
                </div>

                <div className="p-4 rounded-2xl bg-accent-orange/5 border border-accent-orange/10 space-y-2">
                   <div className="flex items-center gap-2 text-accent-orange">
                      <AlertCircle size={14} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Striking Distance</span>
                   </div>
                   <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      <span className="text-white">{data?.[0]?.keys?.[0] || 'Top Keyword'}</span> is currently stuck at position #12. Small meta-tag optimization could push this to Page 1.
                   </p>
                   <button className="w-full mt-2 py-2 bg-accent-orange text-white text-[9px] font-black uppercase rounded-lg hover:bg-accent-red transition-colors">
                      Optimize Content
                   </button>
                </div>
             </div>
          </div>

          <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 bg-accent-blue/5">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-4">Indexing Status</h3>
             <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] text-slate-400 font-bold">Domain Audit?</span>
                <span className="text-[10px] text-accent-green font-black uppercase">Active</span>
             </div>
             <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase rounded-2xl border border-white/10 transition-all">
                Check URL Audit
             </button>
          </div>

        </div>

      </div>
    </div>
  );
}
