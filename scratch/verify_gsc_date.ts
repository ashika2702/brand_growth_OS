import prisma from '../lib/db';
import { fetchGSCPerformance } from '../lib/google';

async function verify() {
  const clientId = 'client_sqye4q4bb';
  const targetDate = '2025-04-23';
  
  console.log(`Checking GSC for ${targetDate} (Client: ${clientId})...`);
  
  try {
    const res = await fetchGSCPerformance(clientId, targetDate, targetDate, ['date']);
    if (res && res.length > 0) {
      const row = res[0];
      const ctr = (row.ctr * 100).toFixed(2);
      console.log('--- FULL DATA FOR APR 23, 2025 ---');
      console.log(`Clicks:      ${row.clicks}`);
      console.log(`Impressions: ${row.impressions}`);
      console.log(`CTR:         ${ctr}%`);
      console.log(`Position:    ${row.position.toFixed(1)}`);
      console.log('-----------------------------------');
    } else {
      console.log('No data found for this specific date.');
    }
  } catch (e: any) {
    console.error('Verification failed:', e.message);
  }
  process.exit(0);
}

verify();
