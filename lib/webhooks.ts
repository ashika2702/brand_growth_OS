import prisma from './db';
import { calculateLeadScore, getScoreStyle } from './scoring';
import { createNotification } from './notifications';
import { addCRMJob } from './queue';

export interface WebhookLeadData {
  clientId: string;
  name: string;
  email: string;
  phone?: string;
  source: 'google_ads' | 'meta_ads' | 'linkedin_ads' | 'twitter_ads';
  intent?: string;
  utmCampaign?: string;
  metadata?: any;
}

/**
 * Universal Lead Processor for Ad Webhooks (M03)
 * Handles creation, scoring (M15), tagging, and notifications (M17).
 */
export async function processWebhookLead(data: WebhookLeadData) {
  try {
    // 1. Check for existing lead (Deduplication by email)
    let lead = await prisma.lead.findFirst({
      where: { 
        clientId: data.clientId,
        email: data.email.toLowerCase()
      }
    });

    if (lead) {
      // Update existing lead with new activity
      await prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          type: 'note',
          description: `Duplicate lead submission via ${data.source}. Intent updated: ${data.intent || 'N/A'}`
        }
      });
      return lead;
    }

    // 0. Find first active sequence for this client to auto-enroll
    const defaultSequence = await prisma.neuralSequence.findFirst({
        where: { clientId: data.clientId, isActive: true },
        orderBy: { createdAt: 'asc' }
    });

    // 2. Create the Lead
    lead = await prisma.lead.create({
      data: {
        clientId: data.clientId,
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone,
        source: data.source,
        utmSource: data.source,
        utmCampaign: data.utmCampaign,
        intent: data.intent,
        stage: 'new',
        isAutoPilotActive: !!defaultSequence,
        currentSequenceId: defaultSequence?.id || null
      }
    });

    // 1b. Create LeadSequence record if auto-enrolled
    if (defaultSequence) {
        await prisma.leadSequence.create({
            data: {
                leadId: lead.id,
                sequenceId: defaultSequence.id,
                status: 'active',
                currentStep: 0,
                nextStepAt: new Date() // Trigger immediately
            }
        });
    }

    // 3. Trigger Advanced Scoring (M15)
    const { total, factors, personaName } = await calculateLeadScore(
      { name: data.name, email: data.email, source: data.source, intent: data.intent },
      data.clientId
    );

    // 4. Update Lead with AI results
    const updatedLead = await prisma.lead.update({
      where: { id: lead.id },
      data: {
        score: total,
        personaTag: personaName,
        scoreFactors: factors as any
      }
    });

    // 5. Trigger Queue (Auto-Pilot / Alex drafting)
    await addCRMJob('lead.new', updatedLead.id, data.clientId, {
      email: updatedLead.email,
      name: updatedLead.name
    });

    // 6. Fire Notification (M17)
    const style = getScoreStyle(total);
    const platformLabel = data.source.replace('_ads', '').toUpperCase();

    await createNotification({
      clientId: data.clientId,
      type: 'lead.new',
      title: `[${style.label}] New ${platformLabel} Lead`,
      message: `${data.name} just submitted a ${platformLabel} form. Score: ${total}/100. Persona: ${personaName}.`,
      priority: style.priority,
      link: `/crm/${data.clientId}`
    });

    return updatedLead;
  } catch (error) {
    console.error('[PROCESS_WEBHOOK_LEAD_ERROR]', error);
    throw error;
  }
}
