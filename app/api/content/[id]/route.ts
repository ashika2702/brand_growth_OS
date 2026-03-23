import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { addContentJob } from '@/lib/queue';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    
    const updated = await prisma.contentRequest.update({
      where: { id },
      data: body,
      include: { client: true }
    });

    // Workflow Trigger: If approved, fire background automations
    if (body.status === 'APPROVED') {
      addContentJob('content.approved', id, updated.clientId);
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update failed:', error);
    return NextResponse.json({ error: 'Failed to update content request' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.contentRequest.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete content request' }, { status: 500 });
  }
}
