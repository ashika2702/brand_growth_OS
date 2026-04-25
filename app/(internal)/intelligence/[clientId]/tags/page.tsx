'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function GTMPageRedirect() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;

  useEffect(() => {
    if (clientId) {
      router.replace(`/intelligence/${clientId}/tags/overview`);
    }
  }, [clientId, router]);

  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse text-text-muted italic uppercase font-black">Redirecting to Tag Intelligence...</div>
    </div>
  );
}
