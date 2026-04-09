import { NextResponse } from 'next/server';
import { fetchGSCPerformance } from '@/lib/google';

/**
 * GET /api/seo/[clientId]/performance
 * Fetches search performance data from Google Search Console.
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

    const rows = await fetchGSCPerformance(clientId, startDate, endDate);
    return NextResponse.json({ rows });
  } catch (error: any) {
    console.error('GSC Fetch Error:', error);
    
    // Check if it's a "Not Connected" error
    if (error.message.includes('not connected')) {
      return NextResponse.json({ error: 'not_connected', message: error.message }, { status: 401 });
    }
    
    // Check for Permission Denied (403)
    if (error.code === 403 || error.message.includes('permission')) {
      return NextResponse.json({ error: 'permission_denied', message: error.message }, { status: 403 });
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
