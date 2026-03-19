"use client";

import React, { useState } from 'react';
import { X, Sparkles, Send, Calendar, User, Tag, Flag } from 'lucide-react';

interface NewRequestPanelProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  onRefresh: () => void;
}

export default function NewRequestPanel({ isOpen, onClose, clientId, onRefresh }: NewRequestPanelProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'Reel',
    platform: ['IG'],
    briefText: '',
    dueDate: '',
    assignedTo: '',
    priority: 'medium',
    campaign: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, clientId }),
      });
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-[450px] h-full bg-[#0A0A0A] border-l border-white/10 shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-accent-blue/10 rounded-lg">
                    <Sparkles size={16} className="text-accent-blue" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-widest text-white">New Content Request</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X size={18} className="text-slate-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-8">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Request Title</label>
                <input 
                    required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Suburb Spotlight: Surry Hills Reel"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-700 focus:border-accent-blue/50 outline-none transition-all"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Content Type</label>
                    <select 
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-accent-blue/50 transition-all appearance-none"
                    >
                        <option value="Reel">IG Reel</option>
                        <option value="Post">Social Post</option>
                        <option value="Ad">Paid Ad</option>
                        <option value="Blog">Blog Post</option>
                        <option value="Email">Email Blast</option>
                        <option value="Page">Landing Page</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Priority</label>
                    <select 
                        value={formData.priority}
                        onChange={e => setFormData({...formData, priority: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-accent-blue/50 transition-all appearance-none"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">The Mission (Plain Language)</label>
                <textarea 
                    value={formData.briefText}
                    onChange={e => setFormData({...formData, briefText: e.target.value})}
                    placeholder="Describe what you want the AI to generate. Mention specific suburb details or hooks you want to include..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-700 min-h-[120px] focus:border-accent-blue/50 outline-none transition-all resize-none"
                />
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-4 text-slate-400">
                    <Calendar size={14} />
                    <input 
                        type="date"
                        value={formData.dueDate}
                        onChange={e => setFormData({...formData, dueDate: e.target.value})}
                        className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-widest text-slate-400"
                    />
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                    <User size={14} />
                    <input 
                         placeholder="ASSIGN TO (e.g. MAX)"
                         value={formData.assignedTo}
                         onChange={e => setFormData({...formData, assignedTo: e.target.value.toUpperCase()})}
                         className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest placeholder:text-slate-700"
                    />
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                    <Tag size={14} />
                    <input 
                         placeholder="CAMPAIGN TAG"
                         value={formData.campaign}
                         onChange={e => setFormData({...formData, campaign: e.target.value})}
                         className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest placeholder:text-slate-700 uppercase"
                    />
                </div>
            </div>
          </form>

          {/* Footer Actions */}
          <div className="p-8 border-t border-white/5 bg-white/[0.01]">
                <button 
                  type="submit"
                  disabled={loading}
                  onClick={handleSubmit}
                  className="w-full py-4 bg-accent-blue hover:bg-blue-600 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(62,128,255,0.2)] disabled:opacity-50"
                >
                    {loading ? 'Processing...' : (
                        <>
                            Launch Request
                            <Send size={14} />
                        </>
                    )}
                </button>
                <p className="text-[9px] text-center mt-4 text-slate-600 font-bold uppercase tracking-widest">AI Briefing will begin immediately after launch</p>
          </div>
        </div>
      </div>
    </div>
  );
}
