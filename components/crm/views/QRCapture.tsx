"use client";

import React, { useState, useRef } from 'react';
import { QrCode, Download, Link, Settings2, Smartphone } from 'lucide-react';
import QRCode from 'react-qr-code';
import * as htmlToImage from 'html-to-image';

export default function QRCapture({ clientId }: { clientId: string }) {
  const [source, setSource] = useState('Business Card');
  const [campaign, setCampaign] = useState('Networking Q1');
  const qrRef = useRef<HTMLDivElement>(null);
  
  // Clean params for the URL to avoid breaking characters, but keep it readable
  const cleanSource = encodeURIComponent(source.trim() || 'Direct');
  const cleanCampaign = encodeURIComponent(campaign.trim() || 'General');

  // Assuming app runs on localhost:3000 during dev, or a real domain in prod. 
  // In a real prod environment, you'd use an env var like process.env.NEXT_PUBLIC_APP_URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const captureUrl = `${baseUrl}/capture/${clientId}?s=${cleanSource}&c=${cleanCampaign}`;

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
      <div className="flex items-center gap-3 mb-6 px-2">
         <div className="w-10 h-10 rounded-2xl bg-accent-blue/10 flex items-center justify-center text-accent-blue border border-accent-blue/20">
            <QrCode size={20} />
         </div>
         <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">QR Capture Engine</h2>
      </div>

      <div className="grid grid-cols-3 gap-8 pb-10">
         {/* Generator Settings */}
         <div className="col-span-1 space-y-6">
            <div className="glass-card p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
               <div className="relative z-10 flex items-center gap-2 mb-6 text-accent-blue">
                  <Settings2 size={16} />
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Capture Parameters</h3>
               </div>
               
               <div className="relative z-10 space-y-4">
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Intent Source Label</label>
                    <input 
                      type="text" 
                      value={source}
                      onChange={e => setSource(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-accent-blue/50 transition-colors"
                      placeholder="e.g. Business Card, Storefront"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Campaign Tracking (UTM)</label>
                    <input 
                      type="text" 
                      value={campaign}
                      onChange={e => setCampaign(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-accent-blue/50 transition-colors"
                      placeholder="e.g. Q1 Expo"
                    />
                  </div>
               </div>

               <div className="mt-8 pt-6 border-t border-white/5">
                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Generated Capture Link</label>
                  <div className="flex items-center gap-2 bg-black border border-white/10 rounded-xl px-4 py-3 text-white">
                     <Link size={14} className="text-slate-500 shrink-0" />
                     <input type="text" readOnly value={captureUrl} className="bg-transparent outline-none text-xs w-full text-slate-400" />
                  </div>
               </div>
            </div>
         </div>

         {/* Generated QR Code */}
         <div className="col-span-1 flex flex-col items-center justify-center p-8 glass-card border border-white/5 rounded-[2rem]">
            {/* The actual div we will convert to an image */}
            <div 
               ref={qrRef} 
               className="bg-white p-6 rounded-3xl mb-8 shadow-[0_0_50px_rgba(255,255,255,0.1)] flex items-center justify-center"
               style={{ width: '240px', height: '240px' }} // Fixed dimensions to ensure clean export
            >
                <div style={{ height: "auto", margin: "0 auto", maxWidth: 192, width: "100%" }}>
                  <QRCode
                    size={256}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    value={captureUrl}
                    viewBox={`0 0 256 256`}
                    level="H" // High error correction so it scans nicely even if slightly obscured
                  />
                </div>
            </div>
            
            <button onClick={handleDownload} className="w-full bg-accent-blue text-white font-black text-[10px] uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(45,140,255,0.3)] hover:bg-blue-500 transition-colors flex items-center justify-center gap-2">
               <Download size={16} /> Download
            </button>
            
         </div>

         {/* Mobile Preview */}
      {/* <div className="col-span-1 border-l border-white/5 pl-8 flex justify-center">
            <div className="w-[300px] h-[600px] border-[8px] border-black rounded-[3rem] bg-[#0A0D14] shadow-2xl overflow-hidden relative">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl" />
               <div className="p-6 h-full flex flex-col pt-12">
                  <div className="w-12 h-12 rounded-xl bg-accent-blue mx-auto mb-4 flex items-center justify-center text-white font-black">BOS</div>
                  <h3 className="text-center text-white font-black text-lg mb-2">Claim Your Brief</h3>
                  <p className="text-center text-slate-400 text-xs mb-8">Enter your details and the AI will analyze your digital footprint instantly.</p>
                  
                  <div className="space-y-4">
                     <div className="h-12 bg-white/5 rounded-xl border border-white/10 px-4 flex items-center text-slate-500 text-xs">Full Name</div>
                     <div className="h-12 bg-white/5 rounded-xl border border-white/10 px-4 flex items-center text-slate-500 text-xs">Email Address</div>
                     <div className="h-12 bg-white/5 rounded-xl border border-white/10 px-4 flex items-center text-slate-500 text-xs">Phone (Optional)</div>
                  </div>
                  
                  <div className="mt-8 bg-accent-blue rounded-xl py-4 text-center text-white font-black text-xs">Initialize Analysis ➔</div>
               </div>
            </div>
         </div> */}
      </div>
    </div>
  );
}
