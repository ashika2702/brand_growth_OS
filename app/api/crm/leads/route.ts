import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { callAI } from '@/lib/ai';
import { createNotification } from '@/lib/notifications';
import { addCRMJob } from '@/lib/queue';

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
        }
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

    // 2. Trigger AI Persona Tagging & Scoring
    const aiResponse = await callAI({
      provider: 'llama',
      userId: 'system',
      clientId,
      moduleName: 'CRM',
      prompt: `Analyze this new lead:
      NAME: ${name}
      EMAIL: ${email}
      SOURCE: ${source || 'N/A'}
      CAMPAIGN: ${utmCampaign || 'N/A'} (Source: ${utmSource || 'N/A'}, Medium: ${utmMedium || 'N/A'})
      
      TASK 1: From the TARGET PERSONAS in your brain context, which one matches best? (Return JUST the name, 1-3 words max)
      TASK 2: Calculate a LEAD SCORE from 0-100 based on their origin, intent signal from source, and known persona alignment.
      
      CRITICAL: Output ONLY the requested format. Do not include any explanations, reasoning, introductions, or markdown.
      REQUIRED FORMAT: EXACT_PERSONA_NAME | SCORE
      EXAMPLE: B2B Founder | 85`,
      maxTokens: 50
    });

    const [personaTagRaw, scoreRaw] = (aiResponse.content || "Unknown | 0").split('|');
    const personaTag = personaTagRaw ? personaTagRaw.trim() : "Unknown";
    const score = scoreRaw ? (parseInt(scoreRaw.trim()) || 0) : 0;

    // 3. Update the lead with the tag and score
    const updatedLead = await prisma.lead.update({
      where: { id: lead.id },
      data: { personaTag, score }
    });

    // 4. Trigger background auto-responder
    await addCRMJob('lead.new', updatedLead.id, updatedLead.clientId, {
      email: updatedLead.email,
      name: updatedLead.name
    });

    // 5. Fire Internal Notification
    await createNotification({
      clientId,
      type: 'lead.new',
      title: 'New Lead Captured',
      message: `${name} (Score: ${score}/100) just entered the pipeline via ${source || 'Direct'}.`,
      priority: score > 70 ? 'urgent' : 'high',
      link: `/crm/${clientId}`
    });

    return NextResponse.json(updatedLead);
  } catch (error: any) {
    console.error('CRM Create Error:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
