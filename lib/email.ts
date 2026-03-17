import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendNotificationEmail(to: string, subject: string, html: string) {
  try {
    const info = await transporter.sendMail({
      from: `"Brand Growth OS" <${process.env.SMTP_FROM || 'alerts@brandgrowthos.com'}>`,
      to,
      subject,
      html,
    });
    console.log('Notification email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email send failure:', error);
    return null;
  }
}
