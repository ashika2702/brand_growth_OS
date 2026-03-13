import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { createNotification } from '@/lib/notifications';

/**
 * GET /api/crm/capture
 * Mobile-optimized QR capture endpoint. 
 * Allows for zero-friction lead capture via a single URL parameter.
 * Example: /api/crm/capture?clientId=123&source=QR_Table_5
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const source = searchParams.get('source') || 'QR_Code';

    if (!clientId) {
      return NextResponse.json({ error: 'Missing clientId' }, { status: 400 });
    }

    // Since this is a "Capture" endpoint often used for "Tap to Join" or QR,
    // we might just redirect to a landing page or a "Thank You" page.
    // However, the v2.0 doc implies this creates a "Tagged Lead".
    
    // For a real-world flow, we would usually show a form.
    // But as a "Capture" API, let's assume it logs a "Pre-Lead" or an anonymous touchpoint.
    
    // For now, let's redirect to a simple Lead Capture Form page we'll build in Phase 10
    // but log the intent.
    
    return NextResponse.redirect(new URL(`/p/${clientId}/welcome?source=${source}`, request.url));
  } catch (error) {
    console.error('QR Capture Error:', error);
    return NextResponse.json({ error: 'Capture failed' }, { status: 500 });
  }
}
