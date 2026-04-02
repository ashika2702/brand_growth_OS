import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
        return NextResponse.json({ error: 'Missing clientId' }, { status: 400 });
    }

    try {
        const sequences = await prisma.neuralSequence.findMany({
            where: { clientId },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(sequences);
    } catch (error) {
        console.error('Failed to fetch sequences:', error);
        return NextResponse.json({ error: 'Failed to fetch sequences' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { clientId, name, description, steps } = body;

        if (!clientId || !name) {
            return NextResponse.json({ error: 'Missing clientId or name' }, { status: 400 });
        }

        const sequence = await prisma.neuralSequence.upsert({
            where: {
                clientId_name: {
                    clientId,
                    name
                }
            },
            update: {
                description,
                steps: steps || []
            },
            create: {
                clientId,
                name,
                description,
                steps: steps || []
            }
        });

        return NextResponse.json(sequence);
    } catch (error) {
        console.error('Failed to save sequence:', error);
        return NextResponse.json({ error: 'Failed to save sequence' }, { status: 500 });
    }
}
