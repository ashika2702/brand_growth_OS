"use client";

import React, { useState, useEffect } from 'react';
import { Bell, Check, Info, AlertTriangle, XCircle, ExternalLink } from 'lucide-react';
import { useClientStore } from '@/lib/store';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

export default function NotificationCenter() {
  const { activeClientId } = useClientStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    async function fetchNotifications() {
      if (!activeClientId) return;
      try {
        const res = await fetch(`/api/notifications?clientId=${activeClientId}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setNotifications(data);
        } else {
          setNotifications([]);
        }
      } catch (error) {
        setNotifications([]);
        console.error('Failed to fetch notifications');
      }
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [activeClientId]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark read');
    }
  };

  const priorityColors: Record<string, string> = {
    urgent: 'text-red-600 bg-red-50',
    high: 'text-orange-600 bg-orange-50',
    medium: 'text-blue-600 bg-blue-50',
    low: 'text-slate-500 bg-slate-50'
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-[#111111] text-slate-500 hover:text-accent-orange hover:bg-accent-orange/10 rounded-xl transition-all border border-[#1F1F1F] hover:border-accent-orange/30 group backdrop-blur-md"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-accent-orange text-white text-[9px] font-black rounded-full border-2 border-black flex items-center justify-center shadow-[0_0_10px_rgba(255,77,0,0.5)]">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-[#111111] rounded-2xl border border-[#1F1F1F] shadow-2xl shadow-black/80 z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 backdrop-blur-xl">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h3 className="font-black text-[10px] uppercase tracking-widest text-white">Alerts & Notifications</h3>
            <button className="text-[10px] text-accent-orange font-black uppercase tracking-widest hover:text-accent-orange/80 transition-colors">Mark all read</button>
          </div>

          <div className="max-h-[450px] overflow-y-auto no-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                <Info className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="text-xs font-medium italic">All quiet for now...</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group ${!n.isRead ? 'bg-accent-orange/5' : ''}`}
                  onClick={() => markAsRead(n.id)}
                >
                  <div className="flex gap-4">
                    <div className={`mt-1 p-2 rounded-lg transition-colors ${!n.isRead ? 'text-accent-orange bg-accent-orange/10' : 'text-slate-500 bg-white/5'}`}>
                      {n.type === 'lead.new' ? <UsersIcon className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm font-black tracking-tight ${!n.isRead ? 'text-white' : 'text-slate-400'}`}>{n.title}</h4>
                        <span className="text-[9px] text-slate-600 font-black uppercase">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed mb-3">{n.message}</p>

                      <div className="flex items-center gap-2">
                        {n.link && (
                          <a href={n.link} className="text-[10px] font-black uppercase tracking-widest text-accent-orange flex items-center gap-1 hover:text-accent-orange/80 transition-colors">
                            View details
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                        {!n.isRead && (
                          <button className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-400 ml-auto transition-colors">
                            Dismiss
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <button className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white hover:bg-white/5 transition-all border-t border-white/5">
            View All History
          </button>
        </div>
      )}
    </div>
  );
}

// Minimal Users icon for the notification item
function UsersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
