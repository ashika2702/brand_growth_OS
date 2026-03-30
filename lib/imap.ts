import Imap from 'imap';
import { simpleParser } from 'mailparser';
import prisma from './db';

async function syncClientInbox(client: any) {
    const imapConfig = {
        user: client.imapUser || client.smtpUser!,
        password: client.imapPass || client.smtpPass!,
        host: client.imapHost || 'imap.gmail.com',
        port: client.imapPort || 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false }
    };

    return new Promise((resolve, reject) => {
        const imap = new Imap(imapConfig);

        function openInbox(cb: (err: Error, box: Imap.Box) => void) {
            imap.openBox('INBOX', false, cb);
        }

        imap.once('ready', () => {
            openInbox((err, box) => {
                if (err) {
                    imap.end();
                    return resolve({ synced: 0, error: err.message });
                }

                const searchDate = new Date();
                searchDate.setDate(searchDate.getDate() - 2);

                imap.search(['ALL', ['SINCE', searchDate.toISOString()]], (err, results) => {
                    if (err || !results || results.length === 0) {
                        imap.end();
                        return resolve({ synced: 0 });
                    }

                    const f = imap.fetch(results, { bodies: '' });
                    let processed = 0;

                    f.on('message', (msg) => {
                        msg.on('body', (stream) => {
                            simpleParser(stream as any, async (err, mail) => {
                                if (err) return;

                                const fromEmail = mail.from?.value[0]?.address?.toLowerCase();
                                if (!fromEmail) return;

                                const lead = await prisma.lead.findFirst({
                                    where: {
                                        clientId: client.id,
                                        email: { equals: fromEmail, mode: 'insensitive' }
                                    }
                                });

                                if (lead) {
                                    const messageId = mail.messageId || `date-${mail.date?.getTime()}`;

                                    const existingActivity = await prisma.leadActivity.findFirst({
                                        where: {
                                            leadId: lead.id,
                                            type: 'email_reply',
                                            metadata: { path: ['messageId'], equals: messageId }
                                        }
                                    });

                                    if (!existingActivity) {
                                        await prisma.leadActivity.create({
                                            data: {
                                                leadId: lead.id,
                                                type: 'email_reply',
                                                description: `Lead replied: "${mail.subject}"`,
                                                metadata: {
                                                    messageId,
                                                    subject: mail.subject,
                                                    snippet: mail.text?.substring(0, 500),
                                                    receivedAt: mail.date
                                                }
                                            }
                                        });

                                        if (lead.stage === 'new' || lead.stage === 'contacted') {
                                            await prisma.lead.update({
                                                where: { id: lead.id },
                                                data: {
                                                    stage: 'qualified',
                                                    isAutoPilotActive: false, // Kill sequence on reply
                                                    currentSequenceId: null,
                                                    lastActivityAt: new Date()
                                                }
                                            });
                                        }

                                        await prisma.notification.create({
                                            data: {
                                                clientId: client.id,
                                                type: 'lead.reply',
                                                title: `Reply from ${lead.name}`,
                                                message: mail.subject || 'New email reply received',
                                                link: `/crm/${client.id}?leadId=${lead.id}`,
                                                priority: 'high'
                                            }
                                        });
                                    }
                                }

                                processed++;
                                if (processed === results.length) {
                                    imap.end();
                                }
                            });
                        });
                    });

                    f.once('end', () => {
                        resolve({ synced: processed });
                    });

                    f.once('error', (err) => {
                        imap.end();
                        resolve({ synced: processed, error: err.message });
                    });
                });
            });
        });

        imap.once('error', (err: Error) => {
            resolve({ synced: 0, error: err.message });
        });

        imap.connect();
    });
}

export async function syncLeadReplies(clientId?: string) {
    if (clientId) {
        const client = await prisma.client.findUnique({ where: { id: clientId } });
        if (!client || !client.smtpUser) return { synced: 0, error: 'Client not found or no SMTP User' };
        return await syncClientInbox(client);
    }

    // Full Sync: All clients with email config
    const clients = await prisma.client.findMany({
        where: {
            smtpUser: { not: null }
        }
    });

    const results = [];
    for (const client of clients) {
        results.push(await syncClientInbox(client));
    }

    return results;
}
