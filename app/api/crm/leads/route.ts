import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { createNotification } from '@/lib/notifications';
import { addCRMJob } from '@/lib/queue';
import { calculateLeadScore, getScoreStyle } from '@/lib/scoring';

/**
 * GET /api/crm/leads
 * Fetches leads for a specific clientId with RLS-style filtering.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({ error: 'Missing clientId' }, { status: 400 });
    }

    const leads = await prisma.lead.findMany({
      where: { clientId },
      include: {
        activities: {
          orderBy: { createdAt: 'desc' }
        },
        tasks: {
          orderBy: { dueDate: 'asc' }
        },
        humanGates: {
          where: { status: 'pending' }
        },
        form: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(leads);
  } catch (error: any) {
    console.error('CRM Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

/**
 * POST /api/crm/leads
 * Creates a new lead and automatically tags them with a Persona using AI.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientId, name, email, phone, source, utmSource, utmMedium, utmCampaign } = body;

    if (!clientId || !name || !email) {
      return NextResponse.json({ error: 'Missing required lead fields' }, { status: 400 });
    }

    // 0. Find first active sequence for this client to auto-enroll
    const defaultSequence = await prisma.neuralSequence.findFirst({
      where: { clientId, isActive: true },
      orderBy: { createdAt: 'asc' }
    });

    // 1. Create the lead first (with auto-pilot if sequence exists)
    const lead = await prisma.lead.create({
      data: {
        clientId,
        name,
        email,
        phone,
        source: source || 'Direct',
        utmSource,
        utmMedium,
        utmCampaign,
        stage: 'new',
        isAutoPilotActive: !!defaultSequence,
        currentSequenceId: defaultSequence?.id || null
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
    const { total, factors, personaName } = await calculateLeadScore(
      { name, email, source: source || 'Direct' },
      clientId
    );

    // 3. Update the lead with the tag and score
    const updatedLead = await prisma.lead.update({
      where: { id: lead.id },
      data: { 
        personaTag: personaName, 
        score: total,
        scoreFactors: factors as any
      }
    });

    // 4. Trigger background auto-responder
    await addCRMJob('lead.new', updatedLead.id, updatedLead.clientId, {
      email: updatedLead.email,
      name: updatedLead.name
    });

    // Get score style for prioritization (M15)
    const scoreStyle = getScoreStyle(total);

    // 5. Fire Internal Notification (M17)
    await createNotification({
      clientId,
      type: 'lead.new',
      title: `[${scoreStyle.label}] New Lead Created`,
      message: `${name} (Score: ${total}/100) just entered the pipeline via ${source || 'Direct'}. Persona: ${personaName}.`,
      priority: scoreStyle.priority,
      link: `/crm/${clientId}`
    });

    return NextResponse.json(updatedLead);
  } catch (error: any) {
    console.error('CRM Create Error:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
