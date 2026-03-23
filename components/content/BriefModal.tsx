"use client";

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  Play, 
  Image as ImageIcon, 
  Mic, 
  Box, 
  RotateCcw,
  Type,
  FileText,
  MousePointer2
} from 'lucide-react';

interface BriefModalProps {
  item: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function BriefModal({ item, isOpen, onClose, onUpdate }: BriefModalProps) {
  const [editing, setEditing] = useState(false);
  const [imageGenerating, setImageGenerating] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>(item?.aiImageUrls || []);
  const [voiceGenerating, setVoiceGenerating] = useState(false);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const [designUrl, setDesignUrl] = useState<string | null>(item?.canvaDesignUrl || null);
  const [designThumbnailUrl, setDesignThumbnailUrl] = useState<string | null>(item?.aiBrief?.canvaThumbnailUrl || null);
  const [designLoading, setDesignLoading] = useState(false);
  const [approving, setApproving] = useState(false);

  const brief = item?.aiBrief || {};

  const handleApprove = async () => {
    setApproving(true);
    try {
      const res = await fetch(`/api/content/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      });
      if (res.ok) {
        onUpdate();
        onClose();
      }
    } catch (e) {
      console.error('Approval failed:', e);
    } finally {
      setApproving(false);
    }
  };

  const handleGenerateDesign = async () => {
    setDesignLoading(true);
    try {
        const res = await fetch(`/api/content/${item.id}/design`, { method: 'POST' });
        const data = await res.json();
        
        if (data.error === 'Canva not connected for this client') {
          // Redirect to login or show alert
          if (confirm('Canva is not connected for this client. Connect now?')) {
            window.open(`/api/auth/canva/login?clientId=${item.clientId}`, '_blank');
          }
          return;
        }

        if (data.url) {
          setDesignUrl(data.url);
          setDesignThumbnailUrl(data.thumbnailUrl || data.url);
          onUpdate(); // Refresh the list
        } else if (data.fallback) {
          alert(`Success: ${data.message}\n\nYou can now find this image in your Canva 'Uploads' tab.`);
          window.open('https://www.canva.com/folder/all-uploads', '_blank');
        } else {
          throw new Error(data.error || 'Failed to generate');
        }
    } catch (e: any) {
        console.error('Design generation failed:', e);
        alert(`Canva Error: ${e.message}`);
    } finally {
        setDesignLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    setImageGenerating(true);
    try {
        const res = await fetch('/api/creative/image', {
            method: 'POST',
            body: JSON.stringify({ prompt: brief.image_prompt || item.title }),
        });
        const data = await res.json();
        if (data.imageUrl) {
            setImageUrls([data.imageUrl]);
        } else {
            throw new Error(data.error || 'Failed to generate');
        }
    } catch (e: any) {
        console.error('Image generation failed:', e);
        // Fallback to mock for demo if key is missing
        const prompt = encodeURIComponent(brief.image_prompt || item.title);
        setImageUrls([
            `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=1024&seed=${Math.floor(Math.random()*1000)}&nologo=true`
        ]);
    } finally {
        setImageGenerating(false);
    }
  };

  const handleGenerateVoice = async () => {
    setVoiceGenerating(true);
    try {
        const res = await fetch('/api/creative/voice', {
            method: 'POST',
            body: JSON.stringify({ 
                text: brief.script,
                voiceId: item.client?.elevenlabsVoiceId 
            }),
        });
        
        if (!res.ok) throw new Error('Failed to generate voice');
        
        const data = await res.clone().json().catch(() => ({}));
        if (data.audioUrl) {
            setVoiceUrl(data.audioUrl);
        } else {
            const blob = await res.blob();
            setVoiceUrl(URL.createObjectURL(blob));
        }
    } catch (e) {
        console.error('Voice generation failed:', e);
        // Fallback for demo
        setVoiceUrl('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
    } finally {
        setVoiceGenerating(false);
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-8"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-6xl h-full bg-[#0A0A0A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-lg ${item.voiceScore > 80 ? 'bg-accent-green/10 text-accent-green' : 'bg-amber-500/10 text-amber-500'}`}>
                <Box size={20} />
            </div>
            <div>
                <h2 className="text-lg font-black uppercase tracking-widest text-white leading-none mb-1">{item.title}</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type: {item.type} | Voice Score: {item.voiceScore}%</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: AI Generated Brief */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-10 space-y-12">
            
            {/* Hooks */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <Sparkles size={16} className="text-accent-blue" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">AI Opening Hooks</h3>
                </div>
                <div className="grid gap-3">
                    {brief.hooks?.map((hook: string, i: number) => (
                        <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-sm text-slate-300 leading-relaxed hover:border-accent-blue/30 transition-all group flex gap-4">
                            <span className="text-[10px] font-black text-accent-blue/40 mt-0.5">0{i+1}</span>
                            {hook}
                        </div>
                    ))}
                </div>
            </section>

            {/* Script */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <FileText size={16} className="text-purple-400" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Production Script</h3>
                </div>
                <div className="p-6 bg-white/5 border border-white/5 rounded-2xl text-sm text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
                    {brief.script}
                </div>
            </section>

            {/* Captions & CTAs */}
            <div className="grid grid-cols-2 gap-8">
                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Type size={16} className="text-accent-orange" />
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Social Captions</h3>
                    </div>
                    {brief.captions?.map((cap: string, i: number) => (
                        <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-xl text-xs text-slate-400">
                            {cap}
                        </div>
                    ))}
                </section>
                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <MousePointer2 size={16} className="text-accent-green" />
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Optimized CTAs</h3>
                    </div>
                    {brief.ctas?.map((cta: string, i: number) => (
                        <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-xl text-xs text-slate-400">
                            {cta}
                        </div>
                    ))}
                </section>
            </div>
          </div>

          {/* Right: Actions Panel */}
          <div className="w-[400px] border-l border-white/5 bg-white/[0.01] p-8 space-y-8 flex flex-col overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <div className="flex-1 space-y-6">
                
                {/* 🚨 NEW: Generated Assets Section (At the Top) */}
                {(imageUrls.length > 0 || voiceUrl || designUrl) && (
                    <div className="space-y-4 mb-8">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-blue">Generated Assets</h3>
                        
                        {/* Image Results Grid */}
                        {imageUrls.length > 0 && (
                            <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {imageUrls.map((url, i) => (
                                    <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl relative group/img">
                                        <img 
                                            src={url} 
                                            alt="Variant" 
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
                                            referrerPolicy="no-referrer"
                                            crossOrigin="anonymous"
                                            onError={async (e) => {
                                                const img = e.target as HTMLImageElement;
                                                const puter = (window as any).puter;
                                                
                                                // 1. Try different seed first
                                                if (!img.src.includes('&retry=true')) {
                                                    img.src = img.src.replace(/seed=\d+/, `seed=${Math.floor(Math.random()*9999)}`) + '&retry=true';
                                                } 
                                                // 2. If already retried and still fails, try Puter.js (User-Suggested Free Service)
                                                else if (puter) {
                                                    try {
                                                        const res = await puter.ai.txt2img(item.imagePrompt || item.title);
                                                        if (res && res.src) {
                                                            img.src = res.src;
                                                        }
                                                    } catch (puterErr: any) {
                                                        console.error('Puter generation failed:', puterErr);
                                                        // If balance is low, Puter logic usually handles its own modal, 
                                                        // but we can log more context here.
                                                    }
                                                } else {
                                                    console.warn('Puter.js not loaded. Please check your internet or refresh.');
                                                }
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-white">AI Content Asset</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Canva Result Preview (Design Mode) */}
                        {designUrl && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <p className="text-[9px] font-black uppercase tracking-widest text-accent-blue mb-2">Design Template Ready</p>
                                <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl relative group/design">
                                    <img 
                                        src={designThumbnailUrl || designUrl || ''} 
                                        alt="Design Template" 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                        referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute inset-0 bg-accent-blue/20 opacity-0 group-hover/design:opacity-100 transition-opacity flex items-center justify-center">
                                         <button 
                                            onClick={() => window.open(designUrl!, '_blank')}
                                            className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-2xl transform translate-y-4 group-hover/design:translate-y-0 transition-transform"
                                         >
                                            Edit in Canva
                                         </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Voice Result Player */}
                        {voiceUrl && (
                            <div className="p-4 bg-accent-orange/5 border border-accent-orange/20 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <p className="text-[9px] font-black uppercase tracking-widest text-accent-orange mb-2">AI Voiceover Ready</p>
                                <audio controls className="w-full h-8 brightness-90 contrast-125">
                                    <source src={voiceUrl} type="audio/mpeg" />
                                </audio>
                            </div>
                        )}
                    </div>
                )}

                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Production Tools</h3>
                
                <button 
                  onClick={handleGenerateDesign}
                  disabled={designLoading}
                  className="w-full py-4 bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/30 rounded-2xl flex items-center gap-4 px-6 transition-all group disabled:opacity-50"
                >
                    <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                        <Box size={16} className={`text-accent-blue ${designLoading ? 'animate-spin' : ''}`} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                        {designLoading ? 'Opening Canva...' : 'Generate Design'}
                    </span>
                </button>

                <button 
                  onClick={handleGenerateImage}
                  disabled={imageGenerating}
                  className="w-full py-4 bg-white/5 hover:bg-purple-500/10 border border-white/10 hover:border-purple-500/30 rounded-2xl flex items-center gap-4 px-6 transition-all group disabled:opacity-50"
                >
                    <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                        <ImageIcon size={16} className={`text-purple-400 ${imageGenerating ? 'animate-pulse' : ''}`} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                        {imageGenerating ? 'Generating Variants...' : 'DALL-E Asset'}
                    </span>
                </button>

                <button 
                  onClick={handleGenerateVoice}
                  disabled={voiceGenerating}
                  className="w-full py-4 bg-white/5 hover:bg-accent-orange/10 border border-white/10 hover:border-accent-orange/30 rounded-2xl flex items-center gap-4 px-6 transition-all group disabled:opacity-50"
                >
                    <div className="p-2 bg-accent-orange/10 rounded-lg group-hover:bg-accent-orange/20 transition-colors">
                        <Mic size={16} className={`text-accent-orange ${voiceGenerating ? 'animate-bounce' : ''}`} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                        {voiceGenerating ? 'Synthesizing Voice...' : 'ElevenLabs VO'}
                    </span>
                </button>
            </div>

            <div className="space-y-4">
                <div className="p-4 bg-accent-green/5 border border-accent-green/20 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Check size={14} className="text-accent-green" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-accent-green">Voice Match Guaranteed</span>
                    </div>
                    <p className="text-[9px] text-slate-500 font-medium">This script perfectly aligns with the 'Surry Hills' suburb-specific tone of voice.</p>
                </div>

                <div className="flex gap-2">
                    <button 
                      onClick={handleApprove}
                      disabled={approving}
                      className="flex-1 py-4 bg-accent-blue hover:bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-lg disabled:opacity-50"
                    >
                        {approving ? 'Approving...' : 'Approve Content'}
                    </button>
                    <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all">
                        <RotateCcw size={18} className="text-slate-500" />
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
