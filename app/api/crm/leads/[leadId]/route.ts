import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { addCRMJob } from '@/lib/queue';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params;
    const {
      name,
      email,
      phone,
      stage,
      quotedValue,
      lossReason,
      score,
      scoreFactors,
      isAutoPilotActive,
      currentSequenceId,
      addressStreet,
      addressCity,
      addressState,
      addressZip,
      addressCountry,
      description,
      customFields
    } = await request.json();
 
    const oldLead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!oldLead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
 
    const updateData: any = {
      lastActivityAt: new Date()
    };
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (stage !== undefined) updateData.stage = stage;
    if (quotedValue !== undefined) updateData.quotedValue = quotedValue;
    if (lossReason !== undefined) updateData.lossReason = lossReason;
    if (score !== undefined) updateData.score = score;
    if (scoreFactors !== undefined) updateData.scoreFactors = scoreFactors;
    if (isAutoPilotActive !== undefined) updateData.isAutoPilotActive = isAutoPilotActive;
    if (currentSequenceId !== undefined) updateData.currentSequenceId = currentSequenceId;
    if (addressStreet !== undefined) updateData.addressStreet = addressStreet;
    if (addressCity !== undefined) updateData.addressCity = addressCity;
    if (addressState !== undefined) updateData.addressState = addressState;
    if (addressZip !== undefined) updateData.addressZip = addressZip;
    if (addressCountry !== undefined) updateData.addressCountry = addressCountry;
    if (description !== undefined) updateData.description = description;
    if (customFields !== undefined) updateData.customFields = customFields;
 
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: updateData,
      include: {
        activities: { orderBy: { createdAt: 'desc' } },
        attachments: true
      }
    });

    // Log stage change activity if stage changed
    if (stage && oldLead.stage !== stage) {
      await prisma.leadActivity.create({
        data: {
          leadId: leadId,
          type: 'stage_change',
          description: `Stage updated from ${oldLead.stage.toUpperCase()} to ${stage.toUpperCase()}`,
          metadata: { fromStage: oldLead.stage, toStage: stage }
        }
      });

      // Trigger background automation
      await addCRMJob('lead.stage_updated', updatedLead.id, updatedLead.clientId, {
        oldStage: oldLead.stage,
        newStage: updatedLead.stage
      });
    }

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error('Lead update error:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params;
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        activities: { orderBy: { createdAt: 'desc' } },
        tasks: { orderBy: { dueDate: 'asc' } },
        attachments: { orderBy: { createdAt: 'desc' } },
        humanGates: { where: { status: 'pending' } }
      }
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 });
  }
}
