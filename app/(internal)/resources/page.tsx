import React from 'react';
import { ImageIcon } from 'lucide-react';
import HubPage from '@/components/ui/HubPage';

export default function ResourcesHub() {
  const modules = [
    {
      title: 'Asset Library',
      description: 'Central storage for logos, images, videos, and ad creatives.',
      href: '/assets',
      icon: <ImageIcon />,
      color: 'bg-teal-500',
    },
  ];

  return (
    <HubPage 
      title="Resources" 
      description="Organize and access your brand assets efficiently." 
      modules={modules} 
    />
  );
}
