import { NextResponse } from 'next/server';
import { syncLeadReplies } from '@/lib/imap';

export async function POST() {
    try {
        const result = await syncLeadReplies();
        return NextResponse.json({ success: true, result });
    } catch (error: any) {
        console.error('Inbox sync error:', error);
        return NextResponse.json(
            { error: 'Failed to sync inbox', details: error.message },
            { status: 500 }
        );
    }
}
