import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const clientId = searchParams.get('state'); // We passed clientId in state
  const error = searchParams.get('error');

  console.log('Canva Callback Response:', { 
    hasCode: !!code, 
    clientId, 
    error: error || 'none' 
  });

  if (error) {
    console.error('Canva Authorization Error:', error);
    return NextResponse.json({ error }, { status: 400 });
  }

  if (!code || !clientId) {
    console.error('Canva Callback Error: Missing code or state');
    return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
  }

  console.log('Canva Callback Hit:', { code: !!code, clientId });

  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get('canva_code_verifier')?.value;

  if (!codeVerifier) {
    console.error('Canva Callback Error: Missing code verifier');
    return NextResponse.json({ error: 'Missing code verifier' }, { status: 400 });
  }

  try {
    // Exchange code for token
    const tokenResponse = await fetch('https://api.canva.com/rest/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.CANVA_CLIENT_ID}:${process.env.CANVA_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: `${new URL(req.url).origin.replace('localhost', '127.0.0.1')}/api/auth/canva/callback`,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Canva Token Exchange Failed:', errorData);
      return NextResponse.json(errorData, { status: tokenResponse.status });
    }

    const tokenData = await tokenResponse.json();
    console.log('Canva Token Exchange Success:', { expires_in: tokenData.expires_in });

    const { access_token, refresh_token, expires_in } = tokenData;

    // Store tokens in DB
    await prisma.client.update({
      where: { id: clientId as string },
      data: {
        canvaAccessToken: access_token as string,
        canvaRefreshToken: refresh_token as string,
        canvaTokenExpiresAt: new Date(Date.now() + expires_in * 1000),
      },
    });

    // Redirect back to content tap
    return NextResponse.redirect(`${new URL(req.url).origin}/content/tap?canva=success`);
  } catch (err: any) {
    console.error('Canva OAuth Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
