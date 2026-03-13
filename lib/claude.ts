import Anthropic from '@anthropic-ai/sdk';
import { getBrainContext } from './brain';
import { getRoleContext } from './role_context';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Standard BGO Claude call pattern:
 * Receives the pre-computed Role + Brain context from lib/ai.ts
 */
export async function callClaude({
  system,
  prompt,
  maxTokens = 1000
}: {
  system: string;
  prompt: string;
  maxTokens?: number;
}) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: prompt }]
  });

  return response;
}
