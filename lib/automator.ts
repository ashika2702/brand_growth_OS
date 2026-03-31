import { syncLeadReplies } from './imap';

let isRunning = false;

/**
 * Neural Sales Automator
 * Periodically syncs inboxes and processes AI replies in the background.
 */
export async function startBackgroundSync() {
    // Prevent multiple intervals in dev (HMR can sometimes trigger this twice)
    if (isRunning) return;
    isRunning = true;

    console.log('🚀 [AUTOMATOR] Starting Neural Sales Background Sync (Interval: 5 mins)');

    // Initial sync on startup
    syncLeadReplies().catch(err => {
        console.error('❌ [AUTOMATOR] Initial background sync failed:', err);
    });

    // Setup periodic sync
    setInterval(async () => {
        console.log('📥 [AUTOMATOR] Triggering Periodic Inbox Sync...');
        try {
            const results = await syncLeadReplies();
            console.log('✅ [AUTOMATOR] Sync Cycle Complete:', results);
        } catch (error) {
            console.error('❌ [AUTOMATOR] Background Sync Error:', error);
        }
    }, 5 * 60 * 1000); // Run every 5 minutes
}
