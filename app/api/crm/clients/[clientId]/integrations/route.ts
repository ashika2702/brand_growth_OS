import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * GET /api/crm/clients/[clientId]/integrations
 * Returns current integration status (masking sensitive tokens).
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        googleAdsKey: true,
        metaAccessToken: true,
        metaPageId: true,
        linkedInAccessToken: true,
        googleRefreshToken: true,
        googleSearchConsoleUrl: true,
        googleAnalyticsPropertyId: true,
        googleTagManagerContainerId: true
      }
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Mask sensitive tokens for front-end view
    const mask = (token: string | null) => (token ? `••••••••${token.slice(-4)}` : '');

    return NextResponse.json({
      googleAdsKey: client.googleAdsKey || '',
      metaAccessToken: mask(client.metaAccessToken),
      metaPageId: client.metaPageId || '',
      linkedInAccessToken: mask(client.linkedInAccessToken),
      isGoogleConnected: !!client.googleRefreshToken,
      googleSearchConsoleUrl: client.googleSearchConsoleUrl || '',
      googleAnalyticsPropertyId: client.googleAnalyticsPropertyId || '',
      googleTagManagerContainerId: client.googleTagManagerContainerId || ''
    });

  } catch (error) {
    console.error('Integration Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch integrations' }, { status: 500 });
  }
}

/**
 * PATCH /api/crm/clients/[clientId]/integrations
 * Updates integration keys. Only updates if a new value is provided.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const body = await req.json();
    const { googleAdsKey, metaAccessToken, metaPageId, linkedInAccessToken, googleSearchConsoleUrl, googleAnalyticsPropertyId, googleTagManagerContainerId } = body;

    const data: any = {};
    if (googleAdsKey !== undefined) data.googleAdsKey = googleAdsKey;
    if (metaPageId !== undefined) data.metaPageId = metaPageId;
    if (googleSearchConsoleUrl !== undefined) data.googleSearchConsoleUrl = googleSearchConsoleUrl;
    if (googleAnalyticsPropertyId !== undefined) data.googleAnalyticsPropertyId = googleAnalyticsPropertyId;
    if (googleTagManagerContainerId !== undefined) data.googleTagManagerContainerId = googleTagManagerContainerId;
    
    // Only update tokens if they aren't masked strings (containing dots)
    if (metaAccessToken && !metaAccessToken.includes('•')) {
      data.metaAccessToken = metaAccessToken;
    }
    if (linkedInAccessToken && !linkedInAccessToken.includes('•')) {
      data.linkedInAccessToken = linkedInAccessToken;
    }

    const updated = await prisma.client.update({
      where: { id: clientId },
      data
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Integration Update Error:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update integrations' }, { status: 500 });
  }
}
