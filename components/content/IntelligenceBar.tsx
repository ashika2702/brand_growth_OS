"use client";

import React, { useState, useEffect } from 'react';
import { Lightbulb, ChevronRight, Sparkles } from 'lucide-react';

export default function IntelligenceBar({ clientId }: { clientId: string }) {
  const [tips, setTips] = useState<string[]>([
    "Pain hooks outperform all formats for this client.",
    "Best CTA for Reels: 'Call us today' for maximum lead conversion.",
    "Avoid: Long introductions in Facebook Ads; get straight to the pain point."
  ]);
  const [activeTipIndex, setActiveTipIndex] = useState(0);

  useEffect(() => {
    const fetchTips = async () => {
        if (!clientId) return;
        try {
            const res = await fetch(`/api/content/intelligence?clientId=${clientId}`);
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setTips(data);
            }
        } catch (e) {
            console.error('Failed to fetch tips');
        }
    };
    fetchTips();
  }, [clientId]);

  useEffect(() => {
    if (tips.length <= 1) return;
    const timer = setInterval(() => {
        setActiveTipIndex((prev) => (prev + 1) % tips.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [tips.length]);

  return (
    <div className="h-14 bg-surface-1/40 border-t border-border-1 backdrop-blur-3xl flex items-center px-8 justify-between shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-2 px-3 py-1 bg-accent-blue/10 border border-accent-blue/20 rounded-full">
            <Lightbulb size={12} className="text-accent-blue" />
            <span className="text-[10px] font-black uppercase tracking-widest text-accent-blue">Content Intelligence</span>
        </div>
        
        <div className="h-4 w-[1px] bg-border-1" />

        <div className="relative flex-1 overflow-hidden h-6">
            <div 
                className="absolute inset-0 flex items-center transition-all duration-1000 ease-in-out"
                style={{ transform: `translateY(-${activeTipIndex * 100}%)` }}
            >
                {tips.map((tip, i) => (
                    <div key={i} className="h-full flex items-center h-6 py-10">
                        <p className="text-[11px] font-medium text-text-muted italic">
                            &ldquo;{tip}&rdquo;
                        </p>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-text-dim">
            Source: Business Brain
            <ChevronRight size={12} />
        </div>
      </div>
    </div>
  );
}
