import { NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/google';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const clientId = searchParams.get('state'); // We passed clientId in state

  if (!code || !clientId) {
    return NextResponse.json({ error: 'Missing code or clientId' }, { status: 400 });
  }

  try {
    const tokens = await exchangeCodeForTokens(code);

    await prisma.client.update({
      where: { id: clientId },
      data: {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        googleTokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
      },
    });

    // Redirect back to CRM Integrations tab
    // We'll append a success param so the UI can show a toast
    return NextResponse.redirect(new URL(`/crm/${clientId}?success=google_connected`, request.url));
  } catch (error: any) {
    console.error('Google Auth Error:', error);
    return NextResponse.redirect(new URL(`/crm/${clientId}?error=google_failed`, request.url));
  }
}
