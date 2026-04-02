import Imap from 'imap';
import { simpleParser } from 'mailparser';
import prisma from './db';
import { analyzeLeadIntent, generateAutoReply, generateHandoffReply } from './sentiment';
import { sendLeadEmail } from './mail';
import MailComposer from 'nodemailer/lib/mail-composer';

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
                                    },
                                    orderBy: { updatedAt: 'desc' }
                                });

                                if (lead && mail.date && mail.date > lead.createdAt) {
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

                                        // Phase 5: Neural Sentiment & Auto-Responder
                                        const snippet = mail.text?.substring(0, 500) || '';
                                        const intent = await analyzeLeadIntent(lead, snippet);

                                        // Update the activity we just created with the intent
                                        const latestActivity = await prisma.leadActivity.findFirst({
                                            where: { leadId: lead.id, type: 'email_reply' },
                                            orderBy: { createdAt: 'desc' }
                                        });

                                        if (latestActivity) {
                                            const metadata = (latestActivity.metadata as any) || {};
                                            await prisma.leadActivity.update({
                                                where: { id: latestActivity.id },
                                                data: { metadata: { ...metadata, intent } }
                                            });
                                        }

                                        // Check if lead is already being handled manually or already qualified
                                        const isAlreadyQualified = lead.stage === 'qualified' || lead.stage === 'quoted' || lead.stage === 'won';

                                        if (intent === 'INTERESTED') {
                                            const replyContent = isAlreadyQualified 
                                                ? await generateHandoffReply(lead, snippet) 
                                                : await generateAutoReply(lead, snippet);

                                            await sendLeadEmail({
                                                to: lead.email,
                                                subject: `Re: ${mail.subject}`,
                                                html: replyContent,
                                                leadId: lead.id,
                                                clientId: client.id
                                            });

                                            await prisma.leadActivity.create({
                                                data: {
                                                    leadId: lead.id,
                                                    type: 'email_sent',
                                                    description: isAlreadyQualified ? 'Handoff Confirmation Sent' : 'Autonomous AI Reply Sent',
                                                    metadata: { content: replyContent, isAutoReply: true }
                                                }
                                            });

                                            // Only notify admin if this is the FIRST time they show interest (transition to qualified)
                                            if (!isAlreadyQualified) {
                                                await prisma.notification.create({
                                                    data: {
                                                        clientId: client.id,
                                                        type: 'lead.interested',
                                                        title: `High Intent: ${lead.name}`,
                                                        message: `Lead is interested! AI has sent a tailored reply.`,
                                                        link: `/crm/${client.id}?leadId=${lead.id}`,
                                                        priority: 'high'
                                                    }
                                                });

                                                // Update Stage to Qualified, update score to 60, and kill automation
                                                await prisma.lead.update({
                                                    where: { id: lead.id },
                                                    data: {
                                                        stage: 'qualified',
                                                        score: 60, // Standardize score for qualified leads
                                                        isAutoPilotActive: false,
                                                        currentSequenceId: null,
                                                        lastActivityAt: new Date()
                                                    }
                                                });
                                            }
                                        } else if (intent === 'UNSUBSCRIBE') {
                                            await prisma.lead.update({
                                                where: { id: lead.id },
                                                data: { 
                                                    stage: 'lost', 
                                                    emailOptOut: true,
                                                    isAutoPilotActive: false,
                                                    currentSequenceId: null,
                                                    lastActivityAt: new Date()
                                                }
                                            });
                                        }

                                        // For negative or clarifying replies, just update activity and kill auto-pilot to prevent annoying the lead
                                        if ((intent === 'NOT_INTERESTED' || intent === 'NEUTRAL') && (lead.stage === 'new' || lead.stage === 'contacted')) {
                                            await prisma.lead.update({
                                                where: { id: lead.id },
                                                data: {
                                                    stage: 'contacted',
                                                    score: 40,
                                                    isAutoPilotActive: false,
                                                    currentSequenceId: null,
                                                    lastActivityAt: new Date()
                                                }
                                            });
                                        }
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

export async function appendGmailDraft(client: any, { to, subject, html }: { to: string, subject: string, html: string }) {
    const imapConfig = {
        user: client.imapUser || client.smtpUser!,
        password: client.imapPass || client.smtpPass!,
        host: client.imapHost || 'imap.gmail.com',
        port: client.imapPort || 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false }
    };

    const composer = new MailComposer({
        from: `"${client.fromName || 'Brand Growth OS'}" <${client.smtpUser}>`,
        to,
        subject,
        html,
    });

    const rawContent = await composer.compile().build();

    return new Promise((resolve, reject) => {
        const imap = new Imap(imapConfig);
        imap.once('ready', () => {
            // Gmail Drafts folder name can vary. Usually '[Gmail]/Drafts'
            // We search for a folder containing 'Draft' to be safe
            imap.getBoxes((err, boxes) => {
                if (err) {
                    imap.end();
                    return reject(err);
                }

                let draftsFolder = 'Drafts'; // Fallback
                
                // Common Gmail/Outlook folder names
                const commonDrafts = ['[Gmail]/Drafts', 'Drafts', 'INBOX.Drafts', 'Drafts Folder'];
                
                // Check if any of the common ones exist
                for (const folder of commonDrafts) {
                    if (boxes[folder]) {
                        draftsFolder = folder;
                        break;
                    }
                    // Some providers put it inside [Gmail]
                    if (boxes['[Gmail]']?.children?.[folder]) {
                        draftsFolder = `[Gmail]/${folder}`;
                        break;
                    }
                }

                imap.append(rawContent, { mailbox: draftsFolder, flags: ['\\Draft'] }, (appendErr) => {
                    imap.end();
                    if (appendErr) reject(appendErr);
                    else resolve(true);
                });
            });
        });
        imap.once('error', (err: Error) => {
            reject(err);
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
