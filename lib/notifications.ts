import prisma from './db';
import { sendNotificationEmail } from './email';

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
  recipientEmail?: string; // Optional direct email override
}

/**
 * Universal Notification Utility for marketingOS v2.0
 * Fires a notification to the database and optionally sends email/push.
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

    // If Urgent or high priority, send email via Nodemailer
    if (params.priority === 'urgent' || params.priority === 'high') {
      const emailTarget = params.recipientEmail || process.env.ADMIN_EMAIL;
      if (emailTarget) {
        await sendNotificationEmail(
          emailTarget,
          `[${params.priority?.toUpperCase()}] ${params.title}`,
          `
          <div style="font-family: sans-serif; background: #000; color: #fff; padding: 40px; border-radius: 20px;">
            <p style="color: #3E80FF; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">Brand Growth OS Intelligence</p>
            <h1 style="font-size: 24px; font-weight: 900; margin-top: 0;">${params.title}</h1>
            <p style="font-size: 16px; color: #888; line-height: 1.6;">${params.message}</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}${params.link || '/notifications'}" style="display: inline-block; background: #3E80FF; color: #fff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; margin-top: 20px;">Open Action Centre</a>
          </div>
          `
        );
      }
    }

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}
