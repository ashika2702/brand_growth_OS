import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');

  if (!clientId) {
    return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
  }

  const gates = await prisma.humanGate.findMany({
    where: {
      clientId,
      status: 'pending'
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(gates);
}
