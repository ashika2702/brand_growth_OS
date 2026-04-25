import { NextResponse } from 'next/server';
import { fetchGTMInventory } from '@/lib/google';

/**
 * GET /api/intelligence/[clientId]/gtm
 * Fetches tag inventory from Google Tag Manager.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const data = await fetchGTMInventory(clientId);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('GTM Fetch Error:', error);
    
    if (error.message.includes('not connected')) {
      return NextResponse.json({ error: 'not_connected', message: error.message }, { status: 401 });
    }
    
    if (error.message.includes('Tag Manager API has not been used')) {
      return NextResponse.json({ 
        error: 'api_disabled', 
        message: 'The Google Tag Manager API is not enabled in your Google Cloud Project. You must enable it to view your tags here.',
        link: 'https://console.developers.google.com/apis/api/tagmanager.googleapis.com/overview'
      }, { status: 403 });
    }
    
    if (error.message.includes('not found') || error.message.includes('No workspace')) {
       return NextResponse.json({ error: 'not_configured', message: 'GTM Container or Workspace not found. Please ensure the Container ID is correctly set in your CRM settings.' }, { status: 404 });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
