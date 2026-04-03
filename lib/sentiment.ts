import { callAI } from './ai';

export type LeadIntent = 'INTERESTED' | 'NOT_INTERESTED' | 'UNSUBSCRIBE' | 'NEUTRAL';

export async function analyzeLeadIntent(lead: any, message: string): Promise<LeadIntent> {
    const prompt = `
    Analyze the following email reply from a lead and classify their INTENT.
    
    LEAD NAME: ${lead.name}
    MESSAGE:
    """
    ${message}
    """
    
    CLASSIFICATION RULES:
    - INTERESTED: Lead says "yes", "sounds good", "thanks", "okay", "great", asks a question, wants a demo, asks for pricing, or shows positive interest.
    - NOT_INTERESTED: Lead explicitly declines, says "no thank you", "not interested", "not for us", or "don't contact me".
    - UNSUBSCRIBE: Lead says "stop", "remove me", "unsubscribe", or is aggressive about stopping.
    - NEUTRAL: Lead asks who this is, asks why they received this, or is unclear.
    
    CRITICAL: "Sounds good", "Thanks", "Ok", and "I'm interested" MUST be classified as INTERESTED.
    
    RETURN ONLY ONE WORD: INTERESTED, NOT_INTERESTED, UNSUBSCRIBE, or NEUTRAL.
    `;

    const response = await callAI({
        provider: 'nemoclaw',
        userId: 'system',
        clientId: lead.clientId,
        moduleName: 'crm',
        prompt,
        systemOverride: 'Return only the classification word. No punctuation or explanation.'
    });

    const content = response.content.trim().toUpperCase();
    if (content.includes('UNSUBSCRIBE')) return 'UNSUBSCRIBE';
    if (content.includes('NOT_INTERESTED')) return 'NOT_INTERESTED';
    if (content.includes('INTERESTED')) return 'INTERESTED';
    return 'NEUTRAL';
}

export async function generateAutoReply(lead: any, message: string): Promise<string> {
    const prompt = `
    A lead just replied to your outreach with interest! 
    
    LEAD NAME: ${lead.name}
    LEAD MESSAGE:
    """
    ${message}
    """
    
    TASK:
    - Draft a short, professional, and helpful reply.
    - Acknowledge their specific point/question.
    - Keep it under 3 sentences.
    - Match the Brand Voice provided in the context.
    - End with a clear next step (e.g., "Would you like to hop on a quick 5-min call?").
    
    DO NOT include subject lines or signatures. Just the body text.
    `;

    const response = await callAI({
        provider: 'nemoclaw',
        userId: 'system',
        clientId: lead.clientId,
        moduleName: 'crm',
        prompt
    });

    return response.content.trim();
}

export async function generateHandoffReply(lead: any, message: string): Promise<string> {
    const prompt = `
    A lead who is already part of our qualified pipeline just sent another message! 
    
    LEAD NAME: ${lead.name}
    LEAD MESSAGE:
    """
    ${message}
    """
    
    TASK:
    - Draft a very short, polite acknowledgement.
    - Inform them that the team has been notified and will be in touch shortly to discuss next steps.
    - Use the phrasing: "One of our team members will be in touch with you shortly."
    - DO NOT ask any new questions or suggest new calls.
    - Keep it to 1-2 sentences max.
    
    DO NOT include subject lines or signatures. Just the body text.
    `;

    const response = await callAI({
        provider: 'nemoclaw',
        userId: 'system',
        clientId: lead.clientId,
        moduleName: 'crm',
        prompt
    });

    return response.content.trim();
}
