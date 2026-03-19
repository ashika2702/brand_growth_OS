import { NextResponse } from 'next/server';
import { generateCanvaDesignFromTemplate } from '@/lib/canva';
import prisma from '@/lib/db';

/**
 * POST /api/content/design
 * Triggers Canva design generation for a specific content request.
 * Implementation based on Phase 4 of the Integration Guide.
 */
export async function POST(req: Request) {
  try {
    const { contentId } = await req.json();

    if (!contentId) {
      return NextResponse.json({ error: 'contentId is required' }, { status: 400 });
    }

    // 1. Generate design using Canva client
    const design = await generateCanvaDesignFromTemplate(contentId);

    // 2. Update status and save URL in database
    const updated = await prisma.contentRequest.update({
      where: { id: contentId },
      data: {
        canvaDesignUrl: design.url,
        status: 'IN_PROD'
      }
    });

    return NextResponse.json({
        success: true,
        designUrl: design.url,
        request: updated
    });
  } catch (error: any) {
    console.error('Canva Design Generation failed:', error);
    return NextResponse.json({ 
        error: error.message || 'Canva Design Generation failed' 
    }, { status: 500 });
  }
}
