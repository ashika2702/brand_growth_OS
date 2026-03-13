import React from 'react';
import { ShieldCheck } from 'lucide-react';
import HubPage from '@/components/ui/HubPage';

export default function ClientsHub() {
  const modules = [
    {
      title: 'Client Portal',
      description: 'Secure interface for clients to view reports and approve content.',
      href: '/portal',
      icon: <ShieldCheck />,
      color: 'bg-blue-500',
    },
  ];

  return (
    <HubPage 
      title="Clients" 
      description="Build trust with transparent reporting and collaboration." 
      modules={modules} 
    />
  );
}
