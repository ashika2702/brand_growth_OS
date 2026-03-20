import { NextResponse } from 'next/server';
import { generateCanvaDesignFromTemplate } from '@/lib/canva';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await generateCanvaDesignFromTemplate(id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Canva Generation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
