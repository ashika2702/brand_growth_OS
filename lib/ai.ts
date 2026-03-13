import { callClaude } from './claude';
import { callLlama } from './llama';
import { getBrainContext } from './brain';
import { getRoleContext } from './role_context';

export type AIProvider = 'claude' | 'llama';

export interface AICallParams {
  provider: AIProvider;
  userId: string;
  clientId: string;
  moduleName: string;
  prompt: string;
  systemOverride?: string; // Additional instructions to append to the system prompt
  maxTokens?: number;
}

/**
 * Unified AI Caller — v2.0 Context Orchestrator
 * Strictly enforces Rule 1 (Brain) and Rule 2 (Role).
 */
export async function callAI(params: AICallParams) {
  const { provider, userId, clientId, moduleName, prompt, systemOverride, maxTokens } = params;

  // 1. Fetch contexts (The Two Core Rules)
  const roleContext = await getRoleContext(userId, moduleName);
  const brainContext = await getBrainContext(clientId);

  // 2. Combine to form the v2.0 System Prompt
  const system = `${roleContext}\n\n${brainContext}${systemOverride ? `\n\n${systemOverride}` : ''}`;

  // 3. Delegate to provider
  if (provider === 'llama') {
    const response = await callLlama({ system, prompt, maxTokens });
    return {
      content: response.choices[0].message.content,
      model: response.model,
      provider: 'llama'
    };
  }

  // Default to Claude
  const response = await callClaude({ system, prompt, maxTokens });
  return {
    content: response.content[0].type === 'text' ? response.content[0].text : 'Non-text response from Claude',
    model: response.model,
    provider: 'claude'
  };
}
