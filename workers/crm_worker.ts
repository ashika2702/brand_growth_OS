import prisma from '../lib/db';
import { createNotification } from '../lib/notifications';

/**
 * CRM Automation Engine
 * Handles background automations for the Lead Pipeline without Redis.
 */
export async function processCRMAutomation(type: string, leadId: string, clientId: string, data: any = {}) {
  try {
    console.log(`[CRM AUTOMATION] Processing ${type} for lead ${leadId}`);

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { client: true }
    });

    if (!lead) return;

    switch (type) {
      case 'lead.new': {
        const { email, name } = data;
        
        // Automation: Send a "Welcome" notification to the lead (Simulated)
        console.log(`[CRM AUTOMATION] SENDING EXTERNAL WELCOME MESSAGE TO ${name} (${email})`);
        
        // Internal log
        await createNotification({
          clientId,
          type: 'crm.automation',
          title: 'Welcome Auto-Responder',
          message: `Sent welcome intelligence packet to ${name}.`,
          priority: 'low',
          link: `/crm/${clientId}`
        });
        break;
      }

      case 'lead.stage_updated': {
        const { oldStage, newStage } = data;
        
        // Automation: If moved to "proposal", send a simulate notification
        if (newStage === 'proposal') {
           await createNotification({
             clientId,
             type: 'crm.automation',
             title: 'Automation Triggered',
             message: `Lead ${lead.name} moved to Proposal. Drafting personalized brief...`,
             priority: 'medium',
             link: `/crm/${clientId}`
           });
           
           console.log(`[CRM AUTOMATION] Auto-drafting brief for ${lead.email}`);
        }

        // Automation: If moved to "closed_won", fire "Social Proof" job trigger
        if (newStage === 'closed_won') {
           await createNotification({
             clientId,
             type: 'crm.win',
             title: 'Account Won!',
             message: `Congratulations! ${lead.name} is now a client. Triggering onboarding...`,
             priority: 'high',
             link: `/crm/${clientId}`
           });
        }
        break;
      }

      default:
        console.warn(`Unknown automation type: ${type}`);
    }
  } catch (error) {
    console.error(`[CRM AUTOMATION] Failed:`, error);
  }
}
