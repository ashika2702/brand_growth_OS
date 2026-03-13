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
      color: 'bg-purple-500',
    },
    {
      title: 'Email / SMS',
      description: 'Communicate directly via automated email and SMS sequences.',
      href: '/communication',
      icon: <Mail />,
      color: 'bg-blue-500',
    },
    {
      title: 'PR Engine',
      description: 'Manage press releases, media outreach, and reputation.',
      href: '/pr',
      icon: <Megaphone />,
      color: 'bg-teal-500',
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
