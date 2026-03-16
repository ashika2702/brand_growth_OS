import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params;
    const { type, title, description, dueDate } = await request.json();

    if (!type || !title || !dueDate) {
      return NextResponse.json({ error: 'Missing required task fields' }, { status: 400 });
    }

    const task = await prisma.leadTask.create({
      data: {
        leadId: leadId,
        type,
        title,
        description,
        dueDate: new Date(dueDate)
      }
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Create Lead Task Error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
