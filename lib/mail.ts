import nodemailer from 'nodemailer';
import prisma from './db';

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    leadId?: string;
    clientId?: string;
}

export async function sendLeadEmail({ to, subject, html, leadId, clientId }: SendEmailOptions) {
    let smtpConfig: any;

    if (clientId) {
        const client = await prisma.client.findUnique({ where: { id: clientId } });
        if (client?.smtpUser && client?.smtpPass) {
            smtpConfig = {
                host: client.smtpHost || 'smtp.gmail.com',
                port: client.smtpPort || 465,
                secure: (client.smtpPort || 465) === 465,
                auth: {
                    user: client.smtpUser,
                    pass: client.smtpPass,
                },
            };
        }
    }

    // Fallback to global env if client config is missing or not provided
    if (!smtpConfig) {
        smtpConfig = {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '465'),
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        };
    }

    const transporter = nodemailer.createTransport(smtpConfig);

    const fromName = clientId ? (await prisma.client.findUnique({ where: { id: clientId } }))?.fromName || process.env.SMTP_FROM_NAME : process.env.SMTP_FROM_NAME;

    // Inject tracking pixel
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const trackingPixel = leadId
        ? `<img src="${baseUrl}/api/crm/track/${leadId}" width="1" height="1" style="display:none;" />`
        : '';

    const finalHtml = `
    <div style="font-family: sans-serif; color: #333; line-height: 1.6;">
      ${html}
      ${trackingPixel}
    </div>
  `;

    const info = await transporter.sendMail({
        from: `"${fromName || 'Brand Growth OS'}" <${smtpConfig.auth.user}>`,
        to,
        subject,
        html: finalHtml,
    });

    return info;
}
