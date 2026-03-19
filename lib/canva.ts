import prisma from './db';

/**
 * Canva Connect API Utility
 * Implementation based on Phase 3 of the Integration Guide.
 */
/**
 * Canva Connect API Utility
 */
export async function getCanvaToken(clientId: string) {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { canvaAccessToken: true, canvaRefreshToken: true, canvaTokenExpiresAt: true }
  });

  if (!client?.canvaAccessToken) {
    throw new Error('Canva not connected for this client');
  }

  // Check if token is expired (or about to expire in 5 mins)
  if (client.canvaTokenExpiresAt && client.canvaTokenExpiresAt.getTime() < Date.now() + 300000) {
    return refreshCanvaToken(clientId, client.canvaRefreshToken!);
  }

  return client.canvaAccessToken;
}

async function refreshCanvaToken(clientId: string, refreshToken: string) {
  const response = await fetch('https://api.canva.com/v1/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${process.env.CANVA_CLIENT_ID}:${process.env.CANVA_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh Canva token');
  }

  const { access_token, refresh_token: new_refresh_token, expires_in } = await response.json();

  await prisma.client.update({
    where: { id: clientId },
    data: {
      canvaAccessToken: access_token,
      canvaRefreshToken: new_refresh_token,
      canvaTokenExpiresAt: new Date(Date.now() + expires_in * 1000),
    },
  });

  return access_token;
}

export async function generateCanvaDesignFromTemplate(contentId: string) {
  const content = await prisma.contentRequest.findUnique({
    where: { id: contentId },
    include: { client: true }
  });

  if (!content) throw new Error('Content request not found');
  
  const token = await getCanvaToken(content.clientId);

  // 1. Call Autofill API
  // Documentation: https://www.canva.com/developers/docs/connect/autofill/
  const response = await fetch('https://api.canva.com/v1/autofills', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      brand_template_id: content.client.canvaBrandKitId,
      data: {
        "Headline": { type: "text", text: (content.aiBrief as any)?.hooks?.[0] || content.title },
        "Body": { type: "text", text: (content.aiBrief as any)?.script || '' },
        "CTA": { type: "text", text: (content.aiBrief as any)?.ctas?.[0] || 'Learn More' }
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Canva API Error: ${errorData.message || response.statusText}`);
  }

  const data = await response.json();
  
  // Update the request with the new design URL
  await prisma.contentRequest.update({
    where: { id: contentId },
    data: { canvaDesignUrl: data.job?.result?.design?.url || data.job?.result?.url }
  });

  return data.job?.result?.design;
}
