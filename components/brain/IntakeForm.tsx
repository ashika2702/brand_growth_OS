'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Rocket,
  Clock
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
  { id: 5, title: 'Blueprints' },
  { id: 6, title: 'Agent Setup' },
  { id: 7, title: 'Confirm' },
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
    personas: [{
      id: '1',
      name: '',
      description: '',
      painPoints: [] as string[],
      desires: [] as string[],
      blueprint: {
        name: '',
        universalGoal: '',
        steps: [{ delayDays: 0, strategy: 'Initial personalized outreach focusing on the primary pain point.', name: 'Initial Pulse', goal: 'Establish connection' }]
      }
    }],
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
    },
    fromName: '',
    smtpUser: '',
    smtpPass: '',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 465,
    imapHost: 'imap.gmail.com',
    imapPort: 993
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
            <div className={`flex items-center gap-3 shrink-0 transition-all duration-500 ${currentStep >= step.id ? 'opacity-100' : 'opacity-70'}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-500 ${currentStep >= step.id
                ? 'bg-accent-orange text-white border-accent-orange/40 shadow-[0_0_20px_rgba(255,127,0,0.4)]'
                : 'bg-surface-2 border-border-1 text-text-muted'
                }`}>
                {currentStep > step.id ? <CheckCircle2 size={16} /> : <span className="text-[10px] font-black">{step.id}</span>}
              </div>
              <div className="flex flex-col">
                <span className={`text-[11px] font-black uppercase tracking-tight ${currentStep >= step.id ? 'text-text-primary' : 'text-text-muted'}`}>{step.title}</span>
              </div>
            </div>
            {idx < STEPS.length - 1 && <div className={`h-[1px] w-8 shrink-0 rounded-full transition-all duration-1000 ${currentStep > step.id ? 'bg-accent-orange' : 'bg-border-1'}`} />}
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
                  <label className="text-[9px] font-black uppercase tracking-widest text-text-muted ml-1 transition-colors">Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corporation"
                    className="w-full bg-surface-2 border border-border-1 focus:border-accent-orange/50 focus:bg-surface-3 rounded-2xl p-4 text-sm outline-none transition-all text-text-primary placeholder:text-text-dim"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-text-muted ml-1 transition-colors">Domain URL</label>
                  <input
                    type="url"
                    placeholder="https://acme.com"
                    className="w-full bg-surface-2 border border-border-1 focus:border-accent-orange/50 focus:bg-surface-3 rounded-2xl p-4 text-sm outline-none transition-all text-text-primary placeholder:text-text-dim"
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
                  <p className="text-sm text-text-secondary font-medium transition-colors">Who are the ideal buyers for this brand?</p>
                </div>
                <button
                  onClick={() => setFormData({
                    ...formData,
                    personas: [...formData.personas, {
                      id: Date.now().toString(),
                      name: '',
                      description: '',
                      painPoints: [] as string[],
                      desires: [] as string[],
                      blueprint: {
                        name: '',
                        universalGoal: '',
                        steps: [{ delayDays: 0, strategy: '', name: '', goal: '' }]
                      }
                    }]
                  })}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent-orange hover:text-accent-yellow transition-colors bg-accent-orange/10 px-3 py-1.5 rounded-lg border border-accent-orange/20"
                >
                  <Plus size={12} /> Add Persona
                </button>
              </div>

              <div className="space-y-4">
                {formData.personas.map((persona, idx) => (
                  <div key={persona.id} className="p-6 bg-surface-2 border border-border-1 rounded-2xl relative group backdrop-blur-md transition-colors">
                    <button
                      className="absolute top-4 right-4 text-text-dim hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      onClick={() => {
                        const newPersonas = formData.personas.filter((_, i) => i !== idx);
                        setFormData({ ...formData, personas: newPersonas });
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="grid gap-4">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary transition-colors">Persona Name</label>
                        <input
                          type="text"
                          placeholder="e.g. CTOs in Fintech"
                          className="w-full bg-transparent border-b border-border-1 py-2 font-black text-text-primary outline-none focus:border-accent-orange transition-colors placeholder:text-text-dim"
                          value={persona.name}
                          onChange={(e) => {
                            const newPersonas = [...formData.personas];
                            newPersonas[idx].name = e.target.value;
                            setFormData({ ...formData, personas: newPersonas });
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary transition-colors">Strategic Profile</label>
                        <textarea
                          placeholder="Describe their mindset and priorities..."
                          className="w-full bg-surface-2 border border-border-1 rounded-xl p-4 text-xs h-20 outline-none focus:border-accent-orange/50 transition-all text-text-primary placeholder:text-text-dim"
                          value={persona.description}
                          onChange={(e) => {
                            const newPersonas = [...formData.personas];
                            newPersonas[idx].description = e.target.value;
                            setFormData({ ...formData, personas: newPersonas });
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary transition-colors">Pain Points (comma separated)</label>
                          <input
                            type="text"
                            placeholder="e.g. High churn, Low ROI"
                            className="w-full bg-surface-3 border border-border-1 rounded-xl px-4 py-2 text-xs outline-none focus:border-accent-orange/50 transition-all text-text-primary placeholder:text-text-dim"
                            value={Array.isArray(persona.painPoints) ? persona.painPoints.join(', ') : persona.painPoints}
                            onChange={(e) => {
                              const newPersonas = [...formData.personas];
                              newPersonas[idx].painPoints = e.target.value.split(',').map(p => p.trim());
                              setFormData({ ...formData, personas: newPersonas });
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary transition-colors">Primary Desires (comma separated)</label>
                          <input
                            type="text"
                            placeholder="e.g. Scalability, Automation"
                            className="w-full bg-surface-3 border border-border-1 rounded-xl px-4 py-2 text-xs outline-none focus:border-accent-orange/50 transition-all text-text-primary placeholder:text-text-dim"
                            value={Array.isArray(persona.desires) ? persona.desires.join(', ') : persona.desires}
                            onChange={(e) => {
                              const newPersonas = [...formData.personas];
                              newPersonas[idx].desires = e.target.value.split(',').map(d => d.trim());
                              setFormData({ ...formData, personas: newPersonas });
                            }}
                          />
                        </div>
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
                  <p className="text-sm text-text-secondary font-medium transition-colors">What value are we delivering to market?</p>
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
                  <div key={offer.id} className="p-6 bg-surface-2 border border-border-1 rounded-2xl relative backdrop-blur-md transition-colors">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary ml-1 transition-colors">Offer Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Growth Accelerator"
                          className="w-full bg-surface-3 border border-border-1 rounded-xl p-4 text-xs outline-none focus:border-accent-orange/50 transition-all text-text-primary font-black placeholder:text-text-dim"
                          value={offer.name}
                          onChange={(e) => {
                            const newOffers = [...formData.offers];
                            newOffers[idx].name = e.target.value;
                            setFormData({ ...formData, offers: newOffers });
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary ml-1 transition-colors">Price Point</label>
                        <input
                          type="text"
                          placeholder="e.g. $5,000/mo"
                          className="w-full bg-surface-3 border border-border-1 rounded-xl p-4 text-xs outline-none focus:border-accent-orange/50 transition-all text-text-primary font-black placeholder:text-text-dim"
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
                      <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary ml-1 transition-colors">Value Proposition</label>
                      <textarea
                        placeholder="What is the primary breakthrough transformation?"
                        className="w-full bg-surface-3 border border-border-1 rounded-xl p-4 text-xs h-20 outline-none focus:border-accent-orange/50 transition-all text-text-primary placeholder:text-text-dim"
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
            <div className="space-y-6">
              <div className="space-y-1 mb-8">
                <p className="text-sm text-text-secondary font-medium italic transition-colors">Define the Strategic Blueprints for each persona. These sequences handle multi-day outreach.</p>
              </div>
              <div className="space-y-12">
                {formData.personas.map((persona, idx) => (
                  <div key={persona.id} className="p-8 bg-surface-2 border border-border-1 rounded-[2.5rem] relative group backdrop-blur-md transition-colors">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 rounded-2xl bg-accent-blue/10 flex items-center justify-center text-accent-blue border border-accent-blue/20">
                        <Rocket size={28} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Sequence Name "
                            className="bg-transparent text-xl font-black text-text-primary tracking-tighter uppercase italic outline-none focus:text-accent-blue transition-colors w-full placeholder:text-text-dim"
                            value={persona.blueprint?.name || persona.name || ''}
                            onChange={(e) => {
                              const newPersonas = [...formData.personas];
                              const blueprint = newPersonas[idx].blueprint || { steps: [] };
                              blueprint.name = e.target.value;
                              newPersonas[idx].blueprint = blueprint;
                              setFormData({ ...formData, personas: newPersonas });
                            }}
                          />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary transition-colors">Neural Sequence Architect</p>
                      </div>
                    </div>

                    <div className="grid gap-6 mb-8">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary ml-1 transition-colors">Universal Goal</label>
                        <textarea
                          placeholder="What is the singular objective of this entire sequence? (e.g. Book a discovery call with the CTO)"
                          className="w-full bg-surface-3 border border-border-1 rounded-2xl p-4 text-xs h-20 outline-none focus:border-accent-blue/30 transition-all text-text-primary placeholder:text-text-dim italic font-medium"
                          value={persona.blueprint?.universalGoal || ''}
                          onChange={(e) => {
                            const newPersonas = [...formData.personas];
                            const blueprint = newPersonas[idx].blueprint || { steps: [] };
                            blueprint.universalGoal = e.target.value;
                            newPersonas[idx].blueprint = blueprint;
                            setFormData({ ...formData, personas: newPersonas });
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-blue/60">Execution Timeline</h5>
                        <button
                          onClick={() => {
                            const newPersonas = [...formData.personas];
                            const blueprint = newPersonas[idx].blueprint || { steps: [] };
                            blueprint.steps.push({ delayDays: 3, strategy: '', name: '', goal: '' });
                            newPersonas[idx].blueprint = blueprint;
                            setFormData({ ...formData, personas: newPersonas });
                          }}
                          className="text-[9px] font-black uppercase text-accent-blue hover:text-white transition-all bg-accent-blue/10 px-4 py-2 rounded-xl border border-accent-blue/20 hover:bg-accent-blue hover:border-accent-blue hover:shadow-[0_0_20px_rgba(0,123,255,0.4)]"
                        >
                          + Add Sequence Step
                        </button>
                      </div>

                      <div className="space-y-6">
                        {(persona.blueprint?.steps || []).map((step: any, sIdx: number) => (
                          <div key={sIdx} className="p-6 bg-surface-3 border border-border-1 rounded-3xl space-y-5 relative group/step shadow-2xl overflow-hidden transition-colors">
                            <div className="absolute top-0 left-0 w-1 h-full bg-accent-blue/20" />

                            <button
                              onClick={() => {
                                const newPersonas = [...formData.personas];
                                newPersonas[idx].blueprint!.steps = newPersonas[idx].blueprint!.steps.filter((_, i) => i !== sIdx);
                                setFormData({ ...formData, personas: newPersonas });
                              }}
                              className="absolute top-6 right-6 text-text-dim hover:text-red-500 opacity-0 group-hover/step:opacity-100 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                              <div className="md:col-span-3 space-y-4">
                                <div className="flex items-center gap-3 bg-surface-2 px-3 py-2 rounded-xl border border-border-1 transition-colors">
                                  <Clock size={12} className="text-accent-blue" />
                                  <div className="flex flex-col">
                                    <span className="text-[8px] font-black uppercase text-text-secondary leading-none mb-1 transition-colors">Wait Time</span>
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="number"
                                        min="0"
                                        value={step.delayDays}
                                        onChange={(e) => {
                                          const val = Math.max(0, parseInt(e.target.value) || 0);
                                          const newPersonas = [...formData.personas];
                                          newPersonas[idx].blueprint!.steps[sIdx].delayDays = val;
                                          setFormData({ ...formData, personas: newPersonas });
                                        }}
                                        className="w-10 bg-transparent text-sm font-black text-text-primary outline-none transition-colors"
                                      />
                                      <span className="text-[10px] font-black text-text-dim uppercase transition-colors">Days</span>
                                    </div>
                                    <p className="text-[7px] text-text-dim font-bold uppercase mt-1 italic leading-none whitespace-nowrap transition-colors">since {sIdx === 0 ? 'start' : 'previous step'}</p>
                                  </div>
                                </div>
                                {sIdx === 0 && (
                                  <div className="px-3 py-1.5 bg-accent-green/10 border border-accent-green/20 rounded-lg">
                                    <span className="text-[9px] font-black uppercase text-accent-green italic tracking-widest">Initial Pulse</span>
                                  </div>
                                )}
                              </div>

                              <div className="md:col-span-9 space-y-4">
                                <div className="grid gap-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                      <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary ml-1 transition-colors">Step Name</label>
                                      <input
                                        type="text"
                                        placeholder="e.g. The 'Authority' Angle"
                                        className="w-full bg-surface-2 border border-border-1 rounded-xl px-4 py-2.5 text-[11px] font-black text-text-primary outline-none focus:border-accent-blue/40 transition-all placeholder:text-text-dim"
                                        value={step.name || ''}
                                        onChange={(e) => {
                                          const newPersonas = [...formData.personas];
                                          newPersonas[idx].blueprint!.steps[sIdx].name = e.target.value;
                                          setFormData({ ...formData, personas: newPersonas });
                                        }}
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary ml-1 transition-colors">Step Goal</label>
                                      <input
                                        type="text"
                                        placeholder="e.g. Establish credibility"
                                        className="w-full bg-surface-2 border border-border-1 rounded-xl px-4 py-2.5 text-[11px] font-medium text-text-primary outline-none focus:border-accent-blue/40 transition-all placeholder:text-text-dim italic"
                                        value={step.goal || ''}
                                        onChange={(e) => {
                                          const newPersonas = [...formData.personas];
                                          newPersonas[idx].blueprint!.steps[sIdx].goal = e.target.value;
                                          setFormData({ ...formData, personas: newPersonas });
                                        }}
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary ml-1 transition-colors">AI Outreach Strategy</label>
                                    <textarea
                                      placeholder="Specific instructions for the AI engine regarding tone, angle, and core message for this step..."
                                      className="w-full bg-surface-2 border border-border-1 rounded-2xl p-4 text-[11px] h-24 outline-none focus:border-accent-blue/40 transition-all text-text-primary placeholder:text-text-dim font-medium italic leading-relaxed"
                                      value={step.strategy}
                                      onChange={(e) => {
                                        const newPersonas = [...formData.personas];
                                        newPersonas[idx].blueprint!.steps[sIdx].strategy = e.target.value;
                                        setFormData({ ...formData, personas: newPersonas });
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-8">
              <div className="space-y-1">
                <p className="text-sm text-text-secondary font-medium transition-colors">Configure the Neural Agent's identity and communication channel.</p>
              </div>

              <div className="grid gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary ml-1 transition-colors">Agent "From" Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Alex from Stedaxis"
                    className="w-full bg-surface-2 border border-border-1 focus:border-accent-orange/50 focus:bg-surface-3 rounded-2xl p-4 text-sm outline-none transition-all text-text-primary placeholder:text-text-dim"
                    value={formData.fromName}
                    onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                  />
                  <p className="text-[9px] text-text-dim italic px-1 font-medium transition-colors">This is the name leads will see in their inbox. Use a real person's name for 3x higher conversion.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary ml-1 transition-colors">Agent Email (SMTP/IMAP User)</label>
                  <input
                    type="email"
                    placeholder="agent@brand.com"
                    className="w-full bg-surface-2 border border-border-1 focus:border-accent-orange/50 focus:bg-surface-3 rounded-2xl p-4 text-sm outline-none transition-all text-text-primary placeholder:text-text-dim"
                    value={formData.smtpUser}
                    onChange={(e) => setFormData({ ...formData, smtpUser: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary ml-1 transition-colors">App Password</label>
                  <input
                    type="password"
                    placeholder="••••••••••••••••"
                    className="w-full bg-surface-2 border border-border-1 focus:border-accent-orange/50 focus:bg-surface-3 rounded-2xl p-4 text-sm outline-none transition-all text-text-primary placeholder:text-text-dim"
                    value={formData.smtpPass}
                    onChange={(e) => setFormData({ ...formData, smtpPass: e.target.value })}
                  />
                  <p className="text-[9px] text-accent-orange/60 italic px-1 font-medium transition-colors">For Gmail, use a 16-character "App Password". Regular passwords will not work.</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div className="flex flex-col items-center justify-center h-[350px] text-center">
              <div className="w-20 h-20 bg-accent-orange/10 rounded-[2rem] flex items-center justify-center text-accent-orange mb-6 shadow-2xl border border-accent-orange/20 relative">
                <div className="absolute inset-0 bg-accent-orange/20 blur-2xl rounded-full animate-pulse" />
                <Rocket size={32} className="animate-bounce relative z-10" />
              </div>
              <h3 className="text-2xl font-black text-text-primary tracking-tighter uppercase italic transition-colors">Neural Sync Ready</h3>
              <p className="text-text-muted max-w-xs mt-2 font-medium text-xs leading-relaxed transition-colors">Our AI architect is primed to build your v2.0 growth roadmap once the data is synchronized.</p>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="pt-8 border-t border-border-1 flex justify-between items-center mt-8 relative z-10 transition-colors">
          <button
            onClick={handleBack}
            className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-text-secondary hover:text-text-primary transition-all ${currentStep === 1 || isLoading ? 'invisible' : ''}`}
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
              disabled={isLoading}
              className="px-8 py-3.5 bg-surface-2 hover:bg-surface-3 text-text-primary rounded-xl text-[10px] font-black uppercase tracking-widest border border-border-1 transition-all flex items-center gap-3 group"
            >
              Next Phase <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
