"use client";

import React, { useState } from 'react';
import { X, UserPlus, UploadCloud } from 'lucide-react';

export default function AddLeadModal({ 
  isOpen, 
  onClose, 
  clientId, 
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  clientId: string;
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState('Manual Entry');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          name,
          email,
          phone,
          source
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
        // Reset form
        setName('');
        setEmail('');
        setPhone('');
        setSource('Manual Entry');
      } else {
         console.error("Failed to add lead")
      }
    } catch (error) {
       console.error("Error submitting lead:", error)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-lg bg-surface-1 rounded-[2rem] border border-border-1 shadow-2xl relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-blue via-accent-purple to-accent-orange" />
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-text-muted hover:text-text-primary transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 flex items-center justify-center text-accent-blue border border-accent-blue/20 shrink-0">
               <UserPlus size={24} />
            </div>
            <div>
               <h2 className="text-xl font-black text-text-primary uppercase italic tracking-tighter">New Lead Injection</h2>
               <p className="text-xs text-text-muted font-medium">Manually add a high-intent prospect to the system.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-text-muted mb-2 ml-1">Full Name *</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full bg-surface-2 border border-border-1 rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:border-accent-blue/50 transition-colors placeholder:text-text-muted/50"
                placeholder="e.g. Sarah Jenkins"
              />
            </div>

            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-text-muted mb-2 ml-1">Email Address *</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-surface-2 border border-border-1 rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:border-accent-blue/50 transition-colors placeholder:text-text-muted/50"
                placeholder="sarah@company.com"
              />
            </div>

            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-text-muted mb-2 ml-1">Phone Number (Optional)</label>
              <input 
                type="tel" 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-surface-2 border border-border-1 rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:border-accent-blue/50 transition-colors placeholder:text-text-muted/50"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-text-muted mb-2 ml-1">Acquisition Source</label>
              <input 
                type="text" 
                value={source}
                onChange={e => setSource(e.target.value)}
                className="w-full bg-surface-2 border border-border-1 rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:border-accent-blue/50 transition-colors placeholder:text-text-muted/50"
                placeholder="e.g. Manual Entry, Direct Message, Referral"
              />
            </div>

            <div className="pt-6 mt-6 border-t border-border-1 flex gap-4">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-4 rounded-xl border border-border-1 text-text-muted font-black text-[10px] uppercase tracking-widest hover:bg-surface-2 hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isLoading}
                className="flex-[2] py-4 rounded-xl bg-accent-blue text-white font-black text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(45,140,255,0.3)] hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="animate-pulse">Injecting...</span>
                ) : (
                  <>
                    <UploadCloud size={16} /> Execute Injection
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
