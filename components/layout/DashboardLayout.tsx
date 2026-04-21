'use client';

import React, { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  Brain,
  Target,
  Users,
  Settings,
  Zap,
  Search,
  Bell,
  LogOut,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
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
  ShieldCheck,
  ChartNoAxesCombined
} from 'lucide-react';
import { useClientStore } from '@/lib/store';
import ClientSwitcher from './ClientSwitcher';
import NotificationCenter from './NotificationCenter';
import ThemeToggle from './ThemeToggle';

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  isCollapsed: boolean;
  hasChildren?: boolean;
  isOpen?: boolean;
  onToggle?: (e: React.MouseEvent) => void;
}

const SidebarItem = ({ href, icon, label, active, isCollapsed, hasChildren, isOpen, onToggle }: SidebarItemProps) => (
  <Link
    href={href}
    className={`flex items-center gap-3 py-2 transition-all duration-300 relative group ${isCollapsed ? 'px-0 justify-center' : 'px-5'
      } ${active
        ? 'bg-accent-blue/10 text-accent-blue'
        : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
      }`}
  >
    {/* Left Indicator - Pill Style */}
    {active && (
      <div className="absolute left-0 top-1 bottom-1 w-1.5 bg-accent-blue rounded-r-full shadow-[0_0_12px_rgba(62,128,255,0.4)]" />
    )}

    <span className={`transition-all duration-300 shrink-0 ${active ? 'text-accent-blue scale-110 drop-shadow-[0_0_8px_rgba(62,128,255,0.3)]' : 'text-slate-400 group-hover:text-slate-100 group-hover:scale-105'}`}>
      {React.cloneElement(icon as React.ReactElement<{ size: number }>, { size: 18 })}
    </span>

    {!isCollapsed && (
      <>
        <span className={`font-bold text-[10px] uppercase tracking-[0.15em] whitespace-nowrap overflow-hidden transition-all duration-300 ${active ? 'translate-x-1' : 'group-hover:translate-x-0.5'}`}>
          {label}
        </span>
        {hasChildren && (
          <div 
            onClick={onToggle}
            className="ml-auto p-1 hover:bg-white/5 rounded-md transition-colors"
          >
            {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </div>
        )}
      </>
    )}
  </Link>
);

const SidebarSubItem = ({ href, label, active, isCollapsed }: { href: string, label: string, active: boolean, isCollapsed: boolean }) => (
  <Link
    href={href}
    className={`flex items-center gap-3 py-2 pl-12 transition-all duration-300 relative group ${isCollapsed ? 'hidden' : ''
      } ${active
        ? 'text-accent-blue'
        : 'text-slate-500 hover:text-slate-200'
      }`}
  >
    {/* Connector Line */}
    <div className="absolute left-7 top-0 bottom-0 w-[1px] bg-white/5" />
    {active && (
        <div className="absolute left-7 top-1/2 -translate-y-1/2 w-2 h-[1px] bg-accent-blue" />
    )}
    
    <span className={`font-bold text-[9px] uppercase tracking-[0.1em] whitespace-nowrap overflow-hidden transition-all duration-300 ${active ? 'translate-x-1' : 'group-hover:translate-x-0.5'}`}>
      {label}
    </span>
  </Link>
);

const NavSection = ({ title, isCollapsed, children }: { title: string, isCollapsed: boolean, children: React.ReactNode }) => (
  <div className="mb-6">
    {!isCollapsed && (
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-700 mb-2 px-6">{title}</p>
    )}
    <div className="space-y-0.5">
      {children}
    </div>
  </div>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { activeClientId } = useClientStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(pathname.includes('/analytics') || pathname.includes('/intelligence'));

  return (
    <div className="flex h-screen bg-surface-1 font-sans text-text-secondary selection:bg-blue-500/30 overflow-hidden transition-colors duration-500">
      <Script src="https://js.puter.com/v2/" strategy="afterInteractive" />
      {/* Sidebar */}
      <aside
        className={`h-full bg-black border-r border-[#1F1F1F] z-50 flex flex-col transition-all duration-300 ease-in-out shrink-0 ${isCollapsed ? 'w-20' : 'w-64'
          }`}
      >
        {/* Branding */}
        <div className={`flex items-center gap-3 mb-10 mt-6 px-6 ${isCollapsed ? 'justify-center px-0' : ''}`}>
          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.5)] shrink-0 group relative overflow-hidden transition-all duration-500 hover:scale-110 hover:border-accent-blue/30 active:scale-95">
            {/* Neural Pulse Inner Glow */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-accent-blue/40 to-transparent" />
            <ChartNoAxesCombined className="text-accent-blue w-4.5 h-4.5 transition-all duration-500 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(45,140,255,0.4)]" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold tracking-tighter text-white whitespace-nowrap transition-colors">Brand Growth<span className="text-accent-blue">OS</span></span>
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
            href="/brain"
            icon={<Brain />}
            label="Agents"
            active={pathname.includes('/brain')}
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            href={activeClientId ? `/crm/${activeClientId}` : '/crm'}
            icon={<Users />}
            label="CRM"
            active={pathname.includes('/crm')}
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            href="/content/tap"
            icon={<Sparkles />}
            label="Content Tap"
            active={pathname.includes('/content/tap')}
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            href={activeClientId ? `/seo/${activeClientId}` : '/seo'}
            icon={<Search />}
            label="SEO"
            active={pathname.includes('/seo')}
            isCollapsed={isCollapsed}
          />
          <div className="space-y-0.5">
            <SidebarItem
                href={activeClientId ? `/intelligence/${activeClientId}/analytics` : '/intelligence'}
                icon={<BarChart3 />}
                label="Analytics"
                active={pathname.includes('/intelligence') || pathname.includes('/analytics')}
                isCollapsed={isCollapsed}
                hasChildren={true}
                isOpen={isAnalyticsOpen}
                onToggle={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsAnalyticsOpen(!isAnalyticsOpen);
                }}
            />
            
            {/* Analytics Sub Menu */}
            {isAnalyticsOpen && !isCollapsed && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                    <SidebarSubItem 
                        href={activeClientId ? `/intelligence/${activeClientId}/analytics/realtime` : '/intelligence'} 
                        label="Realtime Overview" 
                        active={pathname.includes('/analytics/realtime')} 
                        isCollapsed={isCollapsed} 
                    />
                    <SidebarSubItem 
                        href={activeClientId ? `/intelligence/${activeClientId}/analytics?view=acquisition` : '/intelligence'} 
                        label="Acquisition" 
                        active={pathname.includes('/analytics') && searchParams.get('view') === 'acquisition'} 
                        isCollapsed={isCollapsed} 
                    />
                    <SidebarSubItem 
                        href={activeClientId ? `/intelligence/${activeClientId}/analytics?view=traffic_acquisition` : '/intelligence'} 
                        label="Traffic Acquisition" 
                        active={pathname.includes('/analytics') && searchParams.get('view') === 'traffic_acquisition'} 
                        isCollapsed={isCollapsed} 
                    />
                </div>
            )}
          </div>

          <div className="pt-8 border-t border-white/5 mt-8">
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
        <div className="mt-auto border-t border-white/5 p-4 space-y-4">
          {/* Puter Account Management */}


          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl border border-white/10 transition-all flex items-center justify-center group"
          >
            {isCollapsed ? <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" /> : <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-surface-1 border-b border-border-1 z-40 px-6 flex items-center justify-between gap-6 shrink-0 transition-all duration-500 shadow-[0_1px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-6 flex-1">
            <ClientSwitcher />
            <div className="relative w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-blue transition-colors" size={12} />
              <input
                type="text"
                placeholder="Search intelligence..."
                className="w-full bg-surface-2 border border-border-1 focus:border-accent-blue/30 rounded-lg py-1.5 pl-8 pr-3 text-[10px] font-bold outline-none transition-all placeholder:text-text-muted text-text-primary focus:bg-surface-3 focus:shadow-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <ThemeToggle />
            <NotificationCenter />
            <div className="flex items-center gap-3 pl-4 border-l border-border-1 h-6">
              <div className="text-right hidden xl:block">
                <p className="text-[9px] font-bold text-text-primary leading-tight uppercase tracking-widest">Alex Growth</p>
                <p className="text-[7px] text-text-muted font-bold uppercase tracking-widest opacity-80">Architect</p>
              </div>
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-orange p-[1px] shadow-lg shadow-accent-blue/5">
                <div className="w-full h-full rounded-[7px] bg-surface-1 flex items-center justify-center font-bold text-[10px] text-accent-blue">AG</div>
                {/* Active Indicator Pips */}
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-accent-green rounded-full border-[2px] border-surface-1 shadow-[0_0_8px_rgba(62,255,128,0.4)] animate-pulse" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <section className="flex-1 overflow-hidden p-4 animate-in fade-in duration-1000">
          {children}
        </section>
      </main>
    </div>
  );
}
