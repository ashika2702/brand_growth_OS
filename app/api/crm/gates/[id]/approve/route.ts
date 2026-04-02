import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { sendLeadEmail } from '@/lib/mail';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gateId = (await params).id;

  try {
    const gate = await prisma.humanGate.findUnique({
      where: { id: gateId },
      include: { client: true }
    });

    if (!gate) {
      return NextResponse.json({ error: 'Gate not found' }, { status: 404 });
    }

    if (gate.status !== 'pending') {
      return NextResponse.json({ error: 'Gate already resolved' }, { status: 400 });
    }

    const context = gate.contextJson as any;
    if (!context || !context.draftSubject || !context.draftHtml || !context.leadId) {
      return NextResponse.json({ error: 'Invalid gate context' }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: context.leadId }
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // 1. Send the email
    console.log(`[HUMAN GATE] Releasing email for lead ${lead.name}`);
    await sendLeadEmail({
      to: lead.email,
      subject: context.draftSubject,
      html: context.draftHtml,
      leadId: lead.id,
      clientId: gate.clientId
    });

    // 2. Update Gate Status
    await prisma.humanGate.update({
      where: { id: gateId },
      data: {
        status: 'approved',
        resolvedAt: new Date(),
        resolutionNote: 'Released by human via API'
      }
    });

    // 3. Move Lead to 'contacted'
    await prisma.lead.update({
        where: { id: lead.id },
        data: { 
            stage: 'contacted',
            lastActivityAt: new Date()
        }
    });

    // 4. Log Activity as "Released"
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: 'email_sent',
        description: `Gated AI Draft Released: "${context.draftSubject}"`,
        metadata: {
            subject: context.draftSubject,
            method: 'neural-sequence',
            content: context.draftHtml,
            releasedFromGate: gateId
        }
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[HUMAN GATE APPROVE ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
