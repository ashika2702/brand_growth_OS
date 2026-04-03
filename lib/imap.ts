import Imap from 'imap';
import { simpleParser, ParsedMail } from 'mailparser';
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
                            simpleParser(stream as any, async (err, mail: ParsedMail) => {
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
                                        const snippet = mail.text?.substring(0, 500) || '';
                                        const intent = await analyzeLeadIntent(lead, snippet);

                                        await prisma.leadActivity.create({
                                            data: {
                                                leadId: lead.id,
                                                type: 'email_reply',
                                                description: `Lead replied: "${mail.subject}"`,
                                                metadata: {
                                                    messageId,
                                                    subject: mail.subject,
                                                    snippet,
                                                    receivedAt: mail.date,
                                                    intent
                                                }
                                            }
                                        });

                                        const isAlreadyQualified = lead.stage === 'qualified' || lead.stage === 'quoted' || lead.stage === 'won';

                                        // --- GLOBAL DRAFTS-ONLY ENFORCEMENT ---
                                        // Unified logic: AI never sends replies directly. Always drafts + Human Gate.
                                        if (!isAlreadyQualified) {
                                            if (intent === 'INTERESTED') {
                                                const replyContent = await generateHandoffReply(lead, snippet);
                                                const subject = `Re: ${mail.subject}`;

                                                console.log(`[HUMAN GATE] Drafting Gmail reply for ${lead.name} (Global Draft Mandatory)`);
                                                
                                                await appendGmailDraft(client, {
                                                    to: lead.email,
                                                    subject,
                                                    html: replyContent.replace(/\n/g, '<br/>')
                                                });

                                                await prisma.humanGate.create({
                                                    data: {
                                                        clientId: client.id,
                                                        leadId: lead.id,
                                                        agentId: 'inbox_sync',
                                                        gateType: 'approval',
                                                        question: `${lead.name} replied with interest. Approve this response?`,
                                                        contextJson: {
                                                            leadId: lead.id,
                                                            draftSubject: subject,
                                                            draftHtml: replyContent.replace(/\n/g, '<br/>'),
                                                            originalMessageId: messageId
                                                        }
                                                    }
                                                });

                                                await prisma.leadActivity.create({
                                                    data: {
                                                        leadId: lead.id,
                                                        type: 'email_draft',
                                                        description: `AI Drafted Interested Reply (Synced to Gmail)`,
                                                        metadata: { subject, content: replyContent, isAutoReply: true, isGated: true }
                                                    }
                                                });

                                                await prisma.notification.create({
                                                    data: {
                                                        clientId: client.id,
                                                        type: 'lead.interested',
                                                        title: `High Intent (Pending): ${lead.name}`,
                                                        message: `Lead is interested! AI has drafted a reply in Gmail. Please approve.`,
                                                        link: `/crm/${client.id}?leadId=${lead.id}`,
                                                        priority: 'high'
                                                    }
                                                });

                                                await prisma.lead.update({
                                                    where: { id: lead.id },
                                                    data: {
                                                        stage: 'qualified',
                                                        score: 60,
                                                        isAutoPilotActive: false,
                                                        currentSequenceId: null,
                                                        lastActivityAt: new Date()
                                                    }
                                                });
                                            } else if ((intent === 'NOT_INTERESTED' || intent === 'NEUTRAL') && (lead.stage === 'new' || lead.stage === 'contacted')) {
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

                                        if (intent === 'UNSUBSCRIBE') {
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
            imap.getBoxes((err, boxes) => {
                if (err) {
                    imap.end();
                    return reject(err);
                }

                let draftsFolder = 'Drafts';
                const commonDrafts = ['[Gmail]/Drafts', 'Drafts', 'INBOX.Drafts', 'Drafts Folder'];
                
                for (const folder of commonDrafts) {
                    if (boxes[folder]) {
                        draftsFolder = folder;
                        break;
                    }
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
