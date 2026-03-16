import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const { isCompleted } = await request.json();

    if (isCompleted === undefined) {
      return NextResponse.json({ error: 'Missing isCompleted flag' }, { status: 400 });
    }

    const task = await prisma.leadTask.update({
      where: { id: taskId },
      data: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null
      }
    });

    // If completed, add an activity log to the lead
    if (isCompleted) {
      await prisma.leadActivity.create({
        data: {
          leadId: task.leadId,
          type: 'note',
          description: `Completed task: ${task.title}`
        }
      });
      // Update last activity
      await prisma.lead.update({
        where: { id: task.leadId },
        data: { lastActivityAt: new Date() }
      });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Update Task Error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
