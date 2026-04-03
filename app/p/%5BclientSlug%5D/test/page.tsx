"use client";

import React, { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowRight, CheckCircle2, ShieldCheck, Globe, Zap, Sparkles } from 'lucide-react';

export default function TestLandingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  // Use the ID from the URL or query param for the test
  const clientSlug = params.clientSlug as string;
  const clientId = searchParams.get('clientId') || clientSlug; 
  
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    intent: 'Testing the BGO Universal Capture System'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');

    try {
      // POSTing to our new Universal Capture API (M03)
      const res = await fetch(`/api/public/capture/${clientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source: 'Test Website',
          campaign: 'Verification Alpha'
        })
      });

      if (res.ok) {
        setFormState('success');
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || 'Failed to capture lead'}`);
        setFormState('idle');
      }
    } catch (err) {
      console.error('Submission failed', err);
      setFormState('idle');
    }
  };

  if (formState === 'success') {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full glass-card p-12 rounded-[3.5rem] border border-accent-blue/20 shadow-[0_0_80px_rgba(45,140,255,0.15)] animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 rounded-3xl bg-accent-blue/10 flex items-center justify-center text-accent-blue mx-auto mb-8 border border-accent-blue/20 shadow-[0_0_30px_rgba(45,140,255,0.2)]">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none">Lead Captured</h2>
          <p className="text-slate-400 font-medium mb-8 leading-relaxed">The BGO Intelligence Core has received your data. The CRM has been updated with your persona profile.</p>
          <div className="flex items-center justify-center gap-2 text-accent-blue/60 text-[10px] font-black uppercase tracking-[0.3em]">
            <Zap size={14} className="animate-pulse" /> Real-Time Sync Active
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-white selection:bg-accent-blue/30 font-sans overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-accent-blue/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent-orange/5 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100" />
      </div>

      <main className="relative z-10 max-w-xl mx-auto px-6 py-20 min-h-screen flex flex-col justify-center">
        
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-accent-blue mb-2">
            <Globe size={14} /> Global Conversion Protocol
          </div>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-[0.9] text-white">
            Verify Your <span className="text-transparent bg-clip-text bg-gradient-to-br from-accent-blue to-accent-orange">Growth Sync</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-xs mx-auto">Submit this form to test the zero-latency neural capture engine.</p>
        </div>

        {/* Form Architecture */}
        <div className="glass-card p-10 rounded-[3rem] border border-white/5 relative group shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[3rem]" />
          
          <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">Subject Identity</label>
              <input 
                required
                type="text"
                placeholder="Candidate Name"
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-5 outline-none focus:border-accent-blue/50 focus:bg-white/[0.07] transition-all font-medium text-white placeholder:text-slate-700 shadow-inner"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">Contact Frequency (Email)</label>
              <input 
                required
                type="email"
                placeholder="lead@origin.com"
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-5 outline-none focus:border-accent-blue/50 focus:bg-white/[0.07] transition-all font-medium text-white placeholder:text-slate-700 shadow-inner"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">Communication Line (Phone)</label>
              <input 
                required
                type="tel"
                placeholder="+61 XXX XXX XXX"
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-5 outline-none focus:border-accent-blue/50 focus:bg-white/[0.07] transition-all font-medium text-white placeholder:text-slate-700 shadow-inner"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <button 
              disabled={formState === 'submitting'}
              className="w-full group bg-white text-black py-6 rounded-2xl font-black uppercase tracking-[0.25em] text-[11px] flex items-center justify-center gap-4 active:scale-95 transition-all shadow-[0_20px_60px_rgba(255,255,255,0.08)] hover:bg-accent-blue hover:text-white"
            >
              {formState === 'submitting' ? (
                <Zap className="animate-spin" size={20} />
              ) : (
                <>
                  Initiate Sync <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Footer */}
        <div className="mt-12 flex items-center justify-center gap-8 opacity-40">
           <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
             <ShieldCheck size={14} /> M15 Verified
           </div>
           <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
             <Sparkles size={14} /> AI Profiling Enabled
           </div>
        </div>

      </main>
    </div>
  );
}
