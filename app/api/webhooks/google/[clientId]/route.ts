import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { processWebhookLead } from '@/lib/webhooks';
import { mapRawLeadData } from '@/lib/leads';

/**
 * Google Ads Lead Form Webhook Receiver (M03)
 * Handles POST requests from Google Search/Display ads.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const body = await req.json();

    // 1. Verify Google Secret Key
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { googleAdsKey: true }
    });

    if (!client || body.google_key !== client.googleAdsKey) {
      console.warn(`[GOOGLE_WEBHOOK_UNAUTHORIZED] Client: ${clientId}`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Extract User Data (Core Identity + Custom Metadata)
    const rawData: Record<string, string> = {};
    if (Array.isArray(body.user_column_data)) {
      body.user_column_data.forEach((col: any) => {
        rawData[col.column_id] = col.string_value;
      });
    }

    const { name, email, phone, customFields } = mapRawLeadData(rawData);

    if (!email) {
      console.error('[GOOGLE_WEBHOOK_MISSING_EMAIL]', body);
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    // 3. Process the Lead (Score + Notify)
    await processWebhookLead({
      clientId,
      name: name || 'Unknown Google Lead',
      email,
      phone,
      customFields,
      source: 'google_ads',
      googleLeadId: body.lead_id?.toString(),
      utmCampaign: body.campaign_id?.toString(),
      intent: `Form submission via Google Lead Form [ID: ${body.form_id}]`
    });

    // 4. Return success to Google (Must be quick)
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('[GOOGLE_WEBHOOK_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
