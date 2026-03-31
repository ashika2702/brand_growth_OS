import { NextResponse } from 'next/server';
import { runSequences } from '@/lib/sequences';

export async function POST(request: Request) {
    try {
        const results = await runSequences();
        return NextResponse.json({
            processed: results.length,
            results
        });
    } catch (error: any) {
        console.error('Sequence Runner Error:', error);
        return NextResponse.json({ error: 'Failed to run sequences', details: error.message }, { status: 500 });
    }
}
