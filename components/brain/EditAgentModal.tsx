'use client';

import React, { useState, useEffect } from 'react';
import { Save, X, Globe, Building } from 'lucide-react';
import Dialog from '@/components/ui/Dialog';

interface EditAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: any;
  onSuccess: () => void;
}

export default function EditAgentModal({ isOpen, onClose, agent, onSuccess }: EditAgentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
  });

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name || '',
        domain: agent.domain || '',
      });
    }
  }, [agent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`/api/clients/${agent.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        console.error('Failed to update agent');
      }
    } catch (err) {
      console.error('Error updating agent:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog 
        isOpen={isOpen} 
        onClose={onClose} 
        title="Edit Agent Identity"
    >
      <form onSubmit={handleSubmit} className="space-y-8 py-4">
        {/* Identity Section */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Company Name</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-blue transition-colors">
                <Building size={16} />
              </div>
              <input
                type="text"
                required
                className="w-full bg-surface-2 border border-border-1 focus:border-accent-blue/40 focus:bg-surface-3 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none transition-all text-text-primary placeholder:text-text-dim shadow-inner"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Domain URL</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-blue transition-colors">
                <Globe size={16} />
              </div>
              <input
                type="url"
                className="w-full bg-surface-2 border border-border-1 focus:border-accent-blue/40 focus:bg-surface-3 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none transition-all text-text-primary placeholder:text-text-dim shadow-inner"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-4 pt-4 border-t border-border-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all text-center"
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-[2] py-4 bg-gradient-to-br from-accent-blue to-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(62,128,255,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Save Changes <Save size={16} className="group-hover:translate-x-0.5 transition-all" />
              </>
            )}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
