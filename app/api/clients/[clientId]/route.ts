import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function PATCH(
    request: Request,
    { params }: { params: { clientId: string } }
) {
    try {
        const { clientId } = params;
        const body = await request.json();

        const updatedClient = await prisma.client.update({
            where: { id: clientId },
            data: {
                smtpHost: body.smtpHost,
                smtpPort: body.smtpPort,
                smtpUser: body.smtpUser,
                smtpPass: body.smtpPass,
                imapHost: body.imapHost,
                imapPort: body.imapPort,
                fromName: body.fromName,
                // Also allow updating other basic fields if sent
                name: body.name,
                domain: body.domain,
                primaryColor: body.primaryColor
            }
        });

        return NextResponse.json(updatedClient);
    } catch (error) {
        console.error('Failed to update client:', error);
        return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
    }
}

export async function GET(
    request: Request,
    { params }: { params: { clientId: string } }
) {
    try {
        const { clientId } = params;
        const client = await prisma.client.findUnique({
            where: { id: clientId },
            include: {
                brain: true
            }
        });

        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        return NextResponse.json(client);
    } catch (error) {
        console.error('Failed to fetch client:', error);
        return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 });
    }
}
