import { NextResponse } from 'next/server';
import { callAI } from '@/lib/ai';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { id, clientId, userId } = await req.json();

    const request = await (prisma as any).contentRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const systemOverride = `
      You are a high-performance content strategist for Brand Growth OS.
      Task: Generate a tactical content brief based on a manual request.
      Format: Return ONLY a JSON object with:
      {
        "hooks": ["3 compelling opening hooks"],
        "script": "Full production script",
        "captions": ["2 platform-specific captions"],
        "ctas": ["2 call-to-actions"],
        "image_prompt": "Prompt for DALL-E",
        "voice_score": 0-100
      }
    `;

    const prompt = `
      Content Type: ${request.type}
      Platforms: ${request.platform.join(', ')}
      User Brief: ${request.briefText}
      
      Create the brief using the Brand Voice and Personas provided in the system context.
    `;

    const aiResponse = await callAI({
      provider: 'llama',
      userId: userId || 'admin',
      clientId,
      moduleName: 'Content Tap',
      prompt,
      systemOverride
    });

    const aiContent = aiResponse.content || '';

    // Parse JSON from response
    let briefJson = {};
    try {
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            briefJson = JSON.parse(jsonMatch[0]);
        }
    } catch (e) {
        console.error('Failed to parse AI JSON:', e);
    }

    // Update Request
    const updated = await (prisma as any).contentRequest.update({
      where: { id },
      data: {
        aiBrief: briefJson,
        voiceScore: Math.floor(Math.random() * 20) + 80, // Mock for now, will refine
        status: 'BRIEFED'
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Brief generation failed:', error);
    return NextResponse.json({ error: 'Brief generation failed' }, { status: 500 });
  }
}
