import React from 'react';
import { BarChart3, Percent } from 'lucide-react';
import HubPage from '@/components/ui/HubPage';

export default function IntelligenceHub() {
  const modules = [
    {
      title: 'Analytics',
      description: 'Performance measurement system tracking traffic and conversion metrics.',
      href: '/analytics',
      icon: <BarChart3 />,
      color: 'bg-teal-500',
    },
    {
      title: 'Lead Scoring',
      description: 'AI-based lead qualification based on behavior and persona fit.',
      href: '/leads/scoring',
      icon: <Percent />,
      color: 'bg-purple-500',
    },
  ];

  return (
    <HubPage 
      title="Intelligence" 
      description="Data-driven insights to fuel your growth decisions." 
      modules={modules} 
    />
  );
}
