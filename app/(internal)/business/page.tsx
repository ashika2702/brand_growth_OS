import React from 'react';
import { Brain, Users } from 'lucide-react';
import HubPage from '@/components/ui/HubPage';

export default function BusinessHub() {
  const modules = [
    {
      title: 'Agent',
      description: 'Central intelligence of the brand. Stores brand info, personas, and tone of voice.',
      href: '/brain',
      icon: <Brain />,
      color: 'bg-accent-orange',
    },
    {
      title: 'CRM',
      description: 'Client and lead management system. Track leads, deals, and interaction history.',
      href: '/crm',
      icon: <Users />,
      color: 'bg-accent-blue',
    },
  ];

  return (
    <HubPage 
      title="Business" 
      description="Manage your brand intelligence and client relationships." 
      modules={modules} 
    />
  );
}
