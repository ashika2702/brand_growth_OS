
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const brain = await prisma.businessBrain.findUnique({
    where: { clientId: 'client_zd2dicslt' }
  });
  console.log('BusinessBrain for STEDAXIS:');
  console.log(JSON.stringify(brain, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
