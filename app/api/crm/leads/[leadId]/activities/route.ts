import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params;
    const { type, description, metadata } = await request.json();

    if (!type || !description) {
      return NextResponse.json({ error: 'Missing type or description' }, { status: 400 });
    }

    const activity = await prisma.leadActivity.create({
      data: {
        leadId: leadId,
        type,
        description,
        metadata
      }
    });

    // Also update lastActivityAt on the Lead
    await prisma.lead.update({
      where: { id: leadId },
      data: { lastActivityAt: new Date() }
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Create Lead Activity Error:', error);
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
  }
}
