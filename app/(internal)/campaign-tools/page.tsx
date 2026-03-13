import React from 'react';
import { LayoutPanelTop, Mail, Megaphone } from 'lucide-react';
import HubPage from '@/components/ui/HubPage';

export default function CampaignToolsHub() {
  const modules = [
    {
      title: 'Landing Pages',
      description: 'Capture leads and promote offers with high-converting builders.',
      href: '/landing-pages',
      icon: <LayoutPanelTop />,
      color: 'bg-accent-orange',
    },
    {
      title: 'Email / SMS',
      description: 'Communicate directly via automated email and SMS sequences.',
      href: '/communication',
      icon: <Mail />,
      color: 'bg-accent-blue',
    },
    {
      title: 'PR Engine',
      description: 'Manage press releases, media outreach, and reputation.',
      href: '/pr',
      icon: <Megaphone />,
      color: 'bg-accent-green',
    },
  ];

  return (
    <HubPage 
      title="Campaign Tools" 
      description="Tools to execute and communicate your marketing campaigns." 
      modules={modules} 
    />
  );
}
