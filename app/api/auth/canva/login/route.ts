import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('clientId');

  if (!clientId) {
    return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
  }

  const canvaClientId = process.env.CANVA_CLIENT_ID;
  if (!canvaClientId) {
    return NextResponse.json({ error: 'CANVA_CLIENT_ID is not configured' }, { status: 500 });
  }

  // PKCE setup
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

  // Store codeVerifier in a cookie or session to verify in callback
  // For simplicity in this demo, we'll suggest storing it in a cookie
  const response = NextResponse.redirect(
    `https://www.canva.com/api/oauth/authorize?` +
    new URLSearchParams({
      response_type: 'code',
      client_id: canvaClientId,
      redirect_uri: `${new URL(req.url).origin.replace('localhost', '127.0.0.1')}/api/auth/canva/callback`,
      scope: 'design:content:read design:content:write asset:read asset:write brandtemplate:content',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: clientId, // Pass clientId through state
    }).toString()
  );

  response.cookies.set('canva_code_verifier', codeVerifier, { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 300 // 5 minutes
  });

  return response;
}
