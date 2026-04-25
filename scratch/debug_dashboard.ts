import prisma from '../lib/db';
import { fetchGA4Performance } from '../lib/google';

async function test() {
  try {
    const clients = await prisma.client.findMany({
      include: {
        SeoKeyword: true,
        leads: {
          include: {
            activities: true
          }
        },
        contentRequests: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });
    console.log(`Found ${clients.length} clients`);
    
    const ga4Clients = clients.filter(c => c.googleAnalyticsPropertyId);
    console.log(`GA4 Clients: ${ga4Clients.length}`);

    // Test first GA4 client if any
    if (ga4Clients.length > 0) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      console.log(`Testing GA4 for client ${ga4Clients[0].id}`);
      try {
        const res = await fetchGA4Performance(ga4Clients[0].id, thirtyDaysAgo, today);
        console.log('GA4 success');
      } catch (e: any) {
        console.error('GA4 failed:', e.message);
      }
    }

    process.exit(0);
  } catch (e: any) {
    console.error('Test failed:', e);
    process.exit(1);
  }
}

test();
