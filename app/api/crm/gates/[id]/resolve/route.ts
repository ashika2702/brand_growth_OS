import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gateId = (await params).id;

  try {
    const gate = await prisma.humanGate.findUnique({
      where: { id: gateId },
    });

    if (!gate) {
      return NextResponse.json({ error: 'Gate not found' }, { status: 404 });
    }

    if (gate.status !== 'pending') {
      return NextResponse.json({ success: true, message: 'Already resolved' });
    }

    // 1. Update Gate Status
    await prisma.humanGate.update({
      where: { id: gateId },
      data: {
        status: 'approved',
        resolvedAt: new Date(),
        resolutionNote: 'Marked as sent manually by user'
      }
    });

    const context = gate.contextJson as any;
    if (context && context.leadId) {
        // 2. Move lead to 'contacted'
        await prisma.lead.update({
            where: { id: context.leadId },
            data: { stage: 'contacted', lastActivityAt: new Date() }
        });

        // 3. Log Activity
        await prisma.leadActivity.create({
            data: {
                leadId: context.leadId,
                type: 'email_sent',
                description: `Gated AI Draft marked as SENT manually.`,
                metadata: {
                    releasedFromGate: gateId,
                    manual: true
                }
            }
        });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[HUMAN GATE RESOLVE ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
