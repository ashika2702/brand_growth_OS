import prisma from '../lib/db';
import { runSequences } from '../lib/sequences';

async function verifyIntelligentGate() {
    console.log('--- VERIFYING INTELLIGENT GATE LOGIC ---');

    // 1. Create a mock lead in 'new' stage with a sequence due
    const client = await prisma.client.findFirst({
        where: { smtpUser: { not: null } }
    });

    if (!client) {
        console.error('No client with SMTP found. Create one first.');
        return;
    }

    const testLead = await prisma.lead.create({
        data: {
            clientId: client.id,
            name: 'Test Gate Guard',
            email: 'gate-test@example.com',
            stage: 'new',
            isAutoPilotActive: true,
            source: 'Verification Script'
        }
    });

    const sequence = await prisma.sequence.findFirst();
    if (!sequence) {
        console.log('No sequences found. Skipping runner test.');
    } else {
        await prisma.leadSequence.create({
            data: {
                leadId: testLead.id,
                sequenceId: sequence.id,
                status: 'active',
                currentStep: 0,
                nextStepAt: new Date(Date.now() - 1000) // Due now
            }
        });

        // 2. Create a PENDING Human Gate for this lead
        await prisma.humanGate.create({
            data: {
                clientId: client.id,
                leadId: testLead.id,
                gateType: 'approval',
                status: 'pending',
                question: 'Mock Gate'
            }
        });

        console.log(`[TEST] Created Lead ${testLead.id} with a pending Human Gate.`);

        // 3. Run Sequences
        console.log('[TEST] Running sequences...');
        const results = await runSequences(testLead.id);
        
        console.log('[TEST] Sequence Runner Results:', JSON.stringify(results, null, 2));

        if (results.length === 0) {
            console.log('✅ SUCCESS: Sequence Runner skipped the lead because of the pending gate.');
        } else {
            console.log('❌ FAILURE: Sequence Runner processed the lead despite the pending gate.');
        }
    }

    // Cleanup
    console.log('[TEST] Cleaning up test data...');
    await prisma.leadSequence.deleteMany({ where: { leadId: testLead.id } });
    await prisma.humanGate.deleteMany({ where: { leadId: testLead.id } });
    await prisma.leadActivity.deleteMany({ where: { leadId: testLead.id } });
    await prisma.lead.delete({ where: { id: testLead.id } });
}

verifyIntelligentGate().catch(console.error);
