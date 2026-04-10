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
    
    // Fetch Keyword Data (Current Range)
    const keywords = await fetchGSCPerformance(clientId, startDate, endDate, ['query'], 'all');
    
    // Fetch Trend Data (Current Range)
    const trends = await fetchGSCPerformance(clientId, startDate, endDate, ['date'], 'all');

    // Optional: Fetch Comparison Data for Delta (Last Period)
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    
    const prevStart = new Date(start.getTime() - (diff || 86400000)).toISOString().split('T')[0];
    const prevEnd = new Date(start.getTime() - 1000).toISOString().split('T')[0];

    const prevKeywords = await fetchGSCPerformance(clientId, prevStart, prevEnd, ['query'], 'all');
    const prevTrends = await fetchGSCPerformance(clientId, prevStart, prevEnd, ['date'], 'all');

    return NextResponse.json({ 
      keywords, 
      trends, 
      prevKeywords, 
      prevTrends,
      range: { startDate, endDate, prevStart, prevEnd }
    });
  } catch (error: any) {
    // ... error handling
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
