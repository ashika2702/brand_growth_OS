import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { callAI } from '@/lib/ai';
import { createNotification } from '@/lib/notifications';
import { addCRMJob } from '@/lib/queue';
import { calculateLeadScore, getScoreStyle } from '@/lib/scoring';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const body = await req.json();
    const { name, email, phone, source, campaign, intent } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Verify the client actually exists to prevent spamming random endpoints
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 404 });
    }

    const compiledSource = `${source} (${campaign})`.trim();

    // 0. Find first active sequence for this client to auto-enroll
    const defaultSequence = await prisma.neuralSequence.findFirst({
        where: { clientId, isActive: true },
        orderBy: { createdAt: 'asc' }
    });

    // 1. Create the Lead with initial data
    const lead = await prisma.lead.create({
      data: {
        clientId,
        name,
        email,
        phone,
        source: compiledSource,
        intent: intent || null,
        stage: 'new',
        score: 0, // Placeholder, will update with AI
        isAutoPilotActive: !!defaultSequence,
        currentSequenceId: defaultSequence?.id || null,
        scoreFactors: {
          behavior: 50,
          velocity: 80,
          source: 90,
        }
      }
    });

    // 1b. Create LeadSequence record if auto-enrolled
    if (defaultSequence) {
        await prisma.leadSequence.create({
            data: {
                leadId: lead.id,
                sequenceId: defaultSequence.id,
                status: 'active',
                currentStep: 0,
                nextStepAt: new Date() // Trigger immediately
            }
        });
    }

    // 2. Trigger Advanced Persona Tagging & Scoring (M15)
    try {
      const { total, factors, personaName } = await calculateLeadScore(
        { name, email, source: compiledSource, intent },
        clientId
      );

      // 3. Update the lead with AI results
      const updatedLead = await prisma.lead.update({
        where: { id: lead.id },
        data: { 
          score: total,
          personaTag: personaName,
          scoreFactors: factors as any // Store factors breakdown
        }
      });
      
      // 4. Trigger background auto-responder/drafting
      await addCRMJob('lead.new', updatedLead.id, clientId, {
          email: updatedLead.email,
          name: updatedLead.name
      });

      // Update local variable for notification
      lead.score = total;
      
      // Get score style for prioritization (M15)
      const scoreStyle = getScoreStyle(total);

      // 5. Fire Internal Notification with Priority (M17)
      await createNotification({
        clientId,
        type: 'lead.new',
        title: `[${scoreStyle.label}] New Lead Captured (QR)`,
        message: `${name} (Score: ${total}/100) just scanned the QR code. Interest: ${intent?.slice(0, 50) || 'General'}${intent?.length > 50 ? '...' : ''}`,
        priority: scoreStyle.priority,
        link: `/crm/${clientId}`
      });

    } catch (aiError) {
      console.error('[PUBLIC_CAPTURE_AI_ERROR]', aiError);
      // Fallback for AI failure (Neutral profile)
      await prisma.lead.update({
        where: { id: lead.id },
        data: { score: 40, personaTag: 'Neutral' }
      });
    }

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });

  } catch (error) {
    console.error('[PUBLIC_CAPTURE_POST]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
