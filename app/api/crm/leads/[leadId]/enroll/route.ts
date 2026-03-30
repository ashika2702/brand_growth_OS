import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ leadId: string }> }
) {
    try {
        const { sequenceId } = await request.json();
        const { leadId } = await params;

        if (!sequenceId) {
            return NextResponse.json({ error: 'Missing sequenceId' }, { status: 400 });
        }

        // 1. Remove from any existing sequence
        await prisma.leadSequence.deleteMany({
            where: { leadId }
        });

        // 2. Create new LeadSequence enrollment
        const leadSequence = await prisma.leadSequence.create({
            data: {
                leadId,
                sequenceId,
                status: 'active',
                currentStep: 0,
                nextStepAt: new Date(), // Trigger immediately
            }
        });

        // 3. Update lead's pointer and enable auto-pilot
        await prisma.lead.update({
            where: { id: leadId },
            data: {
                currentSequenceId: sequenceId,
                isAutoPilotActive: true
            }
        });

        return NextResponse.json(leadSequence);
    } catch (error) {
        console.error('Enrollment Error:', error);
        return NextResponse.json({ error: 'Failed to enroll lead' }, { status: 500 });
    }
}
