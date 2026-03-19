import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    const body = await req.json();
    const updated = await prisma.contentRequest.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update content request' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    await prisma.contentRequest.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete content request' }, { status: 500 });
  }
}
