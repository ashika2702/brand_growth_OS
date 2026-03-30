'use client';

import React, { useState } from 'react';
import { Mail, Shield, Server, RefreshCw, CheckCircle2, Zap } from 'lucide-react';

interface EmailTabProps {
    data: any;
    clientId: string;
    onUpdate: (newData: any) => void;
}

export default function EmailTab({ data, clientId, onUpdate }: EmailTabProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // We fetch the client data specifically for this tab
    const [config, setConfig] = useState({
        smtpHost: data.client?.smtpHost || 'smtp.gmail.com',
        smtpPort: data.client?.smtpPort || 465,
        smtpUser: data.client?.smtpUser || '',
        smtpPass: data.client?.smtpPass || '',
        imapHost: data.client?.imapHost || 'imap.gmail.com',
        imapPort: data.client?.imapPort || 993,
        fromName: data.client?.fromName || data.client?.name || 'Brand Growth OS'
    });

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/clients/${clientId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });

            if (res.ok) {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            }
        } catch (error) {
            console.error('Failed to save email config:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: name === 'smtpPort' || name === 'imapPort' ? parseInt(value) : value
        }));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Neural Email Settings</h2>
                    <p className="text-slate-500 text-xs font-medium mt-1">Configure brand-specific SMTP and IMAP for autonomous outreach.</p>
                </div>
                {saveSuccess && (
                    <div className="flex items-center gap-2 text-accent-green bg-accent-green/10 px-4 py-2 rounded-xl border border-accent-green/20">
                        <CheckCircle2 size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Configuration Saved</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* SMTP Configuration */}
                <div className="glass-card p-8 rounded-[2rem] border border-white/5 space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Server size={80} />
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-accent-blue/10 flex items-center justify-center text-accent-blue border border-accent-blue/20">
                            <Mail size={20} />
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Outbound (SMTP)</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">From Name</label>
                            <input
                                name="fromName"
                                value={config.fromName}
                                onChange={handleChange}
                                placeholder="e.g. Alex from Stedaxis"
                                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-700 outline-none focus:border-accent-blue/30 transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">SMTP Host</label>
                                <input
                                    name="smtpHost"
                                    value={config.smtpHost}
                                    onChange={handleChange}
                                    placeholder="smtp.gmail.com"
                                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-700 outline-none focus:border-accent-blue/30 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Port</label>
                                <input
                                    name="smtpPort"
                                    type="number"
                                    value={config.smtpPort}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-accent-blue/30 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">SMTP User / Username</label>
                            <input
                                name="smtpUser"
                                value={config.smtpUser}
                                onChange={handleChange}
                                placeholder="user@domain.com"
                                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-700 outline-none focus:border-accent-blue/30 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">SMTP Password</label>
                            <input
                                name="smtpPass"
                                type="password"
                                value={config.smtpPass}
                                onChange={handleChange}
                                placeholder="••••••••••••"
                                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-700 outline-none focus:border-accent-blue/30 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* IMAP Configuration */}
                <div className="glass-card p-8 rounded-[2rem] border border-white/5 space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <RefreshCw size={80} />
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-accent-orange/10 flex items-center justify-center text-accent-orange border border-accent-orange/20">
                            <Shield size={20} />
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Inbound (IMAP)</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">IMAP Host</label>
                                <input
                                    name="imapHost"
                                    value={config.imapHost}
                                    onChange={handleChange}
                                    placeholder="imap.gmail.com"
                                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-700 outline-none focus:border-accent-orange/30 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Port</label>
                                <input
                                    name="imapPort"
                                    type="number"
                                    value={config.imapPort}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-accent-orange/30 transition-all"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-accent-orange/5 border border-accent-orange/10 rounded-2xl">
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                                Note: Most modern email providers (Gmail, Outlook) reuse the SMTP username and password for IMAP. You only need to change the host and port in most cases.
                            </p>
                        </div>
                    </div>

                    <div className="pt-10">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full py-4 bg-accent-blue hover:bg-blue-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(62,128,255,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? <RefreshCw className="animate-spin" size={14} /> : <Zap size={14} fill="currentColor" />}
                            {isSaving ? 'Synchronizing...' : 'Calibrate Neural Email'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
