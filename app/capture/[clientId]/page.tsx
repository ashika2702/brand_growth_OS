"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function MobileCapturePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const clientId = params.clientId as string;
  const source = searchParams.get('s') || 'QR Scan';
  const campaign = searchParams.get('c') || 'General';

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', intent: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setStatus('loading');
    try {
      const res = await fetch(`/api/public/capture/${clientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source,
          campaign
        })
      });

      if (!res.ok) throw new Error('Submission failed');
      setStatus('success');
    } catch (err) {
      setStatus('error');
    }
  };

  if (!mounted) return null;

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#0A0D14] flex flex-col items-center justify-center p-6 glowing-bg">
        <div className="w-20 h-20 rounded-full bg-accent-green/20 flex items-center justify-center text-accent-green border border-accent-green/30 mb-8 animate-bounce-subtle">
           <CheckCircle2 size={40} />
        </div>
        <h1 className="text-3xl font-black text-white italic tracking-tighter mb-4 text-center">Analysis Initialized</h1>
        <p className="text-slate-400 text-center max-w-sm">
          We have securely received your details. Our systems will contact you shortly with the next steps.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0D14] flex flex-col p-6 glowing-bg overflow-x-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-blue/10 rounded-full blur-[100px] -z-10 pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#A855F7]/10 rounded-full blur-[100px] -z-10 pointer-events-none transform -translate-x-1/3 translate-y-1/3" />

      <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto z-10">
        
        {/* Header Section */}
        <div className="mb-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-blue to-[#A855F7] mx-auto mb-6 flex items-center justify-center text-white font-black text-xl shadow-[0_0_40px_rgba(45,140,255,0.4)]">
             BOS
          </div>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none text-glow">
             Claim Your Brief
          </h1>
          <p className="text-slate-400 text-sm">
             Enter your details below to initialize the Brand Growth OS analysis engine for your infrastructure.
          </p>
        </div>

        {/* Capture Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
             <div>
               <label className="block text-[10px] font-black uppercase tracking-widest text-[#A855F7] mb-2 px-1">Full Entity Name *</label>
               <input 
                 type="text" 
                 required
                 value={formData.name}
                 onChange={e => setFormData({ ...formData, name: e.target.value })}
                 className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-600 outline-none focus:border-accent-blue/50 focus:bg-white/10 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-md"
                 placeholder="John Doe"
               />
             </div>
             
             <div>
               <label className="block text-[10px] font-black uppercase tracking-widest text-accent-blue mb-2 px-1">Secure Comms (Email) *</label>
               <input 
                 type="email" 
                 required
                 value={formData.email}
                 onChange={e => setFormData({ ...formData, email: e.target.value })}
                 className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-600 outline-none focus:border-accent-blue/50 focus:bg-white/10 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-md"
                 placeholder="john@example.com"
               />
             </div>

             <div>
               <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 px-1">Direct Line (Optional)</label>
               <input 
                 type="tel" 
                 value={formData.phone}
                 onChange={e => setFormData({ ...formData, phone: e.target.value })}
                 className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white placeholder-slate-700 outline-none focus:border-white/20 transition-all"
                 placeholder="+1 (555) 000-0000"
               />
             </div>

             <div>
               <label className="block text-[10px] font-black uppercase tracking-widest text-accent-orange mb-2 px-1">What is your primary goal or interest today? *</label>
               <textarea 
                 required
                 value={formData.intent}
                 onChange={e => setFormData({ ...formData, intent: e.target.value })}
                 className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-600 outline-none focus:border-accent-orange/50 focus:bg-white/10 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-md min-h-[120px]"
                 placeholder="Tell us what you are looking to achieve..."
               />
             </div>
          </div>

          <button 
            type="submit" 
            disabled={status === 'loading'}
            className="w-full relative group overflow-hidden rounded-2xl p-[1px] mt-8"
          >
             <span className="absolute inset-0 bg-gradient-to-r from-accent-blue via-[#A855F7] to-accent-blue bg-[length:200%_auto] animate-gradient" />
             <div className="relative bg-[#0A0D14] px-6 py-4 rounded-2xl flex items-center justify-between group-hover:bg-opacity-90 transition-all">
                <span className="text-white font-black text-[11px] uppercase tracking-[0.2em]">
                  {status === 'loading' ? 'Encrypting Data...' : 'Initialize Analysis'}
                </span>
                <ArrowRight size={18} className="text-white group-hover:translate-x-1 transition-transform" />
             </div>
          </button>
          
          {status === 'error' && (
             <p className="text-center text-accent-red text-xs mt-4">Simulation failed. Please verify credentials and try again.</p>
          )}
        </form>
        
        <p className="text-center text-[9px] text-slate-600 font-medium uppercase tracking-widest mt-12">
           Secured by Brand Growth OS Neural Net
        </p>

      </div>
    </div>
  );
}
