import prisma from './db';

/**
 * Lead Auditor
 * Proactively checks for stagnant leads, manages dormancy, and updates behavioral scores.
 */
export async function auditLeads() {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - (72 * 60 * 60 * 1000));
    const twoDaysAgo = new Date(now.getTime() - (48 * 60 * 60 * 1000));

    // 1. Find Stagnant Leads (No activity in 48 hours)
    // We only care about leads that aren't already 'won' or 'lost'
    const stagnantLeads = await prisma.lead.findMany({
        where: {
            stage: { notIn: ['won', 'lost'] },
            lastActivityAt: { lte: twoDaysAgo },
            score: { gt: 0 }
        }
    });

    console.log(`🔍 [AUDITOR] Auditing ${stagnantLeads.length} stagnant leads...`);

    for (const lead of stagnantLeads) {
        try {
            // Decrease score by 5 for every 48 hours of silence
            const newScore = Math.max(0, lead.score - 5);
            
            let stageUpdate = lead.stage;
            let activityDesc = `Lead score automatically adjusted due to inactivity. (Internal Score: ${newScore})`;

            // If score hits 0, move to Lost (Dormant)
            if (newScore === 0) {
                stageUpdate = 'lost';
                activityDesc = "Lead marked as 'Lost' due to prolonged inactivity (Dormant).";
            }

            await prisma.lead.update({
                where: { id: lead.id },
                data: {
                    score: newScore,
                    stage: stageUpdate,
                    lastActivityAt: now, // Reset timer so we don't double-hit in the next 5 mins
                    lossReason: stageUpdate === 'lost' ? 'Dormant' : lead.lossReason
                }
            });

            await prisma.leadActivity.create({
                data: {
                    leadId: lead.id,
                    type: 'score_update',
                    description: activityDesc,
                    metadata: { prevScore: lead.score, newScore, reason: 'dormancy_audit' }
                }
            });

            // If score dropped below critical threshold (e.g., 20), trigger a notification
            if (newScore <= 20 && lead.score > 20) {
                await prisma.notification.create({
                    data: {
                        clientId: lead.clientId,
                        type: 'lead.at_risk',
                        title: `Lead At Risk: ${lead.name}`,
                        message: `Engagement has dropped significantly. Manual intervention recommended.`,
                        link: `/crm/${lead.clientId}?leadId=${lead.id}`,
                        priority: 'high'
                    }
                });
            }

        } catch (error) {
            console.error(`❌ [AUDITOR] Audit failed for lead ${lead.id}:`, error);
        }
    }

    return { audited: stagnantLeads.length };
}
