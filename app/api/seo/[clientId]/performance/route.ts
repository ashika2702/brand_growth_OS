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

    // Calculate or Get Comparison Range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    
    // Use provided comparison dates or fall back to automatic calculation
    const prevStartDate = searchParams.get('prevStartDate');
    const prevEndDate = searchParams.get('prevEndDate');
    
    const prevStart = prevStartDate || new Date(start.getTime() - (diff || 86400000)).toISOString().split('T')[0];
    const prevEnd = prevEndDate || new Date(start.getTime() - 1000).toISOString().split('T')[0];
    
    const [
      keywords, 
      pages, 
      countries, 
      devices, 
      trends, 
      prevKeywords, 
      prevPages, 
      prevCountries, 
      prevDevices, 
      prevTrends
    ] = await Promise.all([
      fetchGSCPerformance(clientId, startDate, endDate, ['query'], 'all'),
      fetchGSCPerformance(clientId, startDate, endDate, ['page'], 'all'),
      fetchGSCPerformance(clientId, startDate, endDate, ['country'], 'all'),
      fetchGSCPerformance(clientId, startDate, endDate, ['device'], 'all'),
      fetchGSCPerformance(clientId, startDate, endDate, ['date'], 'all'),
      fetchGSCPerformance(clientId, prevStart, prevEnd, ['query'], 'all'),
      fetchGSCPerformance(clientId, prevStart, prevEnd, ['page'], 'all'),
      fetchGSCPerformance(clientId, prevStart, prevEnd, ['country'], 'all'),
      fetchGSCPerformance(clientId, prevStart, prevEnd, ['device'], 'all'),
      fetchGSCPerformance(clientId, prevStart, prevEnd, ['date'], 'all'),
    ]);

    return NextResponse.json({ 
      queries: keywords, 
      pages,
      countries,
      devices,
      trends, 
      prevQueries: prevKeywords, 
      prevPages,
      prevCountries,
      prevDevices,
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
