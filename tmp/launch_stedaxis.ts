import prisma from '../lib/db';

async function launch() {
  console.log('🏗️  Starting STEDAXIS Genesis Launch...');

  try {
    // 1. Create the Client & Identity
    const client = await prisma.client.create({
      data: {
        name: 'STEDAXIS',
        fromName: 'STEDAXIS',
        primaryColor: '#FF8C00', // Luxury Orange
        smtpHost: 'smtp.gmail.com',
        smtpPort: 465,
        smtpUser: 'ashika.stedaxis@gmail.com',
        smtpPass: 'hmwrhscwvsznsyaj',
        imapHost: 'imap.gmail.com',
        imapPort: 993,
        
        // 2. Create the Business Brain (Voice, Personas, Offers)
        brain: {
          create: {
            voiceGuide: {
              tone: 'Professional & Direct',
              adjectives: ['Precision-Led', 'Immersive', 'Authoritative', 'Cutting-Edge', 'Flawless'],
              dos: ['High-Fidelity', 'Technical Validation', 'First-Time-Right'],
              donts: ['Guesswork', 'Cheap', 'Maybe']
            },
            personas: [
              { name: 'Residential Property Developers', profile: 'Focused on off-plan sales.', painPoints: 'Slow sales, buyer hesitation', desires: 'Rapid pre-sales, 3D renders' },
              { name: 'Industrial Product Manufacturers', profile: 'Engineering-led hardware owners.', painPoints: 'Expensive prototyping, design flaws', desires: 'First-time-right, simulation' },
              { name: 'Innovative Architects', profile: 'Firms winning high-stakes bids.', painPoints: 'Misunderstood 2D plans, losing bids', desires: 'AR/VR walkthroughs, wow factor' }
            ],
            offers: [
              { name: '3D Visualization Pack', price: '$1,500+', valueProp: 'Secure pre-sales faster via photorealism.' },
              { name: 'Engineering Innovation Sprint', price: '$5,000+', valueProp: 'Eliminate prototype failures via FEA/CFD.' },
              { name: 'Immersive Experience Engine', price: '$3,000+', valueProp: 'Win bids with AR/VR walkthroughs.' }
            ]
          }
        }
      }
    });

    // 3. Create the 5-Day Automated Sequences
    const sequences = [
      {
        name: 'The Future-Focused Family Blueprint',
        steps: [
          { day: 0, name: 'The Catalyst', goal: 'Initial Pulse', strategy: 'Lead with visual proof.' },
          { day: 1, name: 'Imagination Gap', goal: 'Pain Point', strategy: 'Offer a visual audit.' },
          { day: 2, name: 'Velocity', goal: 'Social Proof', strategy: 'Case study of 30% faster sales.' },
          { day: 3, name: 'Funding Logic', goal: 'Finance', strategy: 'Bank valuation and EOI capture.' },
          { day: 4, name: 'Direct Line', goal: 'The Ask', strategy: 'Invite to site-plan review call.' }
        ]
      },
      {
        name: 'The Precision Engineering Blueprint',
        steps: [
          { day: 0, name: 'Prototype Killer', goal: 'Cost Savings', strategy: 'Simulation vs Physical cost.' },
          { day: 1, name: 'Structural Validation', goal: 'FEA', strategy: 'Stress points in digital models.' },
          { day: 2, name: 'Fluid Efficiency', goal: 'CFD', strategy: 'Airflow and heat management.' },
          { day: 3, name: 'Speed-to-Market', goal: 'Timing', strategy: 'Shortcut R&D cycles.' },
          { day: 4, name: 'Audit Invite', goal: 'Consultation', strategy: 'Review CAD files for optimization.' }
        ]
      }
    ];

    for (const seq of sequences) {
      await prisma.neuralSequence.create({
        data: {
          clientId: client.id,
          name: seq.name,
          steps: seq.steps,
          isActive: true
        }
      });
    }

    console.log('✅ STEDAXIS LAUNCHED SUCCESSFULLY!');
    console.log('🆔 Client ID:', client.id);
    console.log('📬 Channel: ashika.stedaxis@gmail.com');
  } catch (error) {
    console.error('❌ Launch Failed:', error);
  }
}

launch();
