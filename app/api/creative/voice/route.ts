import { NextResponse } from 'next/server';
import { generateVoice } from '@/lib/elevenlabs';

export async function POST(req: Request) {
  try {
    const { text, voiceId } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const buffer = await generateVoice(text, voiceId);
    
    if (!buffer) {
        return NextResponse.json({ 
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' 
        });
    }

    return new Response(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error: any) {
    console.error('Voice generation failed:', error);
    return NextResponse.json({ error: error.message || 'Voice generation failed' }, { status: 500 });
  }
}
