import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { processWebhookLead } from '@/lib/webhooks';
import { mapRawLeadData } from '@/lib/leads';

/**
 * Meta (Instagram / Facebook) Lead Ads Webhook Receiver (M03)
 * Supports 'Hub Challenge' GET verification and POST lead data notifications.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Verify the hub challenge (Token should be 'bgo_meta_verify' or client-specific)
  if (mode === 'subscribe' && token === 'bgo_meta_verify') {
    return new Response(challenge, { status: 200 });
  }
  return new Response('Verification failed', { status: 403 });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const body = await req.json();

    // 1. Meta Webhook structure: body.entry[0].changes[0].value.leadgen_id
    const change = body.entry?.[0]?.changes?.[0]?.value;
    if (!change || !change.leadgen_id) {
      return NextResponse.json({ success: true }); // Return OK to Meta anyway
    }

    // 2. Fetch Client Credentials
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { metaAccessToken: true }
    });

    if (!client?.metaAccessToken) {
      console.error(`[META_WEBHOOK_MISSING_TOKEN] Client: ${clientId}`);
      return NextResponse.json({ success: true });
    }

    // 3. Call Meta Graph API to fetch lead details
    // GET /v20.0/{leadgen_id}?access_token={token}
    const leadResponse = await fetch(
      `https://graph.facebook.com/v20.0/${change.leadgen_id}?fields=field_data,ad_name,campaign_name&access_token=${client.metaAccessToken}`
    );
    const leadJson = await leadResponse.json();

    if (leadJson.error) {
      console.error('[META_WEBHOOK_GRAPH_API_ERROR]', leadJson.error);
      return NextResponse.json({ success: true });
    }

    // 4. Map Meta Field Data to BGO Lead (Core Identity + Custom Metadata)
    const rawData: Record<string, string> = {};
    if (Array.isArray(leadJson.field_data)) {
        leadJson.field_data.forEach((field: any) => {
            rawData[field.name] = field.values[0];
        });
    }

    const { name, email, phone, customFields } = mapRawLeadData(rawData);

    if (!email) {
      return NextResponse.json({ success: true });
    }

    // 5. Process the Lead (Score + Notify)
    await processWebhookLead({
      clientId,
      name: name || 'Instagram/Meta Lead',
      email,
      phone,
      customFields,
      source: 'meta_ads',
      metaLeadId: change.leadgen_id?.toString(),
      utmCampaign: leadJson.campaign_name || leadJson.ad_id,
      intent: `Form submission via Meta/IG Lead Ad [Name: ${leadJson.ad_name}]`
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[META_WEBHOOK_ERROR]', error);
    return NextResponse.json({ success: true }); // Always return 200 to Meta to avoid retry loops
  }
}
