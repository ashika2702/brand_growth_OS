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

        // Phase 4: Autonomous Sequence Activation
        // Trigger the sequence runner specifically for this new lead immediately
        console.log(`[CRM AUTOMATION] ACTIVATING NEURAL SEQUENCE FOR ${name} (${email})`);
        const { runSequences } = require('../lib/sequences');
        await runSequences(leadId);

        // Internal log
        await createNotification({
          clientId,
          type: 'crm.automation',
          title: 'Neural Sequence Active',
          message: `Alex AI has drafted and sent the first outreach to ${name}.`,
          priority: 'low',
          link: `/crm/${clientId}`
        });
        break;
      }

      case 'lead.stage_updated': {
        const { oldStage, newStage } = data;

        // Dynamic Lead Scoring: Adjust score based on pipeline progression
        let updatedScore = lead.score;
        const stageMappings: Record<string, number> = {
          'contacted': 40,
          'qualified': 60,
          'quoted': 80,
          'won': 100,
          'lost': 0
        };

        // If the new stage has a higher priority/score, update it
        if (stageMappings[newStage] !== undefined) {
          // We only increase the score (unless it's 'lost') to prevent logic loops
          if (newStage === 'lost' || stageMappings[newStage] > lead.score) {
            updatedScore = stageMappings[newStage];

            await prisma.lead.update({
              where: { id: leadId },
              data: { score: updatedScore }
            });

            await prisma.leadActivity.create({
              data: {
                leadId,
                type: 'score_update',
                description: `Dynamic Score Adjustment: ${lead.score} -> ${updatedScore} (${newStage.toUpperCase()} stage reached).`
              }
            });
          }
        }

        // Automation: If moved to "quoted" (or the legacy "proposal"), trigger notifications
        if (newStage === 'quoted' || newStage === 'proposal') {
          await createNotification({
            clientId,
            type: 'crm.automation',
            title: 'High-Value Intent',
            message: `Lead ${lead.name} moved to Quoted. Score boosted to ${updatedScore}.`,
            priority: 'medium',
            link: `/crm/${clientId}`
          });
        }

        // Automation: If moved to "won" (or the legacy "closed_won"), fire win triggers
        if (newStage === 'won' || newStage === 'closed_won') {
          await createNotification({
            clientId,
            type: 'crm.win',
            title: 'Account Won! (100 pts)',
            message: `Congratulations! ${lead.name} is now a client. Starting onboarding...`,
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
