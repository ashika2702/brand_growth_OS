import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { processWebhookLead } from '@/lib/webhooks';

/**
 * LinkedIn Lead Gen Forms Webhook Receiver (M03)
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const body = await req.json();

    // 1. LinkedIn Webhook validation (Headers typically)
    // For now, we allow since clientId is in URL and unique
    // body structure: { lead_urn: '...', form_urn: '...', campaign_urn: '...' }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { linkedInAccessToken: true }
    });

    if (!client?.linkedInAccessToken) {
      console.error(`[LINKEDIN_WEBHOOK_MISSING_TOKEN] Client: ${clientId}`);
      return NextResponse.json({ success: true });
    }

    // 2. Fetch Full Lead Data from LinkedIn API
    // GET /v2/leadForms/{form_urn}/leads/{lead_urn}
    // (Simplified for now: Mapping direct payload if provided)
    const leadUrn = body.lead_urn;
    if (!leadUrn) return NextResponse.json({ success: true });

    // Mock/Simulated Mapping from LinkedIn (Actual LinkedIn uses Graph API fetch)
    const userData = {
      name: body.full_name || 'LinkedIn Lead',
      email: body.email_address || 'unknown@linkedin.com',
      phone: body.phone_number
    };

    // 3. Process the Lead (Score + Notify)
    await processWebhookLead({
      clientId,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      source: 'linkedin_ads',
      liLeadId: leadUrn,
      utmCampaign: body.campaign_urn,
      intent: `LinkedIn Form Submission [Form: ${body.form_urn}]`
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[LINKEDIN_WEBHOOK_ERROR]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
