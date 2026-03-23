import { NextResponse } from 'next/server';
import { generateImage } from '@/lib/openai';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const data = await generateImage(prompt);
    
    if (!data || !data[0] || !data[0].url) {
      throw new Error('Image generation failed to return a valid URL');
    }

    return NextResponse.json({ imageUrl: data[0].url });
  } catch (error: any) {
    console.error('Image generation failed:', error);
    return NextResponse.json({ error: error.message || 'Image generation failed' }, { status: 500 });
  }
}
