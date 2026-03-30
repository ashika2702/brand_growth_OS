const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const client = await prisma.client.findFirst({
        where: { name: { contains: 'STEDAXIS (V2)', mode: 'insensitive' } }
    });

    if (client) {
        console.log(`Updating client: ${client.name} (${client.id})`);
        await prisma.client.update({
            where: { id: client.id },
            data: {
                smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
                smtpPort: parseInt(process.env.SMTP_PORT || '465'),
                smtpUser: process.env.SMTP_USER,
                smtpPass: process.env.SMTP_PASS,
                imapHost: process.env.IMAP_HOST || 'imap.gmail.com',
                imapPort: parseInt(process.env.IMAP_PORT || '993'),
                fromName: process.env.SMTP_FROM_NAME || 'Brand Growth OS'
            }
        });
        console.log('Successfully updated STEDAXIS (V2) with email credentials.');
    } else {
        console.log('Client STEDAXIS (V2) not found.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
