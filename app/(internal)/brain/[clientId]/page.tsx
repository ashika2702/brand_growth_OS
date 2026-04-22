'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Brain, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import BusinessBrainDashboard from '@/components/brain/Dashboard';

export default function BusinessBrainDetailPage() {
    const params = useParams();
    const router = useRouter();
    const clientId = params.clientId as string;

    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBrainData = async () => {
            try {
                const res = await fetch(`/api/brain?clientId=${clientId}`);
                if (!res.ok) throw new Error('Failed to fetch brain data');
                const brainData = await res.json();

                if (!brainData) {
                    setError('No brain found for this client. Please set it up first.');
                    return;
                }

                setData(brainData);
            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (clientId) fetchBrainData();
    }, [clientId]);

    if (isLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-accent-blue/20 blur-3xl rounded-full animate-pulse" />
                    <Loader2 className="w-12 h-12 text-accent-blue animate-spin relative z-10" />
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">Synchronizing Neural Core</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center gap-6">
                <div className="w-20 h-20 rounded-[2rem] bg-accent-orange/10 flex items-center justify-center text-accent-orange border border-accent-orange/20 shadow-2xl">
                    <Brain size={32} />
                </div>
                <div className="max-w-xs space-y-2">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Connection Failed</h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{error}</p>
                </div>
                <Link
                    href="/brain"
                    className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all flex items-center gap-2"
                >
                    <ArrowLeft size={14} /> Return to Agents
                </Link>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col gap-6 overflow-hidden">
            {/* Header Area */}
            <div className="flex justify-between items-end shrink-0">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link
                            href="/brain"
                            className="p-2 hover:bg-white/10 rounded-xl text-slate-500 hover:text-white transition-all mr-2"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="w-10 h-10 rounded-2xl bg-accent-orange/10 flex items-center justify-center text-accent-orange border border-accent-orange/20">
                            <Brain size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">Business Brain <span className="text-slate-700 mx-2">—</span> <span className="text-accent-blue">{data.client?.name}</span></h1>
                    </div>
                    <p className="text-slate-500 font-medium">The complete intelligence profile and foundation of all AI output.</p>
                </div>
            </div>

            {/* Dashboard View */}
            <div className="flex-1 overflow-hidden min-h-0">
                <BusinessBrainDashboard clientId={clientId} initialData={data} />
            </div>
        </div>
    );
}
