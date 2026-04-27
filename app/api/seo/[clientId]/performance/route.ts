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
    const country = searchParams.get('country') || 'all';
    
    // Country Comparison Parameters
    const countryA = searchParams.get('countryA')?.toUpperCase();
    const countryB = searchParams.get('countryB')?.toUpperCase();
 
    // Calculate or Get Comparison Range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    
    // Use provided comparison dates or fall back to automatic calculation
    const prevStartDate = searchParams.get('prevStartDate');
    const prevEndDate = searchParams.get('prevEndDate');
    
    const prevStart = prevStartDate || new Date(start.getTime() - (diff || 86400000)).toISOString().split('T')[0];
    const prevEnd = prevEndDate || new Date(start.getTime() - 1000).toISOString().split('T')[0];
    
    // If we are in country compare mode, we need specific fetches
    if (countryA && countryB) {
      const [
        dataA,
        dataB,
        allCountries
      ] = await Promise.all([
        Promise.all([
          fetchGSCPerformance(clientId, startDate, endDate, ['query'], 'all', countryA),
          fetchGSCPerformance(clientId, startDate, endDate, ['page'], 'all', countryA),
          fetchGSCPerformance(clientId, startDate, endDate, ['country'], 'all', countryA),
          fetchGSCPerformance(clientId, startDate, endDate, ['device'], 'all', countryA),
          fetchGSCPerformance(clientId, startDate, endDate, ['date'], 'all', countryA),
        ]),
        Promise.all([
          fetchGSCPerformance(clientId, startDate, endDate, ['query'], 'all', countryB),
          fetchGSCPerformance(clientId, startDate, endDate, ['page'], 'all', countryB),
          fetchGSCPerformance(clientId, startDate, endDate, ['country'], 'all', countryB),
          fetchGSCPerformance(clientId, startDate, endDate, ['device'], 'all', countryB),
          fetchGSCPerformance(clientId, startDate, endDate, ['date'], 'all', countryB),
        ]),
        fetchGSCPerformance(clientId, startDate, endDate, ['country'], 'all', 'all'),
      ]);

      console.log('Comparison Mode Fetch Complete');
      console.log(`Country A (${countryA}): Queries: ${dataA[0].length}, Pages: ${dataA[1].length}, Trends: ${dataA[4].length}`);
      console.log(`Country B (${countryB}): Queries: ${dataB[0].length}, Pages: ${dataB[1].length}, Trends: ${dataB[4].length}`);

      return NextResponse.json({
        comparison: {
          a: { queries: dataA[0], pages: dataA[1], countries: dataA[2], devices: dataA[3], trends: dataA[4] },
          b: { queries: dataB[0], pages: dataB[1], countries: dataB[2], devices: dataB[3], trends: dataB[4] },
        },
        availableCountries: allCountries,
        range: { startDate, endDate, prevStart, prevEnd }
      });
    }

    const [
      keywords, 
      pages, 
      filteredCountries, 
      devices, 
      trends, 
      prevKeywords, 
      prevPages, 
      prevFilteredCountries, 
      prevDevices, 
      prevTrends,
      allCountries
    ] = await Promise.all([
      fetchGSCPerformance(clientId, startDate, endDate, ['query'], 'all', country),
      fetchGSCPerformance(clientId, startDate, endDate, ['page'], 'all', country),
      fetchGSCPerformance(clientId, startDate, endDate, ['country'], 'all', country),
      fetchGSCPerformance(clientId, startDate, endDate, ['device'], 'all', country),
      fetchGSCPerformance(clientId, startDate, endDate, ['date'], 'all', country),
      fetchGSCPerformance(clientId, prevStart, prevEnd, ['query'], 'all', country),
      fetchGSCPerformance(clientId, prevStart, prevEnd, ['page'], 'all', country),
      fetchGSCPerformance(clientId, prevStart, prevEnd, ['country'], 'all', country),
      fetchGSCPerformance(clientId, prevStart, prevEnd, ['device'], 'all', country),
      fetchGSCPerformance(clientId, prevStart, prevEnd, ['date'], 'all', country),
      fetchGSCPerformance(clientId, startDate, endDate, ['country'], 'all', 'all'), // Unfiltered for dropdown
    ]);

    return NextResponse.json({ 
      queries: keywords, 
      pages, 
      countries: filteredCountries, 
      availableCountries: allCountries,
      devices, 
      trends,
      prevQueries: prevKeywords,
      prevPages,
      prevCountries: prevFilteredCountries,
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
