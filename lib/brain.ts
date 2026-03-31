import prisma from './db';

/**
 * Rule 1: getBrainContext(clientId)
 * Fetches the client's full profile and formats it as a markdown string for LLM injection.
 */
export async function getBrainContext(clientId: string): Promise<string> {
  try {
    const brain = await prisma.businessBrain.findUnique({
      where: { clientId },
      include: { client: true }
    });

    if (!brain) return "No brand context found for this client.";

    const personas = Array.isArray(brain.personas) ? brain.personas : [];
    const offers = Array.isArray(brain.offers) ? brain.offers : [];

    const voice = (brain.voiceGuide as any) || {};

    return `
### BRAND CONTEXT: ${brain.client.name}
**Domain**: ${brain.client.domain || 'N/A'}

#### BRAND VOICE (A6 Rules):
- **Tone**: ${voice.tone || 'Professional'}
- **Style Adjectives**: ${(voice.adjectives || []).join(', ') || 'N/A'}
- **Vocabulary DOs**: ${(voice.vocab_do || []).join(', ') || 'N/A'}
- **Vocabulary DONTs**: ${(voice.vocab_dont || []).join(', ') || 'N/A'}
- **Master Reference Sample**: ${voice.samples?.[0] || 'None provided'}

#### TARGET PERSONAS:
${personas.map((p: any) => `- **${p.name}**: ${p.description || ''} (Pains: ${p.painPoints || ''}, Desires: ${p.desires || ''}, Blueprint: ${p.blueprint || 'N/A'})`).join('\n')}

#### CORE OFFERS:
${offers.map((o: any) => `- **${o.name}** (${o.price || 'N/A'}): ${o.valueProp || ''}`).join('\n')}

#### MESSAGING ANGLES:
${JSON.stringify(brain.messagingAngles || {}, null, 2)}
    `.trim();
  } catch (error) {
    console.error('Error fetching brain context:', error);
    return "Failed to load brand context.";
  }
}
