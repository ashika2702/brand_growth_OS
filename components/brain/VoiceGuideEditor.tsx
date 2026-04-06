'use client';

import React from 'react';
import { 
  MessageSquare, 
  Terminal, 
  CheckCircle2, 
  XCircle,
  Hash,
  Sparkles
} from 'lucide-react';

interface VoiceGuide {
  tone: string;
  adjectives: string[];
  vocab_do: string[];
  vocab_dont: string[];
  samples: string[];
}

interface VoiceGuideEditorProps {
  value: VoiceGuide;
  onChange: (value: VoiceGuide) => void;
}

export default function VoiceGuideEditor({ value, onChange }: VoiceGuideEditorProps) {
  const updateField = (field: keyof VoiceGuide, newVal: any) => {
    onChange({ ...value, [field]: newVal });
  };

  const addItem = (field: 'adjectives' | 'vocab_do' | 'vocab_dont', item: string) => {
    if (!item.trim()) return;
    updateField(field, [...(value[field] || []), item]);
  };

  const removeItem = (field: 'adjectives' | 'vocab_do' | 'vocab_dont', idx: number) => {
    updateField(field, value[field].filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Tone Selection */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent-blue ml-1 transition-colors">
          <MessageSquare size={12} /> Core Tone of Voice
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['Professional', 'Casual', 'Direct', 'Enthusiastic'].map((tone) => (
            <button
              key={tone}
              onClick={() => updateField('tone', tone)}
              className={`p-4 rounded-2xl border text-[11px] font-black uppercase tracking-wider transition-all ${
                value.tone === tone 
                ? 'bg-accent-blue/20 border-accent-blue text-accent-blue shadow-[0_0_20px_rgba(62,128,255,0.2)]' 
                : 'bg-surface-2 border-border-1 text-text-secondary hover:border-border-2 hover:bg-surface-3'
              }`}
            >
              {tone}
            </button>
          ))}
        </div>
      </div>

      {/* Vocabulary Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dos */}
        <div className="p-6 bg-surface-2 border border-border-1 rounded-[2rem] space-y-4 backdrop-blur-xl relative overflow-hidden group transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle2 size={40} className="text-accent-green" />
          </div>
          <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary transition-colors flex items-center gap-2">
            <CheckCircle2 size={12} className="text-accent-green" /> Vocabulary "DOs"
          </label>
          <div className="flex flex-wrap gap-2">
            {value.vocab_do.map((word, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-accent-green/10 text-accent-green text-[10px] font-black uppercase tracking-tight rounded-lg border border-accent-green/20 flex items-center gap-2 group/tag transition-colors">
                {word}
                <button onClick={() => removeItem('vocab_do', idx)} className="hover:text-text-primary transition-colors">
                  <XCircle size={10} />
                </button>
              </span>
            ))}
            <input 
              onKeyDown={(e) => { if(e.key === 'Enter') { addItem('vocab_do', (e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ''; } }}
              placeholder="Add word..."
              className="bg-transparent border-none outline-none text-[10px] font-medium text-text-primary placeholder:text-text-dim w-24"
            />
          </div>
        </div>

        {/* Don'ts */}
        <div className="p-6 bg-surface-2 border border-border-1 rounded-[2rem] space-y-4 backdrop-blur-xl relative overflow-hidden group transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <XCircle size={40} className="text-accent-red" />
          </div>
          <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary transition-colors flex items-center gap-2">
            <XCircle size={12} className="text-accent-red" /> Vocabulary "DONTs"
          </label>
          <div className="flex flex-wrap gap-2">
            {value.vocab_dont.map((word, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-accent-red/10 text-accent-red text-[10px] font-black uppercase tracking-tight rounded-lg border border-accent-red/20 flex items-center gap-2 group/tag transition-colors">
                {word}
                <button onClick={() => removeItem('vocab_dont', idx)} className="hover:text-text-primary transition-colors">
                  <XCircle size={10} />
                </button>
              </span>
            ))}
            <input 
              onKeyDown={(e) => { if(e.key === 'Enter') { addItem('vocab_dont', (e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ''; } }}
              placeholder="Add word..."
              className="bg-transparent border-none outline-none text-[10px] font-medium text-text-primary placeholder:text-text-dim w-24"
            />
          </div>
        </div>
      </div>

      {/* Adjectives & Style */}
      <div className="p-6 bg-surface-2 border border-border-1 rounded-[2rem] space-y-4 backdrop-blur-xl transition-colors">
        <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary transition-colors flex items-center gap-2">
          <Sparkles size={12} className="text-accent-yellow" /> Brand Adjectives
        </label>
        <p className="text-[10px] text-text-secondary font-medium transition-colors">Add 3-5 adjectives that describe your brand's aesthetic and personality.</p>
        <div className="flex flex-wrap gap-2">
          {value.adjectives.map((adj, idx) => (
            <span key={idx} className="px-4 py-2 bg-surface-3 text-text-secondary text-[10px] font-black uppercase tracking-[0.1em] rounded-xl border border-border-1 hover:border-accent-yellow/50 transition-all flex items-center gap-2">
              <Hash size={10} className="text-accent-yellow" />
              {adj}
              <button onClick={() => removeItem('adjectives', idx)} className="hover:text-red-500 transition-colors">
                <XCircle size={10} />
              </button>
            </span>
          ))}
          <input 
            onKeyDown={(e) => { if(e.key === 'Enter') { addItem('adjectives', (e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ''; } }}
            placeholder="e.g. Minimalist, Gritty, Vibrant..."
            className="flex-1 bg-surface-3 border border-border-1 rounded-xl px-4 py-2 text-[10px] font-medium text-text-primary outline-none focus:border-border-2 transition-all placeholder:text-text-dim"
          />
        </div>
      </div>

      {/* Sample Correction */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1 transition-colors">
          <Terminal size={12} /> A6 Training Sample
        </label>
        <textarea
          placeholder="Paste a sample of your best-performing copy here. The AI will use this as the master reference for all future generations."
          className="w-full bg-surface-2 border border-border-1 rounded-[2rem] p-6 text-xs h-32 outline-none focus:border-accent-blue/50 focus:bg-surface-3 transition-all text-text-primary placeholder:text-text-dim leading-relaxed font-medium"
          value={value.samples[0] || ''}
          onChange={(e) => updateField('samples', [e.target.value])}
        />
      </div>
    </div>
  );
}
