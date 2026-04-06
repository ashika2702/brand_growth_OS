const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const clientId = 'client_c30nz9n1i';
  const name = '104 Acres';
  
  const client = await prisma.client.upsert({
    where: { id: clientId },
    update: {},
    create: {
      id: clientId,
      name,
      domain: '104acres.com.au',
      googleAdsKey: 'bgo_google_test',
      metaAccessToken: '',
    }
  });

  console.log('Seed successful: Re-created client', client.id);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
