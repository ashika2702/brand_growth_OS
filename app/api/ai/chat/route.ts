import { NextResponse } from 'next/server';
import { callAI, AIProvider } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { provider, prompt, userId, clientId, moduleName } = await request.json();

    if (!prompt || !userId || !clientId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await callAI({
      provider: (provider as AIProvider) || 'claude',
      userId,
      clientId,
      moduleName: moduleName || 'Playground',
      prompt
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal AI error',
      details: error.status === 401 ? 'Check your API keys in .env' : undefined
    }, { status: 500 });
  }
}
