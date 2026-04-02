import { syncLeadReplies } from './imap';
import { runSequences } from './sequences';
import { auditLeads } from './auditor';

let isRunning = false;

/**
 * Neural Sales Automator
 * Periodically syncs inboxes, processes AI replies, and runs autonomous sequences.
 */
export async function startBackgroundSync() {
    // Prevent multiple intervals in dev (HMR can sometimes trigger this twice)
    if (isRunning) return;
    isRunning = true;

    console.log('🚀 [AUTOMATOR] Starting Neural Sales Background Sync (Interval: 5 mins)');

    // Initial sync on startup
    const initialSync = async () => {
        try {
            await syncLeadReplies();
            await runSequences();
            await auditLeads();
        } catch (err) {
            console.error('❌ [AUTOMATOR] Initial background sync failed:', err);
        }
    };
    initialSync();

    // Setup periodic sync
    setInterval(async () => {
        console.log('📥 [AUTOMATOR] Triggering Periodic Sync Cycle...');
        try {
            // 1. Sync Inbound (Replies & Leads)
            const inbound = await syncLeadReplies();
            
            // 2. Run Outbound Sequences (Auto-Pilot)
            const outbound = await runSequences();
            
            // 3. Proactive Audit (Scoring & Dormancy)
            const audit = await auditLeads();

            console.log('✅ [AUTOMATOR] Cycle Complete:', { inbound, outbound, audit });
        } catch (error) {
            console.error('❌ [AUTOMATOR] Background Sync Error:', error);
        }
    }, 5 * 60 * 1000); // Run every 5 minutes
}
