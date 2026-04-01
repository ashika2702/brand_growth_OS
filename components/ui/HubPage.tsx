import React from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Module {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}

interface HubPageProps {
  title: string;
  description: string;
  modules: Module[];
}

export default function HubPage({ title, description, modules }: HubPageProps) {
  return (
    <div className="h-full flex flex-col gap-8">
      <div className="space-y-1">
        <h1 className="text-[22px] font-black text-text-primary tracking-tighter uppercase italic transition-colors">{title}</h1>
        <p className="text-text-muted font-medium text-sm transition-colors">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module, i) => (
          <Link 
            key={i} 
            href={module.href}
            className="group relative glass-card p-8 rounded-[2.5rem] hover:border-accent-orange/50 transition-all duration-700 cursor-pointer overflow-hidden"
          >
            {/* Hover Glow */}
            <div className={`absolute -right-8 -top-8 w-48 h-48 rounded-full opacity-0 group-hover:opacity-20 transition-opacity blur-[80px] ${module.color}`} />
            
            {/* Inner Gradient Mesh */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="flex flex-col gap-6 relative z-10">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${module.color.replace('bg-', 'bg-')}/10 shadow-2xl backdrop-blur-md border border-white/5 transition-colors`}>
                {React.cloneElement(module.icon as React.ReactElement<{ size: number, className?: string }>, { size: 28, className: module.color.replace('bg-', 'text-') })}
              </div>
              
              <div>
                <h3 className="text-[15px] font-black text-text-primary uppercase tracking-tight mb-1 group-hover:text-accent-orange transition-colors">
                  {module.title}
                </h3>
                <p className="text-xs text-text-muted font-medium leading-relaxed transition-colors">
                  {module.description}
                </p>
              </div>

              <div className="pt-4 mt-auto flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-text-dim group-hover:text-accent-orange transition-colors">Launch Module</span>
                <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center group-hover:bg-accent-orange group-hover:text-white transition-all">
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
