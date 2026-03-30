'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft,
  Rocket
} from 'lucide-react';
import VoiceGuideEditor from './VoiceGuideEditor';

interface Step {
  id: number;
  title: string;
}

const STEPS: Step[] = [
  { id: 1, title: 'Identity' },
  { id: 2, title: 'Personas' },
  { id: 3, title: 'Offers' },
  { id: 4, title: 'Brand Voice' },
  { id: 5, title: 'Confirm' },
];

interface IntakeFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function IntakeForm({ onClose, onSuccess }: IntakeFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientId: `client_${Math.random().toString(36).substr(2, 9)}`,
    clientName: '',
    domain: '',
    personas: [{ id: '1', name: '', description: '', painPoints: [], desires: [] }],
    offers: [{ id: '1', name: '', valueProposition: '', price: '' }],
    onlineChannels: [] as string[],
    offlineChannels: [] as string[],
    constraints: [] as string[],
    voiceGuide: {
      tone: 'Professional',
      adjectives: [] as string[],
      vocab_do: [] as string[],
      vocab_dont: [] as string[],
      samples: [] as string[]
    }
  });

  const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/brain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Stepper */}
      <div className="flex items-center gap-6 mb-10 overflow-x-auto no-scrollbar pb-2">
        {STEPS.map((step, idx) => (
          <React.Fragment key={step.id}>
            <div className={`flex items-center gap-3 shrink-0 transition-all duration-500 ${currentStep >= step.id ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-500 ${
                currentStep >= step.id 
                  ? 'bg-accent-orange text-white border-accent-orange/40 shadow-[0_0_20px_rgba(255,127,0,0.4)]' 
                  : 'bg-white/5 border-white/10 text-slate-500'
              }`}>
                {currentStep > step.id ? <CheckCircle2 size={16} /> : <span className="text-[10px] font-black">{step.id}</span>}
              </div>
              <div className="flex flex-col">
                <span className={`text-[11px] font-black uppercase tracking-tight ${currentStep >= step.id ? 'text-white' : 'text-slate-500'}`}>{step.title}</span>
              </div>
            </div>
            {idx < STEPS.length - 1 && <div className={`h-[1px] w-8 shrink-0 rounded-full transition-all duration-1000 ${currentStep > step.id ? 'bg-accent-orange' : 'bg-white/5'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Form Content */}
      <div className="flex-1 min-h-[400px] flex flex-col relative">
        <div className="flex-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-sm text-slate-500 font-medium">Define the core parameters of the business entity.</p>
              </div>
              <div className="grid gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corporation"
                    className="w-full bg-white/5 border border-white/10 focus:border-accent-orange/50 focus:bg-white/10 rounded-2xl p-4 text-sm outline-none transition-all text-white placeholder:text-slate-700"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Domain URL</label>
                  <input
                    type="url"
                    placeholder="https://acme.com"
                    className="w-full bg-white/5 border border-white/10 focus:border-accent-orange/50 focus:bg-white/10 rounded-2xl p-4 text-sm outline-none transition-all text-white placeholder:text-slate-700"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 font-medium">Who are the ideal buyers for this brand?</p>
                </div>
                  <button
                    onClick={() => setFormData({
                      ...formData,
                      personas: [...formData.personas, { id: Date.now().toString(), name: '', description: '', painPoints: [], desires: [] }]
                    })}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent-orange hover:text-accent-yellow transition-colors bg-accent-orange/10 px-3 py-1.5 rounded-lg border border-accent-orange/20"
                  >
                    <Plus size={12} /> Add Persona
                  </button>
              </div>

              <div className="space-y-4">
                {formData.personas.map((persona, idx) => (
                  <div key={persona.id} className="p-6 bg-white/5 border border-white/5 rounded-2xl relative group backdrop-blur-md">
                    <button 
                      className="absolute top-4 right-4 text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      onClick={() => {
                        const newPersonas = formData.personas.filter((_, i) => i !== idx);
                        setFormData({ ...formData, personas: newPersonas });
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="grid gap-4">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase tracking-widest text-slate-600">Persona Name</label>
                        <input
                          type="text"
                          placeholder="e.g. CTOs in Fintech"
                          className="w-full bg-transparent border-b border-white/10 py-2 font-black text-white outline-none focus:border-accent-orange transition-colors placeholder:text-slate-700"
                          value={persona.name}
                          onChange={(e) => {
                            const newPersonas = [...formData.personas];
                            newPersonas[idx].name = e.target.value;
                            setFormData({ ...formData, personas: newPersonas });
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase tracking-widest text-slate-600">Strategic Profile</label>
                        <textarea
                          placeholder="Describe their mindset, priorities, and pain points..."
                          className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-xs h-24 outline-none focus:border-accent-orange/50 transition-all text-white placeholder:text-slate-700"
                          value={persona.description}
                          onChange={(e) => {
                            const newPersonas = [...formData.personas];
                            newPersonas[idx].description = e.target.value;
                            setFormData({ ...formData, personas: newPersonas });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 font-medium">What value are we delivering to market?</p>
                </div>
                  <button
                    onClick={() => setFormData({
                      ...formData,
                      offers: [...formData.offers, { id: Date.now().toString(), name: '', valueProposition: '', price: '' }]
                    })}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent-orange hover:text-accent-yellow transition-colors bg-accent-orange/10 px-3 py-1.5 rounded-lg border border-accent-orange/20"
                  >
                    <Plus size={12} /> Add Offer
                  </button>
              </div>

              <div className="space-y-4">
                {formData.offers.map((offer, idx) => (
                  <div key={offer.id} className="p-6 bg-white/5 border border-white/5 rounded-2xl relative backdrop-blur-md">
                   <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest text-slate-600 ml-1">Offer Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Growth Accelerator"
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs outline-none focus:border-accent-orange/50 transition-all text-white font-black placeholder:text-slate-700"
                          value={offer.name}
                          onChange={(e) => {
                            const newOffers = [...formData.offers];
                            newOffers[idx].name = e.target.value;
                            setFormData({ ...formData, offers: newOffers });
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest text-slate-600 ml-1">Price Point</label>
                        <input
                          type="text"
                          placeholder="e.g. $5,000/mo"
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs outline-none focus:border-accent-orange/50 transition-all text-white font-black placeholder:text-slate-700"
                          value={offer.price}
                          onChange={(e) => {
                            const newOffers = [...formData.offers];
                            newOffers[idx].price = e.target.value;
                            setFormData({ ...formData, offers: newOffers });
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] font-black uppercase tracking-widest text-slate-600 ml-1">Value Proposition</label>
                      <textarea
                        placeholder="What is the primary breakthrough transformation?"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs h-20 outline-none focus:border-accent-orange/50 transition-all text-white placeholder:text-slate-700"
                        value={offer.valueProposition}
                        onChange={(e) => {
                          const newOffers = [...formData.offers];
                          newOffers[idx].valueProposition = e.target.value;
                          setFormData({ ...formData, offers: newOffers });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-1 mb-8">
                <p className="text-sm text-slate-500 font-medium italic">Define the neural personality of the brand used for all AI generations.</p>
              </div>
              <VoiceGuideEditor 
                value={(formData as any).voiceGuide}
                onChange={(voiceGuide) => setFormData({ ...formData, voiceGuide })}
              />
            </div>
          )}

          {currentStep === 5 && (
            <div className="flex flex-col items-center justify-center h-[350px] text-center">
              <div className="w-20 h-20 bg-accent-orange/10 rounded-[2rem] flex items-center justify-center text-accent-orange mb-6 shadow-2xl border border-accent-orange/20 relative">
                <div className="absolute inset-0 bg-accent-orange/20 blur-2xl rounded-full animate-pulse" />
                <Rocket size={32} className="animate-bounce relative z-10" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">Neural Sync Ready</h3>
              <p className="text-slate-500 max-w-xs mt-2 font-medium text-xs leading-relaxed">Our AI architect is primed to build your v2.0 growth roadmap once the data is synchronized.</p>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="pt-8 border-t border-white/5 flex justify-between items-center mt-8 relative z-10">
          <button
            onClick={handleBack}
            className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all ${currentStep === 1 ? 'invisible' : ''}`}
          >
            <ChevronLeft size={16} /> Previous
          </button>

          {currentStep === STEPS.length ? (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-8 py-3.5 bg-gradient-to-br from-accent-orange to-accent-red text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-[0_0_30px_rgba(255,127,0,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-3 group"
            >
              {isLoading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Syncing...
                </>
              ) : (
                <>
                  Launch Agent <Rocket size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-8 py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all flex items-center gap-3 group"
            >
              Next Phase <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
