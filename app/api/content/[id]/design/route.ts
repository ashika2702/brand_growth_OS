import { NextResponse } from 'next/server';
import { generateCanvaDesignFromTemplate, uploadAssetToCanva } from '@/lib/canva';
import prisma from '@/lib/db';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    try {
      const result = await generateCanvaDesignFromTemplate(id);
      return NextResponse.json(result);
    } catch (canvaError: any) {
      console.warn('Full design generation failed, attempting asset upload fallback:', canvaError.message);
      
      // Fallback: Upload the generated AI image to Canva instead
      const content = await prisma.contentRequest.findUnique({
        where: { id },
        select: { aiImageUrls: true, title: true, clientId: true }
      });

      if (content && content.aiImageUrls?.[0]) {
        const assetId = await uploadAssetToCanva(
          content.clientId, 
          content.aiImageUrls[0], 
          `${content.title.substring(0, 50)}.png`
        );
        
        return NextResponse.json({ 
          success: true, 
          fallback: true, 
          assetId,
          message: 'Design automation requires Canva Pro. Image has been uploaded to your Canva "Uploads" folder instead.'
        });
      }
      
      throw canvaError;
    }
  } catch (error: any) {
    console.error('Canva Integration Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
