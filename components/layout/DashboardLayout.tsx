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
        ? 'bg-accent-blue/10 text-accent-blue'
        : 'text-slate-500 hover:text-slate-200'
      }`}
  >
    {/* Left Indicator */}
    {active && (
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-blue rounded-r-full shadow-[0_0_10px_rgba(62,128,255,0.5)]" />
    )}

    <span className={`transition-colors shrink-0 ${active ? 'text-accent-blue' : 'text-slate-500 group-hover:text-slate-300'}`}>
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
    <div className="flex h-screen bg-black font-sans text-slate-300 selection:bg-blue-500/30 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`h-full bg-black border-r border-[#1F1F1F] z-50 flex flex-col transition-all duration-300 ease-in-out shrink-0 ${isCollapsed ? 'w-20' : 'w-64'
          }`}
      >
        {/* Branding */}
        <div className={`flex items-center gap-2 mb-8 mt-6 px-6 ${isCollapsed ? 'justify-center px-0' : ''}`}>
          <div className="w-4 h-4 bg-accent-blue rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(62,128,255,0.4)] shrink-0">
            <Zap className="text-white w-5 h-5 fill-current" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-black tracking-tighter text-white italic whitespace-nowrap">Brand Growth<span className="text-accent-blue">OS</span></span>
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
        <div className="mt-auto border-t border-[#1F1F1F] p-4 space-y-4">
          {!isCollapsed && (
            <div className="bg-[#0D0D0D] p-4 rounded-2xl border border-[#1F1F1F] group cursor-pointer hover:border-blue-500/40 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
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
            className="w-full py-2.5 bg-[#0D0D0D] hover:bg-[#141414] text-slate-500 hover:text-white rounded-xl border border-[#1F1F1F] transition-all flex items-center justify-center group"
          >
            {isCollapsed ? <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" /> : <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-black border-b border-[#1F1F1F] z-40 px-8 flex items-center justify-between gap-8 shrink-0">
          <div className="flex items-center gap-6 flex-1">
            <ClientSwitcher />
            <div className="relative w-80 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={14} />
              <input
                type="text"
                placeholder="Search intelligence..."
                className="w-full bg-[#0D0D0D] border border-[#1F1F1F] focus:border-blue-500/50 rounded-lg py-1.5 pl-9 pr-3 text-[11px] outline-none transition-all placeholder:text-slate-600 text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse shadow-[0_0_8px_rgba(55,214,122,0.5)]"></div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">System Online</span>
            </div>
            <NotificationCenter />
            <div className="flex items-center gap-3 pl-4 border-l border-[#1F1F1F] h-8">
              <div className="text-right hidden xl:block">
                <p className="text-[10px] font-black text-white leading-tight uppercase tracking-tight">Alex Growth</p>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">Architect</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-orange p-[1px]">
                <div className="w-full h-full rounded-lg bg-black flex items-center justify-center font-black text-[10px] text-blue-400">AG</div>
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
