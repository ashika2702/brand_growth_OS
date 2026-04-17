import { NextResponse } from 'next/server';
import { fetchGA4Performance } from '@/lib/google';

/**
 * GET /api/intelligence/[clientId]/analytics
 * Fetches traffic and conversion performance from Google Analytics 4.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const { searchParams } = new URL(req.url);
    
    // Default to last 30 days if not provided
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    
    const startDate = searchParams.get('startDate') || thirtyDaysAgo;
    const endDate = searchParams.get('endDate') || today;

    const data = await fetchGA4Performance(clientId, startDate, endDate);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('GA4 Fetch Error:', error);
    
    if (error.message.includes('not configured')) {
      return NextResponse.json({ error: 'not_configured', message: error.message }, { status: 400 });
    }
    
    if (error.message.includes('not connected')) {
      return NextResponse.json({ error: 'not_connected', message: error.message }, { status: 401 });
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
