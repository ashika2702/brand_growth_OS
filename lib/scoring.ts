import { callAI } from './ai';

export interface LeadScoreFactors {
  personaMatch: number;      // 0-30
  sourceQuality: number;     // 0-25
  behaviourScore: number;    // 0-20
  stageVelocity: number;     // 0-15
  offerFit: number;          // 0-10
}

export const SOURCE_SCORES: Record<string, number> = {
  'referral': 25,
  'google_ads': 22,
  'meta_ads': 20,
  'organic': 18,
  'qr_code': 15,
  'manual': 10,
  'unknown': 5
};

/**
 * M15: Advanced Lead Scoring Engine (5-Factor Formula)
 * Calculates a lead score from 0-100 following BGO master spec.
 */
export async function calculateLeadScore(
  lead: { name: string; email: string; source?: string; intent?: string },
  clientId: string,
  userId: string = 'system'
): Promise<{ total: number; factors: LeadScoreFactors; personaName: string }> {
  
  // 1. Static Factors
  const sourceKey = (lead.source?.toLowerCase() || 'unknown').includes('qr') ? 'qr_code' :
                    (lead.source?.toLowerCase() || 'unknown').includes('google') ? 'google_ads' :
                    (lead.source?.toLowerCase() || 'unknown').includes('meta') ? 'meta_ads' :
                    (lead.source?.toLowerCase() || 'unknown').includes('referral') ? 'referral' : 'unknown';
  
  const sourceQuality = SOURCE_SCORES[sourceKey] || SOURCE_SCORES['unknown'];
  
  const behaviourScore = lead.intent ? 15 : 10;
  const stageVelocity = 5;

  // 2. AI Factors (Persona Match & Offer Fit)
  const aiResponse = await callAI({
    provider: 'llama',
    userId,
    clientId,
    moduleName: 'crm',
    prompt: `Analyze this new lead against the Business Brain:
    NAME: ${lead.name}
    EMAIL: ${lead.email}
    INTENT: ${lead.intent || 'N/A'}
    SOURCE: ${lead.source || 'N/A'}
    
    TASK:
    1. Persona Match: From the TARGET PERSONAS in your brain context, which one matches best? (Score 0-30 AND return the Persona Name)
    2. Offer Fit: How well does their intent match the CORE OFFERS provided in your brain context? (Score 0-10)
    
    CRITICAL: Output ONLY a JSON object.
    REQUIRED FORMAT: { "personaMatch": 0-30, "personaName": "EXACT_NAME", "offerFit": 0-10 }`,
    systemOverride: 'Return JSON only. No explanation.'
  });

  let aiFactors = { personaMatch: 15, personaName: 'Unknown', offerFit: 5 }; 
  try {
    const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      aiFactors = JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('[SCORING_AI_PARSE_ERROR]', e);
  }

  const factors: LeadScoreFactors = {
    personaMatch: Math.min(30, aiFactors.personaMatch || 0),
    sourceQuality,
    behaviourScore,
    stageVelocity,
    offerFit: Math.min(10, aiFactors.offerFit || 0)
  };

  const total = factors.personaMatch + factors.sourceQuality + factors.behaviourScore + factors.stageVelocity + factors.offerFit;

  return {
    total: Math.min(100, total),
    factors,
    personaName: aiFactors.personaName || 'Unknown'
  };
}

/**
 * Returns the CSS border color/style based on BGO thresholds.
 */
export function getScoreStyle(score: number): { border: string; label: string; priority: 'low' | 'medium' | 'high' | 'urgent' } {
  if (score >= 80) return { border: 'border-red-500', label: 'HOT', priority: 'urgent' };
  if (score >= 60) return { border: 'border-amber-500', label: 'WARM', priority: 'high' };
  if (score >= 40) return { border: 'border-blue-500', label: 'COOL', priority: 'medium' };
  return { border: 'border-gray-500', label: 'COLD', priority: 'low' };
}
