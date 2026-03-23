import prisma from '../lib/db';
import { createNotification } from '../lib/notifications';

/**
 * Content Automation Engine
 * Handles background tasks for the Content Tap pipeline.
 */
export async function processContentAutomation(type: string, contentId: string, clientId: string, data: any = {}) {
  try {
    console.log(`[CONTENT AUTOMATION] Processing ${type} for content ${contentId}`);

    const content = await prisma.contentRequest.findUnique({
      where: { id: contentId },
    });

    if (!content) return;

    switch (type) {
      case 'content.approved': {
        // Automation: Trigger scheduling / publishing logic
        console.log(`[CONTENT AUTOMATION] SCHEDULING PUBLISH FOR: ${content.title}`);
        
        // Internal Notification
        await createNotification({
          clientId,
          type: 'content.awaiting_approval', // Reusing existing type for simplicity
          title: 'Content Approved & Scheduled',
          message: `"${content.title}" has been approved and moved to the publishing queue.`,
          priority: 'medium',
          link: `/content/tap`
        });

        // Update DB with approval info if not already set
        if (!content.approvedAt) {
            await prisma.contentRequest.update({
                where: { id: contentId },
                data: { approvedAt: new Date() }
            });
        }
        break;
      }

      default:
        console.warn(`Unknown content automation type: ${type}`);
    }
  } catch (error) {
    console.error(`[CONTENT AUTOMATION] Failed:`, error);
  }
}
