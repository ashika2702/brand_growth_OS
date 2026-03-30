import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { callAI } from '@/lib/ai';
import { sendLeadEmail } from '@/lib/mail';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ leadId: string }> }
) {
    try {
        const { leadId } = await params;

        // 1. Fetch Lead and Client Brain
        const lead = await prisma.lead.findUnique({
            where: { id: leadId },
            include: {
                client: {
                    include: {
                        brain: true,
                        assignedUsers: { select: { id: true } }
                    }
                }
            }
        });

        if (!lead || !lead.client.brain) {
            return NextResponse.json({ error: 'Lead or Brain not found' }, { status: 404 });
        }

        // 2. Prepare AI Prompt
        const prompt = `Write a high-conversion follow-up email to ${lead.name}.
    Context: They entered our system via ${lead.source || 'General Capture'}.
    Their identified Persona: ${lead.personaTag || 'General Interest'}.
    
    The email must be perfectly aligned with our Brand Voice.
    Keep it short, helpful, and end with a soft call-to-action or a question.
    Do not mention that you are an AI.`;

        // 3. Find a valid user for the role context
        const userId = lead.assignedTo || lead.client.assignedUsers[0]?.id || 'system';

        // 4. Generate Content via Alex AI
        const { content } = await callAI({
            provider: 'nemoclaw',
            userId,
            clientId: lead.clientId,
            moduleName: 'CRM Auto-Pilot',
            prompt
        });

        // 4. Send Email via Nodemailer
        const subject = `Re: Your interest in ${lead.client.name}`;
        await sendLeadEmail({
            to: lead.email,
            subject,
            html: content.replace(/\n/g, '<br/>'),
            leadId: lead.id,
            clientId: lead.clientId
        });

        // 5. Log Activity
        await prisma.leadActivity.create({
            data: {
                leadId,
                type: 'email',
                description: `Sent AI Automated Follow-up: "${subject}"`,
                metadata: {
                    subject,
                    snippet: content.substring(0, 100) + '...',
                    method: 'auto-pilot'
                }
            }
        });

        // 6. Update Lead
        await prisma.lead.update({
            where: { id: leadId },
            data: {
                stage: lead.stage === 'new' ? 'contacted' : lead.stage,
                lastActivityAt: new Date()
            }
        });

        return NextResponse.json({ success: true, content });
    } catch (error) {
        console.error('Auto-followup error:', error);
        return NextResponse.json({ error: 'Failed to execute auto-followup' }, { status: 500 });
    }
}
