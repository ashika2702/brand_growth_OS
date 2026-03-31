/**
 * Next.js Instrumentation
 * Used for server-side initialization and background automations.
 */
export async function register() {
    // Only run on the server side (not in edge runtime or on the client)
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { startBackgroundSync } = await import('./lib/automator');
        startBackgroundSync();
    }
}
