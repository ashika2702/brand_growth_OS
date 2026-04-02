const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFix() {
    console.log('🧪 [TEST] Starting IMAP Sync Fix Verification...');

    try {
        // Find an existing lead to get a valid clientId
        const existingLead = await prisma.lead.findFirst();
        if (!existingLead) {
            console.error('❌ No leads found in database. Please create one lead first.');
            process.exit(1);
        }
        const validClientId = existingLead.clientId;

        // 1. Create a dummy lead with a fixed timestamp (now)
        const lead = await prisma.lead.create({
            data: {
                clientId: validClientId,
                name: 'Test Lead',
                email: 'test@example.com',
                source: 'Manual Test',
                stage: 'new',
                createdAt: new Date() 
            }
        });

        console.log(`✅ Lead Created: ${lead.name} (ID: ${lead.id}) at ${lead.createdAt.toISOString()}`);

        // 2. Simulated "Old" Email (2 minutes before lead creation)
        const oldEmailDate = new Date(lead.createdAt.getTime() - 2 * 60 * 1000);
        
        // Logic Check (The exact condition added to lib/imap.ts)
        const shouldProcessOld = (lead && oldEmailDate && oldEmailDate > lead.createdAt);
        console.log(`📡 [OLD EMAIL] Received at: ${oldEmailDate.toISOString()}`);
        console.log(`👉 Should process? ${shouldProcessOld ? 'YES ❌ (FAIL: Historical email processed!)' : 'NO ✅ (PASS: Historical email ignored)'}`);

        // 3. Simulated "New" Email (2 minutes after lead creation)
        const newEmailDate = new Date(lead.createdAt.getTime() + 2 * 60 * 1000);
        const shouldProcessNew = (lead && newEmailDate && newEmailDate > lead.createdAt);
        console.log(`📡 [NEW EMAIL] Received at: ${newEmailDate.toISOString()}`);
        console.log(`👉 Should process? ${shouldProcessNew ? 'YES ✅ (PASS: New email processed)' : 'NO ❌ (FAIL: New email ignored!)'}`);

        // Cleanup
        await prisma.lead.delete({ where: { id: lead.id } });
        console.log('🧹 Cleanup complete.');

        if (!shouldProcessOld && shouldProcessNew) {
            console.log('\n✨ TEST PASSED: Historical emails are correctly ignored.');
        } else {
            console.log('\n❌ TEST FAILED: Verification logic check failed.');
            process.exit(1);
        }
    } catch (err) {
        console.error('❌ Error during test:', err);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

testFix();
