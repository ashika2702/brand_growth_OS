const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const clientId = 'clvtq9x2a0000ux2e9x2e9x2e'; // I'll need to find the real clientId
    // Let's just find the client named '104 Acres'
    const client = await prisma.client.findFirst({ where: { name: '104 Acres' } });
    if (!client) {
        console.log('Client not found');
        return;
    }
    console.log('Client ID:', client.id);
    const sequences = await prisma.neuralSequence.findMany({
        where: { clientId: client.id }
    });
    console.log('Sequences:', JSON.stringify(sequences, null, 2));
}

check();
