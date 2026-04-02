import { runSequences } from '../lib/sequences';
import prisma from '../lib/db';

async function testHumanGate() {
  console.log('--- STARTING HUMAN GATE VERIFICATION ---');

  // 1. Setup Test Client & Business Brain
  let client = await prisma.client.findFirst({ where: { name: 'Test Client' } });
  if (!client) {
    client = await prisma.client.create({
      data: {
        name: 'Test Client',
        autoPilotMode: 'manual', // CRITICAL
        smtpUser: process.env.SMTP_USER,
        smtpPass: process.env.SMTP_PASS,
        smtpHost: 'smtp.gmail.com',
        imapHost: 'imap.gmail.com'
      }
    });
  } else {
    await prisma.client.update({
        where: { id: client.id },
        data: { autoPilotMode: 'manual' }
    });
  }

  let brain = await prisma.businessBrain.findUnique({ where: { clientId: client.id } });
  if (!brain) {
    await prisma.businessBrain.create({
      data: {
        clientId: client.id,
        voiceGuide: { tone: 'professional', adjectives: ['direct'], vocab_do: [], vocab_dont: [], samples: [] }
      }
    });
  }

  // 2. Setup Sequence
  let sequence = await prisma.neuralSequence.findUnique({ where: { clientId_name: { clientId: client.id, name: 'Test Sequence' } } });
  if (!sequence) {
    sequence = await prisma.neuralSequence.create({
      data: {
        clientId: client.id,
        name: 'Test Sequence',
        steps: [
          { delayDays: 0, strategy: 'Intro drafted to Gmail' }
        ]
      }
    });
  }

  // 3. Create Lead
  const lead = await prisma.lead.create({
    data: {
      clientId: client.id,
      name: 'Test Lead',
      email: 'ashika.stedaxis@gmail.com', // Sending to self for safety
      source: 'manual',
      isAutoPilotActive: true,
    }
  });

  // 4. Enroll Lead in Sequence
  await prisma.leadSequence.create({
    data: {
      leadId: lead.id,
      sequenceId: sequence.id,
      nextStepAt: new Date(),
      status: 'active',
      currentStep: 0
    }
  });

  console.log(`Lead ${lead.id} created and enrolled. Running sequence...`);

  // 5. Run Sequence
  const results = await runSequences(lead.id);
  console.log('Sequence Run Results:', JSON.stringify(results, null, 2));

  // 6. Verify Human Gate creation
  const gate = await prisma.humanGate.findFirst({
    where: { clientId: client.id, status: 'pending' },
    orderBy: { createdAt: 'desc' }
  });

  if (gate) {
    console.log('✅ SUCCESS: Human Gate created!');
    console.log('Gate Content:', JSON.stringify(gate.contextJson, null, 2));
  } else {
    console.error('❌ FAILURE: No Human Gate created.');
  }

  // 7. Verify Activity Log
  const activity = await prisma.leadActivity.findFirst({
    where: { leadId: lead.id, type: 'email_draft' }
  });

  if (activity) {
    console.log('✅ SUCCESS: email_draft activity logged!');
  } else {
    console.error('❌ FAILURE: No email_draft activity.');
  }

  console.log('--- VERIFICATION COMPLETE ---');
}

testHumanGate().catch(console.error);
