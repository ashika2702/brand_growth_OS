import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const body = await req.json();
    const { name, email, phone, source, campaign } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Verify the client actually exists to prevent spamming random endpoints
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 404 });
    }

    const compiledSource = `${source} (${campaign})`.trim();

    // 1. Create the Lead
    const lead = await prisma.lead.create({
      data: {
        clientId,
        name,
        email,
        phone,
        source: compiledSource,
        stage: 'new', // Hardcoded initial stage
        score: Math.floor(Math.random() * 41) + 40, // Mock initial score logic (40-80)
        // UTM Tracking data mocked into Json
        scoreFactors: {
          behavior: 50,
          velocity: 80, // Instant velocity from active scan
          source: 90, // High intent source since it's a direct physical scan
        }
      }
    });

    // 2. Log initial acquisition activity
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: 'note',
        description: `Lead securely acquired via physical QR code scan at ${compiledSource}.`
      }
    });

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });

  } catch (error) {
    console.error('[PUBLIC_CAPTURE_POST]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
