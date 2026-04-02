import prisma from '../lib/db';

async function fix() {
  try {
    await prisma.client.update({
      where: { id: 'cmnfy6ekh0000oht0ee4rjvxa' },
      data: { domain: 'stedaxis.com.au' }
    });
    console.log('✅ Domain Updated Successfully to stedaxis.com.au');
  } catch (err) {
    console.error('❌ Domain update failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

fix();
