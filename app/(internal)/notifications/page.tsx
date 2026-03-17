"use client";

import React, { useState, useEffect } from 'react';
import { useClientStore } from '@/lib/store';
import { 
  Bell, 
  Search, 
  Filter, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Users, 
  Megaphone, 
  BarChart3, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Package
} from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

export default function NotificationsPage() {
  const { activeClientId } = useClientStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'critical' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!activeClientId) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/notifications?clientId=${activeClientId}`);
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [activeClientId]);

  const markRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {}
  };

  const markAllRead = async () => {
    try {
       // Ideally a bulk API, but for now individual or local update
       setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) {}
  };

  const getIcon = (type: string) => {
    if (type.startsWith('lead')) return <Users size={16} />;
    if (type.startsWith('seo')) return <BarChart3 size={16} />;
    if (type.startsWith('ads')) return <Megaphone size={16} />;
    if (type.startsWith('content')) return <Sparkles size={16} />;
    if (type.startsWith('pr')) return <ShieldCheck size={16} />;
    return <Package size={16} />;
  };

  const filtered = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.message.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'critical') return n.priority === 'urgent' || n.priority === 'high';
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Notification <span className="text-accent-blue">Centre</span></h1>
          <p className="text-sm text-slate-500 font-medium">Real-time intelligence and alerts for your brand ecosystem.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <button onClick={markAllRead} className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-white/20 transition-all">Mark all as read</button>
            <button className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-white/20 transition-all">Clear Dismissed</button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="glass-card border border-white/5 rounded-2xl p-4 flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 w-full lg:w-fit">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-accent-blue text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            All Activity
          </button>
          <button 
            onClick={() => setFilter('unread')}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'unread' ? 'bg-accent-blue text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Unread
          </button>
          <button 
            onClick={() => setFilter('critical')}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'critical' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Critical
          </button>
        </div>

        <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
            <input 
                type="text" 
                placeholder="Search alerts..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs text-white outline-none focus:border-accent-blue/50 transition-all" 
            />
        </div>
      </div>

      {/* Inbox List */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-10">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-600 animate-pulse">
            <Bell className="w-8 h-8 opacity-20 mb-2" />
            <p className="text-[10px] font-black uppercase tracking-widest">Encrypting Feed...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-[2.5rem]">
            <Info className="w-12 h-12 text-slate-800 opacity-20 mb-4" />
            <p className="text-sm font-black text-white/20 uppercase tracking-[0.2em]">Zero Notifications Found</p>
          </div>
        ) : (
          filtered.map((n) => (
            <div 
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`group glass-card border transition-all hover:border-white/10 p-5 rounded-2xl flex items-start gap-6 cursor-pointer relative overflow-hidden
                ${!n.isRead ? 'bg-[#12141C]/80 border-white/10' : 'bg-[#0D0D0D]/40 border-white/5 opacity-80'}
              `}
            >
              {/* Severity Side Border */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                n.priority === 'urgent' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 
                n.priority === 'high' ? 'bg-orange-500' : 
                n.priority === 'medium' ? 'bg-accent-blue' : 'bg-slate-700'
              }`} />

              {/* Module Icon Container */}
              <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 transition-colors
                ${!n.isRead ? 'bg-white/5 text-accent-blue' : 'bg-black/40 text-slate-600'}
              `}>
                {getIcon(n.type)}
              </div>

              {/* Content Container */}
              <div className="flex-1 min-w-0">
                 <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-3">
                        <h3 className={`font-black text-base transition-colors ${!n.isRead ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>{n.title}</h3>
                        {n.priority === 'urgent' && (
                            <span className="bg-red-500/10 text-red-500 text-[8px] font-black px-2 py-0.5 rounded border border-red-500/20 uppercase tracking-widest animate-pulse">URGENT</span>
                        )}
                    </div>
                    <span className="text-[10px] font-black text-slate-600 uppercase tabular-nums">
                        {new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                 </div>
                 <p className={`text-sm leading-relaxed mb-4 max-w-3xl ${!n.isRead ? 'text-slate-300' : 'text-slate-500'}`}>{n.message}</p>
                 
                 <div className="flex items-center gap-4">
                    {n.link && (
                        <a 
                            href={n.link} 
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] font-black uppercase tracking-widest text-accent-blue flex items-center gap-1.5 hover:gap-2.5 transition-all"
                        >
                            Open Action Item <ExternalLink size={10} />
                        </a>
                    )}
                    <div className="h-4 w-[1px] bg-white/5" />
                    <button 
                        onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                        className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-red-400 transition-colors flex items-center gap-1.5"
                    >
                        Dismiss <Trash2 size={10} />
                    </button>
                    {!n.isRead && (
                         <div className="ml-auto w-2 h-2 rounded-full bg-accent-blue shadow-[0_0_10px_rgba(62,128,255,0.8)]" />
                    )}
                 </div>
              </div>

              {/* Action Chevron for hover info */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                 <ChevronRight className="text-slate-700" size={20} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
