import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('clientId');

  if (!clientId) {
    return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
  }

  try {
    const intelligence = await prisma.contentIntelligence.findUnique({
      where: { clientId },
    });
    
    // Return empty array if no intelligence found yet
    return NextResponse.json(intelligence?.tips || []);
  } catch (error) {
    console.error('Failed to fetch intelligence:', error);
    return NextResponse.json({ error: 'Failed to fetch intelligence' }, { status: 500 });
  }
}
