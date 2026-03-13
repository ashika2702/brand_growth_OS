import Groq from 'groq-sdk';
import { getBrainContext } from './brain';
import { getRoleContext } from './role_context';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Standard BGO Llama call pattern:
 * Receives the pre-computed Role + Brain context from lib/ai.ts
 */
export async function callLlama({
  system,
  prompt,
  model = 'llama-3.3-70b-versatile',
  temperature = 0.7,
  maxTokens = 1000
}: {
  system: string;
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}) {
  const response = await groq.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: prompt }
    ],
    temperature,
    max_tokens: maxTokens,
  });

  return response;
}
