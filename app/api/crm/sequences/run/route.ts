import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { callAI } from '@/lib/ai';
import { sendLeadEmail } from '@/lib/mail';

export async function POST(request: Request) {
    try {
        const now = new Date();

        // 1. Fetch all active sequences that are due for the next step
        const dueSequences = await prisma.leadSequence.findMany({
            where: {
                status: 'active',
                nextStepAt: { lte: now },
                lead: {
                    isAutoPilotActive: true,
                    stage: { notIn: ['qualified', 'won', 'lost'] }
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
                await sendLeadEmail({
                    to: lead.email,
                    subject,
                    html: content.replace(/\n/g, '<br/>'),
                    leadId: lead.id,
                    clientId: lead.clientId
                });

                // 3. Log Activity
                await prisma.leadActivity.create({
                    data: {
                        leadId: lead.id,
                        type: 'email',
                        description: `Autonomous Sequence "${sequence.name}" - Step ${currentStep + 1} Sent`,
                        metadata: {
                            sequenceName: sequence.name,
                            step: currentStep + 1,
                            subject,
                            method: 'neural-sequence'
                        }
                    }
                });

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

                // Update lead's last activity
                await prisma.lead.update({
                    where: { id: lead.id },
                    data: {
                        lastActivityAt: new Date(),
                        stage: lead.stage === 'new' ? 'contacted' : lead.stage
                    }
                });

                results.push({ leadId: lead.id, status: 'success' });

            } catch (stepErr) {
                console.error(`Error processing step for lead ${enrollment.leadId}:`, stepErr);
                results.push({ leadId: enrollment.leadId, status: 'failed', error: (stepErr as any).message });
            }
        }

        return NextResponse.json({
            processed: dueSequences.length,
            results
        });

    } catch (error) {
        console.error('Sequence Runner Error:', error);
        return NextResponse.json({ error: 'Failed to run sequences' }, { status: 500 });
    }
}
