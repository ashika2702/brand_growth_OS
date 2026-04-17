"use client";

import React, { useState, useEffect } from 'react';
import { Share2, Lock, Copy, Check, Globe, Instagram, Linkedin, ShieldCheck, AlertCircle } from 'lucide-react';

interface IntegrationsViewProps {
  clientId: string;
}

export default function IntegrationsView({ clientId }: IntegrationsViewProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    googleAdsKey: '',
    metaAccessToken: '',
    metaPageId: '',
    linkedInAccessToken: '',
    googleSearchConsoleUrl: '',
    googleAnalyticsPropertyId: '',
    isGoogleConnected: false
  });

  useEffect(() => {
    fetchIntegrations();
  }, [clientId]);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/crm/clients/${clientId}/integrations`);
      const data = await res.json();
      setFormData(data);
    } catch (err) {
      console.error('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      const res = await fetch(`/api/crm/clients/${clientId}/integrations`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        await fetchIntegrations();
      }
    } catch (err) {
      console.error('Failed to update integrations');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const webhookUrl = `${window.location.origin}/api/webhooks/google/${clientId}`;

  if (loading) return <div className="p-8 animate-pulse text-text-muted italic uppercase font-black">Decrypting Integrations...</div>;

  return (
    <div className="h-full overflow-y-auto pr-2 pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header Info */}
      <div className="flex items-start gap-4 p-6 rounded-3xl bg-surface-2 border border-border-1 transition-colors">
        <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 flex items-center justify-center text-accent-blue border border-accent-blue/20 shrink-0">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h2 className="text-lg font-black text-text-primary uppercase italic tracking-tighter transition-colors">Security & Ad Webhooks</h2>
          <p className="text-text-muted text-sm font-medium transition-colors">Manage the digital handshakes that fuel your real-time lead capture engine.</p>
        </div>
      </div>

      {/* Google Ads Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Globe className="text-accent-blue w-5 h-5" />
          <h3 className="text-sm font-black uppercase tracking-widest text-text-primary italic transition-colors">Google Ads Lead Forms</h3>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-border-1 space-y-6 transition-colors">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
              Your Webhook URL
              <span className="text-[8px] bg-accent-blue/20 text-accent-blue px-2 py-0.5 rounded-full">Endpoint</span>
            </label>
            <div className="flex items-center gap-2 bg-surface-3 p-3 rounded-2xl border border-border-2 group">
              <code className="text-xs text-text-secondary truncate flex-1 font-mono">{webhookUrl}</code>
              <button
                onClick={() => copyToClipboard(webhookUrl, 'webhook')}
                className="p-2 hover:bg-surface-2 rounded-xl transition-all text-text-muted hover:text-accent-blue"
              >
                {copied === 'webhook' ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <p className="text-[10px] text-text-muted italic">Paste this into your Google Ads Lead Form extension "Webhook URL" field.</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Google Ads Key (Secret)</label>
            <input
              type="text"
              value={formData.googleAdsKey}
              onChange={(e) => setFormData({ ...formData, googleAdsKey: e.target.value })}
              placeholder="e.g. BGO_SECRET_PASS_2026"
              className="w-full bg-surface-3 border border-border-2 focus:border-accent-blue p-4 rounded-2xl text-sm transition-all focus:ring-1 focus:ring-accent-blue/20 text-text-primary font-medium"
            />
          </div>
        </div>
      </section>

      {/* Meta Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Instagram className="text-accent-red w-5 h-5" />
          <h3 className="text-sm font-black uppercase tracking-widest text-text-primary italic transition-colors">Meta & Instagram Lead Ads</h3>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-border-1 space-y-6 transition-colors">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Meta Page ID</label>
              <input
                type="text"
                value={formData.metaPageId}
                onChange={(e) => setFormData({ ...formData, metaPageId: e.target.value })}
                placeholder="Find in Page Settings"
                className="w-full bg-surface-3 border border-border-2 focus:border-accent-blue p-4 rounded-2xl text-sm transition-all text-text-primary font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Meta Access Token</label>
              <input
                type="password"
                value={formData.metaAccessToken}
                onChange={(e) => setFormData({ ...formData, metaAccessToken: e.target.value })}
                placeholder="EAA..."
                className="w-full bg-surface-3 border border-border-2 focus:border-accent-blue p-4 rounded-2xl text-sm transition-all text-text-primary font-medium"
              />
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-accent-orange/5 border border-accent-orange/10">
            <AlertCircle className="text-accent-orange shrink-0 w-4 h-4 mt-0.5" />
            <p className="text-[10px] text-text-secondary leading-relaxed">Ensure you have 'leads_retrieval' permissions granted in the Meta App Dashboard for this token.</p>
          </div>
        </div>
      </section>

      {/* LinkedIn Section (existing) */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Linkedin className="text-accent-blue w-5 h-5" />
          <h3 className="text-sm font-black uppercase tracking-widest text-text-primary italic transition-colors">LinkedIn Lead Gen Forms</h3>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-border-1 space-y-4 transition-colors">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">LinkedIn Access Token</label>
            <input
              type="password"
              value={formData.linkedInAccessToken}
              onChange={(e) => setFormData({ ...formData, linkedInAccessToken: e.target.value })}
              placeholder="AQV..."
              className="w-full bg-surface-3 border border-border-2 focus:border-accent-blue p-4 rounded-2xl text-sm transition-all text-text-primary font-medium"
            />
          </div>
        </div>
      </section>

      {/* Google Search Console Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Globe className="text-accent-orange w-5 h-5" />
          <h3 className="text-sm font-black uppercase tracking-widest text-text-primary italic transition-colors">Google Intelligence (SEO & Analytics)</h3>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-border-1 space-y-6 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${
                formData.isGoogleConnected 
                ? 'bg-accent-green/10 text-accent-green border-accent-green/20' 
                : 'bg-surface-2 text-text-muted border-border-1'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${formData.isGoogleConnected ? 'bg-accent-green animate-pulse' : 'bg-text-muted'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {formData.isGoogleConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              {formData.isGoogleConnected && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.location.href = `/seo/${clientId}`}
                    className="px-4 py-1 bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue text-[10px] font-black uppercase tracking-widest rounded-full border border-accent-blue/20 transition-all flex items-center gap-2"
                  >
                    SEO Dashboard
                  </button>
                  <button 
                    onClick={() => window.location.href = `/intelligence/${clientId}/analytics`}
                    className="px-4 py-1 bg-accent-green/10 hover:bg-accent-green/20 text-accent-green text-[10px] font-black uppercase tracking-widest rounded-full border border-accent-green/20 transition-all flex items-center gap-2"
                  >
                    Analytics Dashboard
                  </button>
                </div>
              )}
            </div>
            
            <a 
              href={`/api/auth/google/login?clientId=${clientId}`}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all 
                ${formData.isGoogleConnected 
                  ? 'bg-surface-2 text-text-muted border border-border-1 hover:bg-accent-red/10 hover:text-accent-red hover:border-accent-red/20' 
                  : 'bg-accent-orange text-white shadow-[0_0_15px_rgba(255,77,0,0.2)] hover:scale-[1.02]'}`}
            >
              {formData.isGoogleConnected ? 'Reconnect Console' : 'Connect Account'}
            </a>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
              Verified Property URL
              <span className="text-[8px] bg-accent-orange/20 text-accent-orange px-2 py-0.5 rounded-full">Required</span>
            </label>
            <input
              type="text"
              value={formData.googleSearchConsoleUrl}
              onChange={(e) => setFormData({ ...formData, googleSearchConsoleUrl: e.target.value })}
              placeholder="e.g. https://www.yourdomain.com/"
              className="w-full bg-surface-3 border border-border-2 focus:border-accent-orange p-4 rounded-2xl text-sm transition-all focus:ring-1 focus:ring-accent-orange/20 text-text-primary font-medium"
            />
            <p className="text-[10px] text-text-muted italic">This must match the property URL exactly as seen in your Google Search Console dashboard.</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
              GA4 Property ID
              <span className="text-[8px] bg-accent-green/20 text-accent-green px-2 py-0.5 rounded-full">Required for Analytics</span>
            </label>
            <input
              type="text"
              value={formData.googleAnalyticsPropertyId}
              onChange={(e) => setFormData({ ...formData, googleAnalyticsPropertyId: e.target.value })}
              placeholder="e.g. 123456789"
              className="w-full bg-surface-3 border border-border-2 focus:border-accent-green p-4 rounded-2xl text-sm transition-all focus:ring-1 focus:ring-accent-green/20 text-text-primary font-medium"
            />
            <p className="text-[10px] text-text-muted italic">Found in GA4 Admin → Property Settings → Property ID.</p>
          </div>
        </div>
      </section>

      {/* Action Footer */}
      <div className="fixed bottom-6 right-10 left-[calc(var(--sidebar-width)+3rem)] pointer-events-none">
        <div className="max-w-4xl mx-auto flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`pointer-events-auto flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]
              ${success ? 'bg-accent-green text-white shadow-accent-green/20' : 'bg-text-primary text-surface-1 shadow-black/40'}`}
          >
            {saving ? <Share2 className="animate-spin" size={18} /> : success ? <Check size={18} /> : <Lock size={18} />}
            {saving ? 'Synchronizing...' : success ? 'Keys Secured' : 'Save Integrations'}
          </button>
        </div>
      </div>

    </div>
  );
}
