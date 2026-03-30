import { callClaude } from './claude';
import { callLlama } from './llama';
import { callNemoClaw } from './nemoclaw';
import { getBrainContext } from './brain';
import { getRoleContext } from './role_context';

export type AIProvider = 'claude' | 'llama' | 'nemoclaw';

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
  let aiResponse: any;
  if (provider === 'llama') {
    aiResponse = await callLlama({ system, prompt, maxTokens });
  } else if (provider === 'nemoclaw') {
    aiResponse = await callNemoClaw({ system, prompt, maxTokens });
  } else {
    aiResponse = await callClaude({ system, prompt, maxTokens });
  }

  const content = (provider === 'llama' || provider === 'nemoclaw')
    ? aiResponse.choices[0].message.content
    : (aiResponse.content[0].type === 'text' ? aiResponse.content[0].text : 'Non-text response');

  // 4. RULE 16: A6 Enforcement Gate (The Referee)
  // Only apply to Content Tap modules where voice consistency is critical
  if (moduleName === 'Content Tap' && !prompt.includes('A6_REFEREE_BYPASS')) {
    const refereePrompt = `
      You are the A6 Brand Voice Referee. 
      Analyze the following AI output against the BRAND VOICE Rules provided in the system context.
      
      OUTPUT TO ANALYZE:
      """
      ${content}
      """
      
      SCORING CRITERIA:
      1. Tone match (0-40 pts)
      2. Vocabulary adherence (0-30 pts)
      3. Style/Adjective match (0-30 pts)
      
      Return JSON ONLY:
      {
        "score": 0-100,
        "critique": "Short explanation of deviations",
        "should_rewrite": true/false
      }
    `;

    const refereeResponse = await callLlama({ system, prompt: refereePrompt, maxTokens: 500 });
    let refereeData: { score: number; should_rewrite: boolean; critique?: string } = { score: 100, should_rewrite: false };

    try {
      const content = refereeResponse.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) refereeData = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('A6 referee JSON parse failed');
    }

    // 5. Auto-Rewrite if threshold not met
    if (refereeData.should_rewrite || (refereeData.score || 0) < 80) {
      console.log(`A6 GATE: Score ${refereeData.score} below threshold. Critique: ${refereeData.critique}. Retrying...`);
      const rewritePrompt = `${prompt}\n\nA6_CORRECTION_FEEDBACK: ${refereeData.critique || 'The output did not match the brand voice rules closely enough.'}\n\nPlease regenerate the output strictly following the brand voice guidelines provided. A6_REFEREE_BYPASS`;

      return callAI({ ...params, prompt: rewritePrompt });
    }

    return {
      content,
      model: aiResponse.model,
      provider,
      voiceScore: refereeData.score
    };
  }

  return {
    content,
    model: aiResponse.model,
    provider
  };
}
