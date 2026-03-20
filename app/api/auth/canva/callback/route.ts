import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const clientId = searchParams.get('state'); // We passed clientId in state
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  if (!code || !clientId) {
    return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
  }

  const codeVerifier = req.headers.get('cookie')
    ?.split('; ')
    .find(row => row.startsWith('canva_code_verifier='))
    ?.split('=')[1];

  if (!codeVerifier) {
    return NextResponse.json({ error: 'Missing code verifier' }, { status: 400 });
  }

  try {
    // Exchange code for token
    const tokenResponse = await fetch('https://api.canva.com/api/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.CANVA_CLIENT_ID}:${process.env.CANVA_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: `${new URL(req.url).origin}/api/auth/canva/callback`,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      return NextResponse.json(errorData, { status: tokenResponse.status });
    }

    const { access_token, refresh_token, expires_in } = await tokenResponse.json();

    // Store tokens in DB
    await prisma.client.update({
      where: { id: clientId },
      data: {
        canvaAccessToken: access_token,
        canvaRefreshToken: refresh_token,
        canvaTokenExpiresAt: new Date(Date.now() + expires_in * 1000),
      },
    });

    // Redirect back to dashboard
    return NextResponse.redirect(`${new URL(req.url).origin}/dashboard/content?canva=success`);
  } catch (err: any) {
    console.error('Canva OAuth Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
