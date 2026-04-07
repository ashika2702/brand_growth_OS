'use client';

import React, { useState } from 'react';
import { FormQuestion } from './QuestionLibrary';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface PublicFormProps {
  formId: string;
  slug: string;
  name: string;
  description?: string;
  questions: FormQuestion[];
  domain?: string | null;
}

export default function PublicForm({ formId, slug, name, description, questions, domain }: PublicFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (id: string, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Get UTM params/GCLID from URL
    const searchParams = new URLSearchParams(window.location.search);
    const submitUrl = `/api/forms/${slug}/submit?${searchParams.toString()}`;

    try {
      const response = await fetch(submitUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to submit form');
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsDismissed(true);
        if (domain) {
          const redirectUrl = domain.startsWith('http') ? domain : `https://${domain}`;
          window.location.href = redirectUrl;
        }
      }, 800);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Full-screen background that transitions from 15% to 100% opacity
  const backgroundLayer = domain && (
    <div className={`fixed inset-0 z-0 pointer-events-none select-none overflow-hidden transition-all duration-700 ${isDismissed ? 'opacity-100' : 'opacity-15 animate-in fade-in'}`}>
      <iframe 
        src={domain.startsWith('http') ? domain : `https://${domain}`}
        className="w-full h-full border-none"
        title="Background"
      />
    </div>
  );

  if (isDismissed) {
    return backgroundLayer;
  }

  if (isSuccess) {
    return (
      <>
        {backgroundLayer}
        <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl shadow-xl border border-accent-blue/10 max-w-lg mx-auto transform animate-in fade-in zoom-in duration-500 relative z-10">
          <div className="w-20 h-20 bg-accent-orange/10 rounded-full flex items-center justify-center text-accent-orange mb-6 scale-110">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Thank You!</h2>
          <p className="text-lg text-slate-600 mb-8">
            Your information has been received. Our team will lead out to you shortly.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      {backgroundLayer}
      <div className="bg-white rounded-2xl shadow-2xl border border-accent-blue/5 overflow-hidden max-w-xl mx-auto relative z-10">
        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-accent-orange opacity-15 rounded-full blur-3xl"></div>
          <h1 className="text-2xl font-bold relative z-10">{name}</h1>
          {description && (
            <p className="text-slate-400 text-sm mt-1 relative z-10 font-medium">{description}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm animate-shake">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <div className="space-y-5">
            {questions.map((q) => (
              <div key={q.id} className="space-y-1.5">
                <label htmlFor={q.id} className="block text-sm font-bold text-slate-700">
                  {q.label}
                  {q.required && <span className="text-accent-orange ml-1">*</span>}
                </label>

                {q.type === 'select' ? (
                  <div className="relative">
                      <select
                          id={q.id}
                          required={q.required}
                          value={formData[q.id] || ''}
                          onChange={(e) => handleInputChange(q.id, e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent-blue focus:outline-none transition-all appearance-none cursor-pointer text-slate-700 font-medium"
                      >
                          <option value="">Select an option...</option>
                          {q.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                  {opt}
                              </option>
                          ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                      </div>
                  </div>
                ) : q.type === 'checkbox' ? (
                  <div className="space-y-2 pt-1">
                    {q.options?.map((opt) => (
                      <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 bg-white checked:bg-accent-blue checked:border-accent-blue transition-all"
                            checked={(formData[q.id] || []).includes(opt)}
                            onChange={(e) => {
                              const current = formData[q.id] || [];
                              const next = e.target.checked 
                                ? [...current, opt]
                                : current.filter((v: string) => v !== opt);
                              handleInputChange(q.id, next);
                            }}
                          />
                          <svg className="absolute h-3.5 w-3.5 pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : q.type === 'textarea' ? (
                  <textarea
                    id={q.id}
                    required={q.required}
                    value={formData[q.id] || ''}
                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                    placeholder={q.placeholder}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent-blue focus:outline-none transition-all text-slate-700 font-medium"
                  />
                ) : (
                  <input
                    type={q.type}
                    id={q.id}
                    required={q.required}
                    value={formData[q.id] || ''}
                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                    placeholder={q.placeholder}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent-blue focus:outline-none transition-all text-slate-700 font-medium"
                  />
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-accent-blue hover:opacity-90 disabled:bg-accent-blue/50 text-white rounded-xl font-extrabold text-lg shadow-xl shadow-accent-blue/20 transform hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Processing...
              </>
            ) : (
              'Submit Application'
            )}
          </button>
          
        </form>
      </div>
    </>
  );
}
