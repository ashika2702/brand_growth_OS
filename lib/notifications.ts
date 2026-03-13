import prisma from './db';

export type NotificationType = 
  | 'lead.new' 
  | 'content.awaiting_approval' 
  | 'seo.rank_drop' 
  | 'gbp.review_new' 
  | 'aeo.brand_not_mentioned' 
  | 'campaign.budget_80pct' 
  | 'ads.creative_fatigued' 
  | 'pr.negative_mention' 
  | 'pr.press_opportunity' 
  | 'pr.response_needed'
  | 'crm.automation'
  | 'crm.win';

export interface NotificationParams {
  clientId?: string;
  userId?: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  link?: string;
}

/**
 * Universal Notification Utility for marketingOS v2.0
 * Fires a notification to the database for real-time dashboard display.
 */
export async function createNotification(params: NotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        clientId: params.clientId,
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        priority: params.priority || 'medium',
        link: params.link
      }
    });

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}
