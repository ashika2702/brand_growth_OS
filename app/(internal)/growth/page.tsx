import React from 'react';
import { Search, MapPin, Sparkles } from 'lucide-react';
import HubPage from '@/components/ui/HubPage';

export default function GrowthHub() {
  const modules = [
    {
      title: 'SEO Engine',
      description: 'Keyword research, content optimization, and ranking tracking.',
      href: '/seo',
      icon: <Search />,
      color: 'bg-blue-500',
    },
    {
      title: 'Local SEO',
      description: 'Optimize Google Business profiles and local search visibility.',
      href: '/seo/local',
      icon: <MapPin />,
      color: 'bg-teal-500',
    },
    {
      title: 'AEO',
      description: 'Answer Engine Optimization for ChatGPT and AI search platforms.',
      href: '/aeo',
      icon: <Sparkles />,
      color: 'bg-purple-500',
    },
  ];

  return (
    <HubPage 
      title="Growth" 
      description="Dominate search engines and answer engines alike." 
      modules={modules} 
    />
  );
}
