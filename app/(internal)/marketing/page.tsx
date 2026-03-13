import React from 'react';
import { PenTool, Target, Activity } from 'lucide-react';
import HubPage from '@/components/ui/HubPage';

export default function MarketingHub() {
  const modules = [
    {
      title: 'Content Tap',
      description: 'AI content generation engine for social posts, ad copy, and blogs.',
      href: '/content/tap',
      icon: <PenTool />,
      color: 'bg-purple-500',
    },
    {
      title: 'Campaign Strategy',
      description: 'Strategic planning, target audience selection, and channel management.',
      href: '/strategy',
      icon: <Target />,
      color: 'bg-teal-500',
    },
    {
      title: 'Workflow Engine',
      description: 'Marketing automation for content publishing and lead follow-ups.',
      href: '/workflow',
      icon: <Activity />,
      color: 'bg-blue-500',
    },
  ];

  return (
    <HubPage 
      title="Marketing" 
      description="Scale your reach with AI-driven content and strategy." 
      modules={modules} 
    />
  );
}
