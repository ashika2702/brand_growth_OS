import { NextRequest, NextResponse } from 'next/server';
import { fetchGA4Realtime } from '@/lib/google';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;

  try {
    const data = await fetchGA4Realtime(clientId);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('GA4 Realtime API Error:', error);
    
    if (error.message.includes('not configured')) {
        return NextResponse.json({ error: 'not_configured' }, { status: 400 });
    }
    
    if (error.message.includes('not connected')) {
        return NextResponse.json({ error: 'not_connected' }, { status: 401 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch GA4 realtime data' },
      { status: 500 }
    );
  }
}
