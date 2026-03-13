"use client";

import React, { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export default function WelcomeLeadPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const clientSlug = params.clientSlug as string;
  const source = searchParams.get('source') || 'Direct';

  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');

    try {
      // In a real scenario, clientSlug would be resolved to clientId
      // For this demo, we'll assume clientSlug IS the clientId or we fetch it
      const res = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: clientSlug,
          ...formData,
          source: `Welcome Page (${source})`
        })
      });

      if (res.ok) {
        setFormState('success');
      }
    } catch (err) {
      console.error('Submission failed', err);
      setFormState('idle');
    }
  };

  if (formState === 'success') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full glass-card p-10 rounded-[3rem] border border-accent-green/20 shadow-[0_0_50px_rgba(55,214,122,0.1)]">
          <div className="w-20 h-20 rounded-full bg-accent-green/10 flex items-center justify-center text-accent-green mx-auto mb-6 border border-accent-green/20">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">You're In.</h2>
          <p className="text-slate-400 font-medium mb-8">Your profile has been synchronized with our Brand Intelligence Core. Our team will reach out shortly.</p>
          <div className="flex items-center justify-center gap-2 text-accent-green/60 text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck size={14} /> Encrypted & Verified
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-accent-orange/30">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent-orange/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-blue/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-lg mx-auto px-6 pt-20 pb-12 min-h-screen flex flex-col">
        {/* Branding */}
        <div className="flex flex-col items-center text-center mb-12">
          <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none mb-4">
            Unlock Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-orange to-accent-blue">Growth OS</span>
          </h1>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Full Name</label>
              <input 
                required
                type="text"
                placeholder="John Doe"
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-accent-orange/50 focus:bg-white/[0.07] transition-all font-medium text-white placeholder:text-slate-700"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Business Email</label>
              <input 
                required
                type="email"
                placeholder="john@company.com"
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-accent-orange/50 focus:bg-white/[0.07] transition-all font-medium text-white placeholder:text-slate-700"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">WhatsApp / Phone</label>
              <input 
                required
                type="tel"
                placeholder="+1 234 567 890"
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-accent-orange/50 focus:bg-white/[0.07] transition-all font-medium text-white placeholder:text-slate-700"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <button 
              disabled={formState === 'submitting'}
              className="w-full group bg-white text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 active:scale-95 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.05)]"
            >
              {formState === 'submitting' ? 'Synchronizing...' : (
                <>
                  Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Trust Badges */}
        
      </main>
    </div>
  );
}
