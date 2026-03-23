import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { callAI } from '@/lib/ai';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params;
    const { searchParams } = new URL(request.url);
    const instruction = searchParams.get('instruction');

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const activityContext = lead.activities
      .map(a => `- ${a.type}: ${a.description}`)
      .join('\n');

    const prompt = `
      You are Alex, an elite sales strategist for Brand Growth OS.
      
      LEAD PROFILE:
      Name: ${lead.name}
      Persona: ${lead.personaTag || 'Target Client'}
      Source: ${lead.source || 'Direct'}
      
      RECENT ACTIVITY:
      ${activityContext || 'None'}
      
      TASK:
      ${instruction 
        ? `Draft a highly personalized, high-conversion WhatsApp message specifically focused on this goal: "${instruction}"`
        : 'Draft a highly personalized, high-conversion follow-up message for WhatsApp.'}
      
      Keep it short, professional yet punchy, and refer to their persona/source if relevant.
      The goal is to get a quick response or a meeting booked.
      
      CRITICAL: Return ONLY the message content. No "Here is the draft" or markdown formatting.
    `;

    const aiResponse = await callAI({
      provider: 'llama',
      userId: 'system',
      clientId: lead.clientId,
      moduleName: 'CRM',
      prompt,
      maxTokens: 300
    });

    return NextResponse.json({ draft: aiResponse.content });
  } catch (error: any) {
    console.error('Draft Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate draft' }, { status: 500 });
  }
}
