import prisma from './db';
import { callAI } from './ai';
import { sendLeadEmail } from './mail';
import { appendGmailDraft } from './imap';

export async function runSequences(targetLeadId?: string) {
    const now = new Date();

    // 1. Fetch all active sequences that are due (or a specific lead if provided)
    const dueSequences = await prisma.leadSequence.findMany({
        where: {
            status: 'active',
            nextStepAt: { lte: now },
            lead: {
                id: targetLeadId, // If targetLeadId is null/undefined, this is ignored by Prisma
                isAutoPilotActive: true,
                stage: { notIn: ['qualified', 'won', 'lost', 'won', 'lost'] }
            }
        },
        include: {
            lead: {
                include: {
                    client: {
                        include: {
                            brain: true,
                            assignedUsers: { select: { id: true } }
                        }
                    }
                }
            },
            sequence: true
        }
    });

    const results = [];

    for (const enrollment of dueSequences) {
        try {
            const { lead, sequence, currentStep } = enrollment;
            const steps = (sequence.steps as any) || [];
            const step = steps[currentStep];

            if (!step) {
                await prisma.leadSequence.update({
                    where: { id: enrollment.id },
                    data: { status: 'completed' }
                });
                continue;
            }

            // 2. Draft & Send AI Email based on step strategy
            const prompt = `Task: Continue the sales conversation with ${lead.name}.
            Sequence Name: ${sequence.name}
            Current Sequence Step: ${currentStep + 1} of ${steps.length}
            
            SPECIFIC STRATEGY FOR THIS STEP: 
            "${step.strategy}"
            
            Context:
            - Source: ${lead.source || 'General'}
            - Persona: ${lead.personaTag || 'General'}
            - Brain Offers: ${JSON.stringify(lead.client.brain?.offers || [])}
            
            Guidelines:
            - Follow the brand voice strictly.
            - Keep it under 150 words.
            - End with a low-friction question.
            - Do not mention this is an automated sequence.`;

            const userId = lead.assignedTo || lead.client.assignedUsers[0]?.id || 'system';

            const { content } = await callAI({
                provider: 'nemoclaw',
                userId,
                clientId: lead.clientId,
                moduleName: 'Neural Sequence Runner',
                prompt
            });

            const subject = `Re: Your interest in ${lead.client.name}`;
            
            // --- NEW: HUMAN GATE LOGIC ---
            if (lead.client.autoPilotMode === 'manual') {
                console.log(`[HUMAN GATE] Drafting Gmail email for ${lead.name} (Manual Mode)`);
                
                // 1. Append Draft to Gmail
                await appendGmailDraft(lead.client, {
                    to: lead.email,
                    subject,
                    html: content.replace(/\n/g, '<br/>')
                });

                // 2. Create Gate in DB
                await prisma.humanGate.create({
                    data: {
                        clientId: lead.clientId,
                        leadId: lead.id,
                        agentId: 'sequence',
                        gateType: 'approval',
                        question: `Approve AI-drafted reply to ${lead.name}?`,
                        contextJson: {
                            leadId: lead.id,
                            sequenceId: sequence.id,
                            draftSubject: subject,
                            draftHtml: content.replace(/\n/g, '<br/>'),
                            stepIndex: currentStep
                        }
                    }
                });

                // 3. Log Activity as Drafted
                await prisma.leadActivity.create({
                    data: {
                        leadId: lead.id,
                        type: 'email_draft',
                        description: `AI Drafted Sequence "${sequence.name}" - Step ${currentStep + 1} (Synced to Gmail)`,
                        metadata: {
                            sequenceName: sequence.name,
                            step: currentStep + 1,
                            subject,
                            method: 'neural-sequence',
                            content,
                            isAutoReply: true,
                            isGated: true
                        }
                    }
                });
            } else {
                // --- EXISTING: AUTOPILOT LOGIC ---
                await sendLeadEmail({
                    to: lead.email,
                    subject,
                    html: content.replace(/\n/g, '<br/>'),
                    leadId: lead.id,
                    clientId: lead.clientId
                });

                // Log Activity as Sent
                await prisma.leadActivity.create({
                    data: {
                        leadId: lead.id,
                        type: 'email_sent',
                        description: `Autonomous Sequence "${sequence.name}" - Step ${currentStep + 1} Sent`,
                        metadata: {
                            sequenceName: sequence.name,
                            step: currentStep + 1,
                            subject,
                            method: 'neural-sequence',
                            content,
                            isAutoReply: true
                        }
                    }
                });
            }

            // 4. Update the enrollment for the next step
            const nextStepIdx = currentStep + 1;
            const nextStep = steps[nextStepIdx];

            if (nextStep) {
                const nextDate = new Date();
                nextDate.setDate(nextDate.getDate() + (nextStep.delayDays || 1));

                await prisma.leadSequence.update({
                    where: { id: enrollment.id },
                    data: {
                        currentStep: nextStepIdx,
                        nextStepAt: nextDate,
                        status: 'active'
                    }
                });
            } else {
                await prisma.leadSequence.update({
                    where: { id: enrollment.id },
                    data: { status: 'completed' }
                });
            }

            // 5. Update lead's last activity
            // ONLY move to 'contacted' if we are in autopilot mode.
            // In 'manual' mode, lead remains in their current stage (usually 'new') for visual grouping.
            const shouldChangeStage = lead.client.autoPilotMode !== 'manual' && lead.stage === 'new';
            
            await prisma.lead.update({
                where: { id: lead.id },
                data: {
                    lastActivityAt: new Date(),
                    stage: shouldChangeStage ? 'contacted' : lead.stage
                }
            });

            results.push({ leadId: lead.id, status: 'success' });

        } catch (stepErr) {
            console.error(`Error processing step for lead ${enrollment.leadId}:`, stepErr);
            results.push({ leadId: enrollment.leadId, status: 'failed', error: (stepErr as any).message });
        }
    }

    return results;
}
