const fetch = require('node-fetch');

const INTERVAL = 120000; // 2 minutes
const API_URL = 'http://localhost:3000/api/crm/sync-inbox';

console.log('🚀 Neural Inbox Sync Initialized...');
console.log(`📡 Polling ${API_URL} every ${INTERVAL / 1000} seconds...`);

async function sync() {
    try {
        console.log(`[${new Date().toLocaleTimeString()}] 📥 Syncing Inbox...`);
        const response = await fetch(API_URL, { method: 'POST' });
        const data = await response.json();

        if (data.success) {
            console.log(`✅ Sync Complete. Results:`, JSON.stringify(data.result));
        } else {
            console.warn(`⚠️ Sync Warning:`, data.error);
        }
    } catch (error) {
        console.error('❌ Sync Failed:', error.message);
    }
}

// Initial sync
sync();

// Set interval
setInterval(sync, INTERVAL);
