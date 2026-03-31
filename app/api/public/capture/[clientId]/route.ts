import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { callAI } from '@/lib/ai';
import { createNotification } from '@/lib/notifications';

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
        scoreFactors: {
          behavior: 50,
          velocity: 80,
          source: 90,
        }
      }
    });

    // 2. Trigger AI Persona Tagging & Scoring
    try {
      const aiResponse = await callAI({
        provider: 'llama',
        userId: 'system',
        clientId,
        moduleName: 'Lead Capture',
        prompt: `Analyze this new lead from a QR Scan/Public Form:
        NAME: ${name}
        EMAIL: ${email}
        INTENT/INTEREST: ${intent || 'N/A'}
        SOURCE: ${compiledSource}
        
        TASK 1: From the TARGET PERSONAS in your brain context, which one matches best? (Return JUST the name, 1-3 words max)
        TASK 2: Calculate a LEAD SCORE from 0-20 based on their expressed intent and profile fit.
        
        CRITICAL: Output ONLY the requested format. Do not include any explanations, reasoning, introductions, or markdown.
        REQUIRED FORMAT: EXACT_PERSONA_NAME | SCORE
        EXAMPLE: B2B Founder | 15`,
        maxTokens: 50
      });

      const [personaTagRaw, scoreRaw] = (aiResponse.content || "Unknown | 0").split('|');
      const personaTag = personaTagRaw ? personaTagRaw.trim() : "Unknown";
      const score = scoreRaw ? (parseInt(scoreRaw.trim()) || 0) : 0;

      // 3. Update the lead with AI results
      await prisma.lead.update({
        where: { id: lead.id },
        data: { personaTag, score }
      });
      
      // Update local variable for notification
      lead.score = score;
    } catch (aiError) {
      console.error('[PUBLIC_CAPTURE_AI_ERROR]', aiError);
      // Fallback for AI failure
      await prisma.lead.update({
        where: { id: lead.id },
        data: { score: 50, personaTag: 'Unknown' }
      });
    }

    // 4. Log initial acquisition activity
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: 'note',
        description: `Lead securely acquired via physical QR code scan at ${compiledSource}. Expressed Intent: ${intent || 'None specified'}.`
      }
    });

    // 5. Fire Internal Notification
    await createNotification({
      clientId,
      type: 'lead.new',
      title: 'New Lead Captured (QR)',
      message: `${name} (Score: ${lead.score}/100) just scanned the QR code. Interest: ${intent?.slice(0, 50) || 'General'}${intent?.length > 50 ? '...' : ''}`,
      priority: lead.score > 70 ? 'urgent' : 'high',
      link: `/crm/${clientId}`
    });

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });

  } catch (error) {
    console.error('[PUBLIC_CAPTURE_POST]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
