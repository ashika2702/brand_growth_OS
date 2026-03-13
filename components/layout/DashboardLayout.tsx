'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Brain,
  Target,
  Users,
  Settings,
  Zap,
  Search,
  Bell,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  PenTool,
  Activity,
  BarChart3,
  Percent,
  Search as SearchIcon,
  MapPin,
  Sparkles,
  LayoutPanelTop,
  Mail,
  Megaphone,
  Image as ImageIcon,
  ShieldCheck
} from 'lucide-react';
import { useClientStore } from '@/lib/store';
import ClientSwitcher from './ClientSwitcher';
import NotificationCenter from './NotificationCenter';

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  isCollapsed: boolean;
}

const SidebarItem = ({ href, icon, label, active, isCollapsed }: SidebarItemProps) => (
  <Link
    href={href}
    className={`flex items-center gap-3 py-2 transition-all duration-300 relative group ${isCollapsed ? 'px-0 justify-center' : 'px-6'
      } ${active
        ? 'bg-purple-500/10 text-purple-400'
        : 'text-slate-500 hover:text-slate-300'
      }`}
  >
    {/* Left Indicator */}
    {active && (
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 rounded-r-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
    )}

    <span className={`transition-colors shrink-0 ${active ? 'text-purple-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
      {React.cloneElement(icon as React.ReactElement<{ size: number }>, { size: 16 })}
    </span>

    {!isCollapsed && (
      <span className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap overflow-hidden transition-all duration-300">
        {label}
      </span>
    )}
  </Link>
);

const NavSection = ({ title, isCollapsed, children }: { title: string, isCollapsed: boolean, children: React.ReactNode }) => (
  <div className="mb-6">
    {!isCollapsed && (
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 mb-2 px-6">{title}</p>
    )}
    <div className="space-y-0.5">
      {children}
    </div>
  </div>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { activeClientId } = useClientStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#0A0118] font-sans text-slate-300 selection:bg-purple-500/30 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`h-full bg-[#0A0118] border-r border-[#30363D]/20 z-50 flex flex-col transition-all duration-300 ease-in-out shrink-0 ${isCollapsed ? 'w-20' : 'w-64'
          }`}
      >
        {/* Branding */}
        <div className={`flex items-center gap-2 mb-8 mt-6 px-6 ${isCollapsed ? 'justify-center px-0' : ''}`}>
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.4)] shrink-0">
            <Zap className="text-white w-5 h-5 fill-current" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-black tracking-tighter text-white italic whitespace-nowrap">Brand Growth<span className="text-purple-500">OS</span></span>
          )}
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto no-scrollbar py-6 space-y-1">
          <SidebarItem
            href="/dashboard"
            icon={<LayoutDashboard />}
            label="Dashboard"
            active={pathname === '/dashboard'}
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            href="/business"
            icon={<Brain />}
            label="Business"
            active={pathname.includes('/business') || pathname.includes('/brain') || pathname.includes('/crm')}
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            href="/marketing"
            icon={<PenTool />}
            label="Marketing"
            active={pathname.includes('/marketing') || pathname.includes('/content') || pathname.includes('/strategy') || pathname.includes('/workflow')}
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            href="/intelligence"
            icon={<BarChart3 />}
            label="Intelligence"
            active={pathname.includes('/intelligence') || pathname.includes('/analytics') || pathname.includes('/leads')}
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            href="/growth"
            icon={<Sparkles />}
            label="Growth"
            active={pathname.includes('/growth') || pathname.includes('/seo') || pathname.includes('/aeo')}
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            href="/campaign-tools"
            icon={<Megaphone />}
            label="Campaign Tools"
            active={pathname.includes('/campaign-tools') || pathname.includes('/landing-pages') || pathname.includes('/communication') || pathname.includes('/pr')}
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            href="/resources"
            icon={<ImageIcon />}
            label="Resources"
            active={pathname.includes('/resources') || pathname.includes('/assets')}
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            href="/clients"
            icon={<ShieldCheck />}
            label="Clients"
            active={pathname.includes('/clients') || pathname.includes('/portal')}
            isCollapsed={isCollapsed}
          />

          <div className="pt-8 border-t border-[#30363D]/10 mt-8">
            <SidebarItem
              href="/playground"
              icon={<Zap />}
              label="AI Playground"
              active={pathname.includes('/playground')}
              isCollapsed={isCollapsed}
            />
            <SidebarItem
              href="/settings"
              icon={<Settings />}
              label="Settings"
              active={pathname.includes('/settings')}
              isCollapsed={isCollapsed}
            />
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto border-t border-[#30363D]/20 p-4 space-y-4">
          {!isCollapsed && (
            <div className="bg-[#1A0B2E]/50 p-4 rounded-2xl border border-purple-500/20 group cursor-pointer hover:border-purple-500/40 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 group-hover:scale-110 transition-transform">
                  <Zap size={16} fill="currentColor" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-white uppercase tracking-wide">Upgrade Plan</p>
                  <p className="text-[9px] text-slate-500 font-medium whitespace-nowrap overflow-hidden">Unlock advanced features</p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full py-2.5 bg-[#1A0B2E]/50 hover:bg-[#1A0B2E] text-slate-500 hover:text-white rounded-xl border border-[#30363D]/20 transition-all flex items-center justify-center group"
          >
            {isCollapsed ? <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" /> : <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-[#0A0118]/80 backdrop-blur-xl border-b border-[#30363D]/20 z-40 px-8 flex items-center justify-between gap-8 shrink-0">
          <div className="flex items-center gap-6 flex-1">
            <ClientSwitcher />
            <div className="relative w-80 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-purple-500 transition-colors" size={14} />
              <input
                type="text"
                placeholder="Search intelligence..."
                className="w-full bg-[#1A0B2E] border border-[#30363D]/50 focus:border-purple-500/50 rounded-lg py-1.5 pl-9 pr-3 text-[11px] outline-none transition-all placeholder:text-slate-600 text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.5)]"></div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">System Online</span>
            </div>
            <NotificationCenter />
            <div className="flex items-center gap-3 pl-4 border-l border-[#30363D]/50 h-8">
              <div className="text-right hidden xl:block">
                <p className="text-[10px] font-black text-white leading-tight uppercase tracking-tight">Alex Growth</p>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">Architect</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 p-[1px]">
                <div className="w-full h-full rounded-lg bg-[#0A0118] flex items-center justify-center font-black text-[10px] text-purple-400">AG</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <section className="flex-1 overflow-hidden p-6 animate-in fade-in duration-1000">
          {children}
        </section>
      </main>
    </div>
  );
}
