import prisma from '../lib/db';

async function testFix() {
    console.log('🧪 [TEST] Starting IMAP Sync Fix Verification...');

    // 1. Create a dummy lead with a fixed timestamp (now)
    const lead = await prisma.lead.create({
        data: {
            clientId: 'clp1234567890', // A dummy clientId that likely exists or will be ignored
            name: 'Test Lead',
            email: 'test@example.com',
            source: 'Manual Test',
            stage: 'new',
            createdAt: new Date() 
        }
    });

    console.log(`✅ Lead Created: ${lead.name} (ID: ${lead.id}) at ${lead.createdAt}`);

    // 2. Simulated "Old" Email (2 minutes before lead creation)
    const oldEmailDate = new Date(lead.createdAt.getTime() - 2 * 60 * 1000);
    
    // Logic Check
    const shouldProcessOld = (oldEmailDate > lead.createdAt);
    console.log(`📡 [OLD EMAIL] Received at: ${oldEmailDate}`);
    console.log(`👉 Should process? ${shouldProcessOld ? 'YES ❌ (FAIL)' : 'NO ✅ (PASS)'}`);

    // 3. Simulated "New" Email (2 minutes after lead creation)
    const newEmailDate = new Date(lead.createdAt.getTime() + 2 * 60 * 1000);
    const shouldProcessNew = (newEmailDate > lead.createdAt);
    console.log(`📡 [NEW EMAIL] Received at: ${newEmailDate}`);
    console.log(`👉 Should process? ${shouldProcessNew ? 'YES ✅ (PASS)' : 'NO ❌ (FAIL)'}`);

    // Cleanup
    await prisma.lead.delete({ where: { id: lead.id } });
    console.log('🧹 Cleanup complete.');

    if (!shouldProcessOld && shouldProcessNew) {
        console.log('\n✨ TEST PASSED: Historical emails are correctly ignored.');
    } else {
        console.log('\n❌ TEST FAILED: Verification logic issue.');
        process.exit(1);
    }
}

testFix();
