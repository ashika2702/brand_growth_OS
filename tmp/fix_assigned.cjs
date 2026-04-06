const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Starting Lead Source/Owner Cleanup...');

  // 1. Get all clients to match ids to names
  const clients = await prisma.client.findMany();
  
  for (const client of clients) {
    console.log(`Processing client: ${client.name} (${client.id})`);
    
    // Update all leads for this client that have no assignedTo
    const result = await prisma.lead.updateMany({
      where: {
        clientId: client.id,
        OR: [
          { assignedTo: null },
          { assignedTo: '' },
          { assignedTo: 'Unassigned' }
        ]
      },
      data: {
        assignedTo: client.name
      }
    });
    
    console.log(`✅ Updated ${result.count} leads for ${client.name}`);
  }

  console.log('✨ Cleanup complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
