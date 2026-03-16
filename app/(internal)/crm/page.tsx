import { redirect } from 'next/navigation';
import prisma from '@/lib/db';

export default async function CRMIndexRedirect() {
  const firstClient = await prisma.client.findFirst({
    select: { id: true },
    orderBy: { createdAt: 'desc' }
  });

  if (!firstClient) {
    // If no client exists, send them to the Agent setup page to create one
    redirect('/brain');
  }

  redirect(`/crm/${firstClient.id}`);
}
