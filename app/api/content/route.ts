import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('clientId');

  if (!clientId) {
    return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
  }

  try {
    const requests = await prisma.contentRequest.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch content requests' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clientId, title, type, platform, briefText, dueDate, assignedTo, priority, campaign } = body;

    if (!clientId || !title || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const request = await prisma.contentRequest.create({
      data: {
        clientId,
        title,
        type,
        platform: platform || [],
        briefText,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedTo,
        priority: priority || 'medium',
        campaign,
        status: 'REQUESTED'
      },
    });

    return NextResponse.json(request);
  } catch (error) {
    console.error('Create content request failed:', error);
    return NextResponse.json({ error: 'Failed to create content request' }, { status: 500 });
  }
}
