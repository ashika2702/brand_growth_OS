import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';

// Validation Schema for Business Brain
const brainSchema = z.object({
  clientId: z.string(),
  clientName: z.string().optional(),
  domain: z.string().url().optional().or(z.literal('')),
  personas: z.array(z.any()).optional(),
  offers: z.array(z.any()).optional(),
  onlineChannels: z.array(z.string()).optional(),
  offlineChannels: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
  messagingAngles: z.any().optional(),
  competitorIntel: z.any().optional(),
  voiceGuide: z.any().optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.number().optional(),
  smtpUser: z.string().optional(),
  smtpPass: z.string().optional(),
  imapHost: z.string().optional(),
  imapPort: z.number().optional(),
  fromName: z.string().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');

  if (!clientId) {
    return NextResponse.json({ error: 'Missing clientId' }, { status: 400 });
  }

  try {
    const brain = await prisma.businessBrain.findUnique({
      where: { clientId },
      include: { client: true },
    });

    return NextResponse.json(brain);
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch brain' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = brainSchema.parse(body);

    const {
      clientId,
      clientName,
      domain,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      imapHost,
      imapPort,
      fromName,
      ...brainData
    } = validated;

    // 1. Ensure Client exists
    const client = await prisma.client.upsert({
      where: { id: clientId },
      update: {
        name: clientName || 'Unnamed Client',
        domain: domain || null,
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPass,
        imapHost,
        imapPort,
        fromName
      },
      create: {
        id: clientId,
        name: clientName || 'Unnamed Client',
        domain: domain || null,
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPass,
        imapHost,
        imapPort,
        fromName
      },
    });

    // 2. Upsert Brain
    const brain = await prisma.businessBrain.upsert({
      where: { clientId: client.id },
      update: brainData,
      create: {
        clientId: client.id,
        ...brainData,
      },
    });

    return NextResponse.json({ success: true, brain });
  } catch (error) {
    console.error('Upsert error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update brain' }, { status: 500 });
  }
}
