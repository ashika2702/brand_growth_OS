import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { addCRMJob } from '@/lib/queue';

export async function PATCH(
  request: Request,
  { params }: { params: { leadId: string } }
) {
  try {
    const { stage } = await request.json();

    if (!stage) {
      return NextResponse.json({ error: 'Missing stage' }, { status: 400 });
    }

    const oldLead = await prisma.lead.findUnique({ where: { id: params.leadId } });

    const updatedLead = await prisma.lead.update({
      where: { id: params.leadId },
      data: { stage }
    });

    // Trigger background automation
    await addCRMJob('lead.stage_updated', updatedLead.id, updatedLead.clientId, {
      oldStage: oldLead?.stage,
      newStage: updatedLead.stage
    });

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error('Lead update error:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}
