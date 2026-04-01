"use client";

import React, { useState, useRef } from 'react';
import { QrCode, Download, Link, Settings2, Smartphone } from 'lucide-react';
import QRCode from 'react-qr-code';
import * as htmlToImage from 'html-to-image';

export default function QRCapture({ clientId }: { clientId: string }) {
   const [source, setSource] = useState('Business Card');
   const [campaign, setCampaign] = useState('Networking Q1');
   const [copied, setCopied] = useState(false);
   const qrRef = useRef<HTMLDivElement>(null);

   // Clean params for the URL to avoid breaking characters, but keep it readable
   const cleanSource = encodeURIComponent(source.trim() || 'Direct');
   const cleanCampaign = encodeURIComponent(campaign.trim() || 'General');

   // Assuming app runs on localhost:3000 during dev, or a real domain in prod. 
   // In a real prod environment, you'd use an env var like process.env.NEXT_PUBLIC_APP_URL
   const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
   const captureUrl = `${baseUrl}/capture/${clientId}?s=${cleanSource}&c=${cleanCampaign}`;

   const handleCopy = () => {
      navigator.clipboard.writeText(captureUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
   };

   const handleDownload = async () => {
      if (!qrRef.current) return;
      try {
         // html-to-image converts the DOM node (with the white background) into a PNG data URL
         const dataUrl = await htmlToImage.toPng(qrRef.current, {
            quality: 1,
            backgroundColor: '#ffffff',
            width: 300, // Export at a higher res than displayed
            height: 300,
            style: {
               transform: 'scale(1)',
               display: 'flex',
               justifyContent: 'center',
               alignItems: 'center',
               padding: '24px'
            }
         });

         const link = document.createElement('a');
         link.download = `QR-Capture-${clientId}-${source.replace(/\s+/g, '-')}.png`;
         link.href = dataUrl;
         link.click();
      } catch (err) {
         console.error('Failed to generate image', err);
         alert('Failed to generate QR Code image.');
      }
   };

   return (
      <div className="h-full flex flex-col pt-4 overflow-y-auto no-scrollbar">
         <div className="flex items-center gap-3 mb-6 px-2 transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-accent-blue/10 flex items-center justify-center text-accent-blue border border-accent-blue/20">
               <QrCode size={18} />
            </div>
            <h2 className="text-[15px] font-black text-text-primary uppercase italic tracking-tighter transition-colors">QR Capture Engine</h2>
         </div>

         <div className="grid grid-cols-3 gap-5 pb-10">
            {/* Generator Settings */}
            <div className="col-span-1 h-full">
               <div className="glass-card p-5 rounded-2xl border border-border-1 relative overflow-hidden group h-full flex flex-col transition-colors">
                  <div className="absolute inset-0 bg-border-glass opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div className="relative z-10 flex items-center justify-between mb-5">
                     <div className="flex items-center gap-2 text-accent-blue">
                        <Settings2 size={14} />
                        <h3 className="text-[9px] font-black uppercase tracking-widest leading-none">Capture Parameters</h3>
                     </div>
                     <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent-blue/10 border border-accent-blue/20">
                        <div className="w-1 h-1 rounded-full bg-accent-blue animate-pulse" />
                        <span className="text-[7px] font-black text-accent-blue uppercase tracking-widest">Neural Sync</span>
                     </div>
                  </div>

                  <div className="relative z-10 space-y-3 flex-1 text-xs">
                      <div>
                         <label className="block text-[8px] font-black uppercase tracking-widest text-text-muted mb-1 ml-0.5 transition-colors">Intent Source Label</label>
                         <input
                            type="text"
                            value={source}
                            onChange={e => setSource(e.target.value)}
                            className="w-full bg-surface-2 border border-border-1 rounded-lg px-3 py-2 text-xs text-text-primary outline-none focus:border-accent-blue/50 transition-all font-medium"
                            placeholder="e.g. Business Card"
                         />
                      </div>
                      <div>
                         <label className="block text-[8px] font-black uppercase tracking-widest text-text-muted mb-1 ml-0.5 transition-colors">Campaign Tracking (UTM)</label>
                         <input
                            type="text"
                            value={campaign}
                            onChange={e => setCampaign(e.target.value)}
                            className="w-full bg-surface-2 border border-border-1 rounded-lg px-3 py-2 text-xs text-text-primary outline-none focus:border-accent-blue/50 transition-all font-medium"
                            placeholder="e.g. Q1 Networking"
                         />
                      </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-border-1 relative z-10 transition-colors">
                     <div className="flex items-center gap-2 bg-surface-2 border border-border-1 rounded-xl pl-3 py-1.5 pr-1.5 text-text-primary group/link hover:border-border-2 transition-all">
                        <Link size={12} className="text-text-muted shrink-0 transition-colors" />
                        <input type="text" readOnly value={captureUrl} className="bg-transparent outline-none text-[9px] w-full text-text-secondary font-medium truncate transition-colors" />
                        <button 
                           onClick={handleCopy}
                           className="px-3 py-2 rounded-lg bg-surface-3 text-[8px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all text-text-muted hover:text-text-primary border border-border-1 whitespace-nowrap"
                        >
                           {copied ? 'Copied' : 'Copy'}
                        </button>
                     </div>
                     <p className="mt-2 text-[7px] text-text-dim font-medium ml-1 flex items-center gap-1.5 transition-colors">
                        <span className="w-1 h-1 rounded-full bg-text-dim inline-block transition-colors" />
                        Changes are synced in real-time.
                     </p>
                  </div>
               </div>
            </div>

            {/* Generated QR Code */}
            <div className="col-span-1 h-full">
               <div className="flex flex-col p-5 glass-card border border-border-1 rounded-2xl items-center justify-center h-full relative overflow-hidden group text-center transition-colors">
                  <div className="absolute inset-0 bg-border-glass opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  
                  <div className="relative z-10 flex items-center justify-between mb-5 w-full transition-colors">
                     <div className="flex items-center gap-2 text-accent-blue">
                        <QrCode size={14} />
                        <h3 className="text-[9px] font-black uppercase tracking-widest leading-none transition-colors">Neural QR Signature</h3>
                     </div>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center w-full relative">
                     {/* Decorative background glow */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-accent-blue/10 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                     
                     <div
                        ref={qrRef}
                        className="bg-white p-5 rounded-2xl mb-7 shadow-[0_0_50px_rgba(255,255,255,0.08)] flex items-center justify-center group-hover:scale-[1.08] transition-all duration-700 relative z-10 border border-white/10"
                        style={{ width: '190px', height: '190px' }}
                     >
                        <div style={{ height: "auto", margin: "0 auto", maxWidth: 155, width: "100%" }}>
                           <QRCode
                              size={256}
                              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                              value={captureUrl}
                              viewBox={`0 0 256 256`}
                              level="H"
                           />
                        </div>
                     </div>
                  </div>

                  <button onClick={handleDownload} className="w-full bg-accent-blue text-white font-black text-[9px] uppercase tracking-[0.1em] py-3.5 rounded-xl shadow-[0_0_25px_rgba(45,140,255,0.25)] hover:bg-blue-500 hover:shadow-[0_0_35px_rgba(45,140,255,0.35)] hover:scale-[0.98] active:scale-95 transition-all flex items-center justify-center gap-2 relative z-10 border border-white/5 transition-colors">
                     <Download size={14} /> Download
                  </button>
               </div>
            </div>

            {/* Mobile Preview */}
            <div className="col-span-1 h-full">
               <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center h-full relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  
                  <div className="relative z-10 flex items-center gap-2 mb-4 text-accent-blue w-full text-left">
                     <Smartphone size={14} />
                     <h3 className="text-[9px] font-black uppercase tracking-widest">Live Interface Preview</h3>
                  </div>

                  <div className="flex-1 flex items-center justify-center w-full">
                     <div className="w-[170px] h-[310px] border-[6px] border-text-primary rounded-[2rem] bg-surface-1 shadow-2xl overflow-hidden relative scale-90 origin-center group-hover:scale-[0.92] transition-transform duration-500">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-3 bg-black rounded-b-lg z-20" />
                        <div className="p-4 h-full flex flex-col pt-7 relative">
                           <div className="w-8 h-8 rounded-lg bg-accent-blue mx-auto mb-2 flex items-center justify-center text-white text-[8px] font-black shadow-[0_0_15px_rgba(62,128,255,0.4)]">BOS</div>
                           <h3 className="text-center text-white font-black text-[10px] mb-1 uppercase italic tracking-tighter leading-tight">Claim Your Brief</h3>
                           <p className="text-center text-slate-400 text-[6px] font-medium leading-relaxed mb-4 px-1">Enter your details and the AI will analyze your digital footprint instantly.</p>

                           <div className="space-y-2">
                              <div className="h-6 bg-white/5 rounded-md border border-white/10 px-2 flex items-center text-slate-500 text-[6px] font-black uppercase tracking-widest">Full Name</div>
                              <div className="h-6 bg-white/5 rounded-md border border-white/10 px-2 flex items-center text-slate-500 text-[6px] font-black uppercase tracking-widest">Email Address</div>
                           </div>

                           <button className="mt-4 w-full bg-gradient-to-r from-accent-blue to-blue-500 rounded-md py-2 text-center text-white font-black text-[6px] uppercase tracking-widest shadow-[0_0_20px_rgba(62,128,255,0.4)] hover:brightness-110 active:scale-95 transition-all border border-blue-400/20">
                              Initialize Analysis ➔
                           </button>

                           <div className="mt-auto pt-2 flex flex-col items-center gap-1 opacity-20">
                              <div className="w-12 h-0.5 bg-white/20 rounded-full" />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
