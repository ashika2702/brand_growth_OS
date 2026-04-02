import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ leadId: string }> }
) {
    try {
        const { leadId } = await params;

        // Log the activity
        await prisma.leadActivity.create({
            data: {
                leadId,
                type: 'email_opened',
                description: 'Lead opened an automated follow-up email.',
                metadata: {
                    timestamp: new Date().toISOString(),
                    userAgent: request.headers.get('user-agent'),
                    ip: request.headers.get('x-forwarded-for') || 'unknown'
                }
            }
        });

        // 2. Proactive Scoring (+5 on every email open)
        // Also update lead's last activity to reset the dormancy clock
        const currentLead = await prisma.lead.findUnique({
            where: { id: leadId },
            select: { score: true }
        });

        const newScore = Math.min(100, (currentLead?.score || 0) + 5);

        await prisma.lead.update({
            where: { id: leadId },
            data: { 
                lastActivityAt: new Date(),
                score: newScore
            }
        });

        // Return a 1x1 transparent GIF
        const buffer = Buffer.from(
            'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
            'base64'
        );

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'image/gif',
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        });
    } catch (error) {
        console.error('Tracking error:', error);
        // Even on error, return the pixel so the user doesn't see a broken image
        const buffer = Buffer.from(
            'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
            'base64'
        );
        return new NextResponse(buffer, {
            headers: { 'Content-Type': 'image/gif' },
        });
    }
}
