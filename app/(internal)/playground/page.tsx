'use client';

import React, { useState } from 'react';
import { Zap, Send, Server, User, Sparkles } from 'lucide-react';
import { useClientStore } from '@/lib/store';

export default function AIPlayground() {
  const [prompt, setPrompt] = useState('Who are you and what do you know about my brand?');
  const [provider, setProvider] = useState<'claude' | 'llama' | 'nemoclaw'>('nemoclaw');
  const { activeClientId } = useClientStore();
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testCall = async () => {
    if (!activeClientId) {
      setResult({ error: 'Please select a client from the topbar first.' });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          prompt,
          userId: 'test_user_id',
          clientId: activeClientId,
          moduleName: 'Playground'
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: 'Failed to reach API' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* Header Area */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-accent-orange/10 flex items-center justify-center text-accent-orange border border-accent-orange/20">
              <Sparkles size={24} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase italic text-shadow-glow">Context Playground</h1>
          </div>
          <p className="text-slate-500 font-medium">Verify real-time neural context injection across LLM clusters.</p>
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setProvider('claude')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${provider === 'claude'
                ? 'bg-accent-orange text-white shadow-[0_0_15px_rgba(255,77,0,0.4)]'
                : 'text-slate-500 hover:text-white'
              }`}
          >
            Claude 3.5 Sonnet
          </button>
          <button
            onClick={() => setProvider('llama')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${provider === 'llama'
                ? 'bg-accent-orange text-white shadow-[0_0_15px_rgba(255,77,0,0.4)]'
                : 'text-slate-500 hover:text-white'
              }`}
          >
            Llama 3.3 70B
          </button>
          <button
            onClick={() => setProvider('nemoclaw')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${provider === 'nemoclaw'
                ? 'bg-accent-orange text-white shadow-[0_0_15px_rgba(255,77,0,0.4)]'
                : 'text-slate-500 hover:text-white'
              }`}
          >
            NemoClaw (Local)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 flex-1 min-h-0">
        {/* Input Panel */}
        <div className="col-span-12 lg:col-span-4 flex flex-col h-full gap-4">
          <div className="glass-card flex-1 p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-accent-orange shadow-[0_0_8px_#FF4D00]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Inference Input</span>
            </div>

            <textarea
              className="flex-1 w-full bg-transparent border-none text-white text-sm outline-none placeholder:text-slate-700 font-medium leading-relaxed resize-none no-scrollbar"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Inject brand instruction or persona query..."
            />

            <div className="pt-6 border-t border-white/5 mt-6">
              <button
                onClick={testCall}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-accent-orange to-accent-red text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,77,0,0.2)]"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Neural Processing...
                  </>
                ) : (
                  <>
                    <Zap size={16} className="fill-current" />
                    Execute Context Test
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="col-span-12 lg:col-span-8 h-full">
          <div className="glass-card h-full rounded-[2.5rem] border border-white/5 flex flex-col overflow-hidden relative">
            <div className="border-b border-white/5 bg-white/5 px-8 py-5 flex justify-between items-center relative z-10">
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-slate-600" />
                  <span className="text-[10px] font-black uppercase text-accent-blue tracking-widest">Active Client Context</span>
                </div>
                <div className="flex items-center gap-2 border-l border-white/5 pl-6">
                  <Server size={14} className="text-slate-600" />
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{result?.model || provider} Endpoint</span>
                </div>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-slate-700" />)}
              </div>
            </div>

            <div className="p-10 flex-1 overflow-y-auto no-scrollbar relative z-10">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-accent-orange/10 flex items-center justify-center text-accent-orange border border-accent-orange/20 animate-pulse">
                    <Zap size={32} />
                  </div>
                  <p className="font-black text-slate-500 animate-pulse tracking-[0.4em] uppercase text-[9px]">Analyzing Neural Latency</p>
                </div>
              ) : result ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  {result.error ? (
                    <div className="p-6 bg-accent-orange/10 border border-accent-orange/20 rounded-2xl text-accent-orange text-[11px] font-black uppercase tracking-widest text-center shadow-inner">
                      {result.error}
                    </div>
                  ) : (
                    <div className="prose prose-invert max-w-none">
                      <p className="text-slate-300 leading-[1.8] font-medium whitespace-pre-wrap text-sm">
                        {result.content}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-slate-700 border border-white/5 group-hover:scale-110 transition-all duration-700">
                    <Send size={28} />
                  </div>
                  <div className="max-w-xs">
                    <h5 className="font-black text-white uppercase text-[10px] tracking-widest mb-2">Awaiting Neural Sequence</h5>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      Initialize a context test to verify model alignment with brand storytelling and persona metrics.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
