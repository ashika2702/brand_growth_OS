import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { callAI } from '@/lib/ai';

export async function GET(
  request: Request,
  { params }: { params: { leadId: string } }
) {
  try {
    const leadId = params.leadId;
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10
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
      You are a Sales Intelligence Agent for Brand Growth OS.
      
      Analyze this lead's state and history:
      Name: ${lead.name}
      Stage: ${lead.stage}
      Score: ${lead.score}
      Persona: ${lead.personaTag}
      
      RECENT HISTORY:
      ${activityContext || 'None'}
      
      TASK:
      Suggest the 3 "Next Best Actions" to move this lead to the next stage.
      Be specific, strategic, and concise.
      
      REQUIRED FORMAT: Action 1 | Action 2 | Action 3
      EXAMPLE: Call to discuss pricing | Send the case study link | Invite to Tuesday webinar
      
      CRITICAL: Output ONLY the 3 actions separated by pipes. No other text.
    `;

    const aiResponse = await callAI({
      provider: 'llama',
      userId: 'system',
      clientId: lead.clientId,
      moduleName: 'CRM',
      prompt,
      maxTokens: 100
    });

    const suggestions = (aiResponse.content || "").split('|').map(s => s.trim());

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    console.error('Suggestions Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 });
  }
}
