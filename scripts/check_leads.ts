
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const latestLeads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log('Latest Leads:');
  console.log(JSON.stringify(latestLeads, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
