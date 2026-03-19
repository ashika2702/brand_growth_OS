import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { clientId } = await req.json();

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    // 1. Gather all the "Brain" data for this client
    const [client, intelligence, existingRequests] = await Promise.all([
      prisma.client.findUnique({ 
        where: { id: clientId },
        include: { brain: true }
      }),
      prisma.contentIntelligence.findUnique({ where: { clientId } }),
      prisma.contentRequest.findMany({ 
        where: { clientId },
        take: 10,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Handle brain data
    const brain = client.brain;
    const personas = (brain?.personas as any[]) || [];
    const offers = (brain?.offers as any[]) || [];

    // 2. Prepare the AI "Orchestrator" Mission
    const systemPrompt = `You are "Max", a Senior AI Content Producer. 
Your mission is to "Fill the Gaps" in a marketing calendar. 

CURRENT CLIENT: ${client.name}
TARGET PERSONAS: ${personas.map(p => p.name || p).join(', ')}
TOP OFFERS: ${offers.map(o => o.title || o).join(', ')}
CONTENT INTELLIGENCE TIPS: ${intelligence?.tips?.join('; ') || 'None yet'}

RECENT CONTENT ALREADY IN QUEUE:
${existingRequests.map(r => `- ${r.title} (${r.platform})`).join('\n')}

MISSION: Suggest 3 NEW high-impact pieces of content that are NOT already in the queue. 
Directly address the top pain points of the personas and leverage the best offers.

IMAGE PROMPT RULE: Describe a PHOTOREALISTIC, HIGH-END PHOTOGRAPHY scene. AVOID ALL TEXT, LOGOS, OR GRAPHICS in the image. Focus on cinematic lighting and atmosphere.

Return JSON ONLY in this format:
{
  "suggestions": [
    {
      "title": "Short catchy title",
      "type": "REEL" | "AD" | "BLOG",
      "platform": ["IG", "FB"],
      "imagePrompt": "Detailed visual description following the rule",
      "reasoning": "Why this fulfills a gap"
    }
  ]
}`;

    // 3. Ask the Brain
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Analyze and fill the gaps for next week." }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message?.content || '{}');
    const suggestions = result.suggestions || [];

    // 4. Create the suggested requests in the DB as "REQUESTED"
    const created = await Promise.all(suggestions.map(async (s: any) => {
        return prisma.contentRequest.create({
            data: {
                clientId,
                title: s.title,
                type: s.type,
                platform: s.platform,
                status: 'REQUESTED',
                aiBrief: {
                    image_prompt: s.imagePrompt
                },
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week out
            }
        });
    }));

    return NextResponse.json({ count: created.length, suggestions: created });

  } catch (error: any) {
    console.error('Orchestration failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
