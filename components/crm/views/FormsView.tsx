'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Link as LinkIcon, Edit, ExternalLink, Trash2, Copy, Check, Save } from 'lucide-react';
import FormBuilder, { FormBuilderHandle } from '@/components/forms/FormBuilder';

interface FormsViewProps {
  clientId: string;
}

export default function FormsView({ clientId }: FormsViewProps) {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingForm, setEditingForm] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const formRef = useRef<FormBuilderHandle>(null);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/forms?clientId=${clientId}`);
      const data = await res.json();
      setForms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch forms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, [clientId]);

  const handleSaveForm = async (formData: any) => {
    const res = await fetch('/api/forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      await fetchForms();
      setIsBuilding(false);
      setEditingForm(null);
    } else {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save');
    }
  };

  const handleDeleteForm = async (id: string) => {
    if (!confirm('Are you sure you want to delete this form? This cannot be undone.')) return;

    try {
      const res = await fetch(`/api/forms?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchForms();
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleCopyLink = (slug: string, id: string) => {
    const url = `${window.location.origin}/f/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isBuilding || editingForm) {
    return (
      <div className="h-full flex flex-col gap-4">
        <div className="flex items-center justify-between bg-surface-card/30 p-4 rounded-2xl border border-border-1">
          <button
            onClick={() => {
              setIsBuilding(false);
              setEditingForm(null);
            }}
            className="text-text-muted hover:text-text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group transition-all"
          >
            <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back to List
          </button>
          
          <button
            disabled={isSaving}
            onClick={async () => {
              try {
                setIsSaving(true);
                await formRef.current?.submit();
              } catch (e) {
                // Error handled in builder
              } finally {
                setIsSaving(false);
              }
            }}
            className="bg-accent-blue text-white px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 disabled:bg-blue-900/50 disabled:text-text-muted transition-all flex items-center gap-2"
          >
            <Save size={14} className={isSaving ? 'animate-spin' : ''} />
            {isSaving ? 'Saving...' : 'Save Form'}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <FormBuilder
            ref={formRef}
            clientId={clientId}
            initialForm={editingForm}
            onSave={handleSaveForm}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-black text-text-primary uppercase italic tracking-tighter transition-colors">Managed Lead Forms</h3>
          <p className="text-text-muted text-xs font-medium uppercase tracking-widest transition-colors">
            Custom forms for your landing pages and ad campaigns.
          </p>
        </div>
        <button
          onClick={() => setIsBuilding(true)}
          className="bg-accent-blue text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-105 transition-all flex items-center gap-2"
        >
          <Plus size={14} />
          Create New Form
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-text-muted font-black uppercase tracking-widest animate-pulse">
          Loading Forms Library...
        </div>
      ) : forms.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border-1 rounded-3xl bg-surface-1/50 p-12 text-center transition-colors">
          <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center text-text-muted mb-4 border border-border-1">
            <LinkIcon size={32} />
          </div>
          <h4 className="text-lg font-black text-text-primary uppercase italic tracking-tighter mb-2">No Forms Found</h4>
          <p className="text-xs text-text-muted font-medium max-w-xs uppercase tracking-widest leading-relaxed">
            Create your first custom lead form to start capturing high-intent leads from your ads.
          </p>
        </div>
      ) : (
      <div className="flex-1 overflow-x-auto overflow-y-auto pr-2 pb-12 custom-scrollbar">
        <table className="w-full text-left border-separate">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/50">
              <th className="px-6 py-2">Form Identity</th>
              <th className="px-6 py-2">Description</th>
              <th className="px-6 py-2">Questions</th>
              <th className="px-6 py-2">Date Created</th>
              <th className="px-6 py-2 text-center w-20">Copy</th>
              <th className="px-6 py-2 text-center w-20">Edit</th>
              <th className="px-6 py-2 text-center w-20">Delete</th>
            </tr>
          </thead>
          <tbody className="before:block before:h-2">
            {forms.map((form) => (
              <tr key={form.id} className="group bg-surface-card/20 hover:bg-surface-card/40 transition-all rounded-2xl overflow-hidden border border-border-1">
                {/* Form Name & Link Snippet */}
                <td className="px-6 py-3 rounded-l-2xl border-y border-l border-border-1 first:group-hover:border-accent-blue/30 transition-colors">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-black text-text-primary uppercase tracking-tighter truncate max-w-[200px]">
                        {form.name}
                      </span>
                    </div>
                    
                  </div>
                </td>

                {/* Form Description */}
                <td className="px-6 py-3 border-y border-border-1 group-hover:border-accent-blue/30 transition-colors">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-tight line-clamp-1 max-w-[250px]">
                    {form.description || '—'}
                  </span>
                </td>
                
                {/* Questions Count */}
                <td className="px-6 py-3 border-y border-border-1 group-hover:border-accent-blue/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-text-secondary">
                      {Array.isArray(form.questions) ? form.questions.length : 0}
                    </span>
                  </div>
                </td>

                {/* Created Date */}
                <td className="px-6 py-3 border-y border-border-1 group-hover:border-accent-blue/30 transition-colors">
                   <div className="flex flex-col">
                     <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest leading-none">
                       {new Date(form.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                     </span>
                   </div>
                </td>

                {/* Action: Copy Link */}
                <td className="px-6 py-3 border-y border-border-1 group-hover:border-accent-blue/30 transition-colors text-center w-20">
                  <button
                    onClick={() => handleCopyLink(form.slug, form.id)}
                    className="p-2.5 bg-surface-2/50 rounded-xl text-text-muted hover:text-accent-blue hover:bg-accent-blue/10 hover:scale-110 active:scale-95 transition-all shadow-sm"
                    title="Copy Public Link"
                  >
                    {copiedId === form.id ? <Check size={14} className="text-accent-green" /> : <Copy size={14} />}
                  </button>
                </td>

                {/* Action: Edit */}
                <td className="px-6 py-3 border-y border-border-1 group-hover:border-accent-blue/30 transition-colors text-center w-20">
                  <button
                    onClick={() => setEditingForm(form)}
                    className="p-2.5 bg-surface-2/50 rounded-xl text-text-muted hover:text-accent-blue hover:bg-accent-blue/10 hover:scale-110 active:scale-95 transition-all shadow-sm"
                    title="Edit Configuration"
                  >
                    <Edit size={14} />
                  </button>
                </td>

                {/* Action: Delete */}
                <td className="px-4 py-2 rounded-r-2xl border-y border-r border-border-1 group-hover:border-accent-blue/30 border-r-border-1 transition-colors text-center w-20">
                  <button
                    onClick={() => handleDeleteForm(form.id)}
                    className="p-2 bg-surface-2/50 rounded-xl text-red-500/100 hover:text-red-500 hover:bg-red-500/10 hover:scale-110 active:scale-95 transition-all shadow-sm"
                    title="Delete Permanently"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
