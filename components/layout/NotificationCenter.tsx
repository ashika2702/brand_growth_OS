"use client";

import React, { useState, useEffect } from 'react';
import { Bell, Check, Info, AlertTriangle, XCircle, ExternalLink, Inbox } from 'lucide-react';
import { useClientStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { useToast } from './ToastProvider';
import Link from 'next/link';

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
  const { addToast } = useToast();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    if (!activeClientId) return;
    try {
      const res = await fetch(`/api/notifications?clientId=${activeClientId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Supabase Real-time Subscription
    if (activeClientId) {
        const channel = supabase
          .channel('schema-db-changes')
          .on(
            'postgres_changes',
            { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'Notification',
                filter: `clientId=eq.${activeClientId}`
            },
            (payload) => {
               const newNotif = payload.new as Notification;
               setNotifications(prev => [newNotif, ...prev]);
               
               // Show Global Toast
               addToast({
                 type: newNotif.priority === 'urgent' ? 'error' : newNotif.priority === 'high' ? 'warning' : 'info',
                 title: newNotif.title,
                 message: newNotif.message
               });
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
    }
  }, [activeClientId]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark read');
    }
  };

  const markAllRead = async () => {
     try {
         // Batch local update for speed
         setNotifications(notifications.map(n => ({ ...n, isRead: true })));
         // Trigger bulk API if available
     } catch (e) {}
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 bg-[#111111] transition-all border border-[#1F1F1F] rounded-xl group backdrop-blur-md
          ${unreadCount > 0 ? 'text-accent-orange border-accent-orange/20 bg-accent-orange/5 shadow-[0_0_15px_rgba(255,100,0,0.1)]' : 'text-slate-500 hover:text-white'}
        `}
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-wiggle' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-accent-orange text-white text-[9px] font-black rounded-full border-2 border-black flex items-center justify-center shadow-[0_0_10px_rgba(255,77,0,0.5)]">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-[#0A0A0A]/95 rounded-2xl border border-[#1F1F1F] shadow-2xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 backdrop-blur-3xl">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <div className="flex items-center gap-2 text-white">
                <Inbox size={14} className="text-accent-blue" />
                <h3 className="font-black text-[10px] uppercase tracking-widest ">Recent Alerts</h3>
            </div>
            <button 
                onClick={markAllRead}
                className="text-[10px] text-slate-500 font-black uppercase tracking-widest hover:text-white transition-colors"
            >
                Mark all read
            </button>
          </div>

          <div className="max-h-[450px] overflow-y-auto no-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-12 text-center text-slate-600">
                <Info size={32} className="mx-auto mb-4 opacity-10" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">All Systems Nominal</p>
              </div>
            ) : (
              notifications.slice(0, 5).map(n => (
                <div
                  key={n.id}
                  className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group ${!n.isRead ? 'bg-accent-orange/5' : ''}`}
                  onClick={() => markAsRead(n.id)}
                >
                  <div className="flex gap-4">
                    <div className={`mt-1 p-2 rounded-lg transition-colors ${!n.isRead ? 'text-accent-orange bg-accent-orange/10' : 'text-slate-500 bg-black/40'}`}>
                      {n.type === 'lead.new' ? <Users size={14} /> : <Info size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <h4 className={`text-xs font-black truncate ${!n.isRead ? 'text-white' : 'text-slate-500'}`}>{n.title}</h4>
                        <span className="text-[8px] text-slate-700 font-bold uppercase whitespace-nowrap">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2">{n.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <Link href={`/notifications`} onClick={() => setIsOpen(false)} className="block w-full py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white hover:bg-white/5 transition-all border-t border-white/5">
            View All Action Centre
          </Link>
        </div>
      )}
    </div>
  );
}

// Minimal Users icon for the notification item
function Users({ className, size }: { className?: string, size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
