'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  RefreshCw, 
  ShieldCheck, 
  Activity
} from 'lucide-react';
import GTMTagTable from '@/components/analytics/GTMTagTable';

export default function GTMOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ tags: any[], triggers: any[], container?: any, workspace?: any } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{ message: string, link?: string } | null>(null);

  const fetchGTMData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/intelligence/${clientId}/gtm`);
      const result = await res.json();
      
      if (res.status === 401 || result.error === 'not_connected') {
        setError('not_connected');
        return;
      }

      if (res.status === 403 || result.error === 'api_disabled') {
        setError('api_disabled');
        setErrorDetails({ message: result.message, link: result.link });
        return;
      }

      if (result.error) throw new Error(result.error);
      setData(result);
    } catch (err: any) {
      console.error('Failed to load GTM data', err);
      setError(err.message || 'failed');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (clientId) {
      fetchGTMData();
    }
  }, [clientId, fetchGTMData]);

  if (error === 'not_connected' || error === 'not_configured' || error === 'api_disabled') {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="max-w-md w-full glass-card p-10 rounded-[2rem] border border-white/5 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center border mx-auto mb-4 bg-accent-orange/10 text-accent-orange border-accent-orange/20">
            <ShieldCheck size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-text-primary tracking-tight uppercase text-balance">
              {error === 'api_disabled' ? 'API Disabled' : 'GTM Required'}
            </h2>
            <p className="text-xs text-text-muted font-medium leading-relaxed">
              {error === 'api_disabled' 
                ? (errorDetails?.message || "The Google Tag Manager API is not enabled in your Google Cloud Project.")
                : error === 'not_configured' 
                  ? "Google Tag Manager is connected, but a Container ID hasn't been set for this client workspace." 
                  : "Google Tag Manager is not yet connected for this client. Link your account to activate tag intelligence."}
            </p>
          </div>
          
          {error === 'api_disabled' ? (
            <a 
              href={errorDetails?.link || 'https://console.developers.google.com/apis/api/tagmanager.googleapis.com/overview'}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] bg-accent-blue shadow-[0_10px_20px_rgba(0,163,255,0.2)]"
            >
              Enable API in Google Console
            </a>
          ) : (
            <button 
              onClick={() => router.push(`/crm/${clientId}`)}
              className="w-full py-4 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] bg-accent-orange shadow-[0_10px_20_rgba(255,77,0,0.2)]"
            >
              Go to Integration Settings
            </button>
          )}
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
              <h1 className="text-2xl font-bold text-text-primary tracking-tight uppercase">
                Tag Intelligence
              </h1>
           </div>
           <p className="text-text-muted text-xs font-medium ml-11 uppercase tracking-widest">
             Google Tag Manager configuration and active workspace inventory.
           </p>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => fetchGTMData()} className="p-4 bg-surface-2 rounded-2xl border border-border-1 text-text-muted hover:text-text-primary transition-all group">
            <RefreshCw size={18} className="group-active:rotate-180 transition-transform duration-500" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
           <div className="glass-card p-10 rounded-[2rem] border border-border-1 flex flex-col gap-6 relative overflow-hidden group animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="absolute top-0 right-0 w-96 h-96 bg-accent-orange/5 blur-[120px] pointer-events-none" />
              <div className="flex justify-between items-start relative z-10">
                 <div className="flex items-center gap-5">
                    <div className="p-5 rounded-3xl bg-accent-orange/10 border border-accent-orange/20 text-accent-orange">
                       <ShieldCheck size={32} />
                    </div>
                    <div>
                       <h2 className="text-2xl font-bold text-text-primary tracking-tight uppercase">{data?.container?.name || (loading ? 'Detecting...' : 'GTM Container')}</h2>
                       <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Public ID: {data?.container?.publicId || '...'}</span>
                          <div className="w-1 h-1 rounded-full bg-border-2" />
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Workspace: {data?.workspace?.name || '...'}</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="text-right mr-4">
                       <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Tracking Status</p>
                       <p className="text-[10px] font-black text-accent-green uppercase mt-0.5">VSC Verified Live</p>
                    </div>
                    <div className="p-4 bg-surface-2 rounded-2xl border border-border-1 text-text-muted">
                        <Activity size={20} />
                    </div>
                 </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 relative z-10">
                 <div className="bg-surface-2/50 p-5 rounded-2xl border border-border-1 transition-all hover:bg-surface-3/50 cursor-default group/card">
                    <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest mb-2 group-hover/card:text-accent-orange">Total Tags</p>
                    <p className="text-xl font-bold text-text-primary">{data?.tags?.length || 0}</p>
                 </div>
                 <div className="bg-surface-2/50 p-5 rounded-2xl border border-border-1 transition-all hover:bg-surface-3/50 cursor-default group/card">
                    <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest mb-2 group-hover/card:text-accent-orange">Triggers</p>
                    <p className="text-xl font-bold text-text-primary">{data?.triggers?.length || 0}</p>
                 </div>
                 <div className="bg-surface-2/50 p-5 rounded-2xl border border-border-1 transition-all hover:bg-surface-3/50 cursor-default group/card">
                    <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest mb-2 group-hover/card:text-accent-orange">Variables</p>
                    <p className="text-xl font-bold text-text-primary">{data?.variables?.length || 0}</p>
                 </div>
                 <div className="bg-surface-2/50 p-5 rounded-2xl border border-border-1 transition-all hover:bg-surface-3/50 cursor-default group/card">
                    <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest mb-2 group-hover/card:text-accent-orange">Last Published</p>
                    <p className="text-xl font-bold text-text-primary uppercase tracking-tighter">Live</p>
                 </div>
              </div>
           </div>

           <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
             <GTMTagTable 
               tags={data?.tags || []} 
               triggers={data?.triggers || []} 
               loading={loading} 
             />
           </div>
        </div>
    </div>
  );
}
