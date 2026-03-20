const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkClient() {
  const clientId = 'client_g504ad269';
  console.log('Checking client:', clientId);
  
  try {
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });
    
    if (client) {
      console.log('✅ Client Found!');
      console.log('Canva Access Token:', client.canvaAccessToken ? 'Present' : 'Missing');
      console.log('Canva Refresh Token:', client.canvaRefreshToken ? 'Present' : 'Missing');
      console.log('Expires At:', client.canvaTokenExpiresAt);
    } else {
      console.log('❌ Client NOT Found in DB!');
      const allClients = await prisma.client.findMany({ select: { id: true, name: true } });
      console.log('Available clients:', allClients);
    }
  } catch (error) {
    console.error('Error checking client:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkClient();
