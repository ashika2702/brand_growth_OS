
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const targetId = 'client_g504ad269';
  const client = await prisma.client.findUnique({
    where: { id: targetId }
  });
  
  if (client) {
    console.log(`Client ${targetId} exists:`, client.name);
  } else {
    console.log(`Client ${targetId} does NOT exist.`);
    
    // Auto-fix: Create the client they are trying to reach
    await prisma.client.create({
      data: {
        id: targetId,
        name: "STEDAXIS (V2)",
        domain: "stedaxis.com.au",
        primaryColor: "#3E80FF"
      }
    });
    
    // Also create the brain context for it
    const cleanData = {
      personas: [
        {
          name: "Engineering Managers / Project Leads",
          description: "Focus on technical truth and hitting production deadlines.",
          painPoints: "Technical talent shortages and team bottlenecks.",
          desires: "Accuracy in simulation (FEA/CFD) and reducing prototype costs."
        },
        {
          name: "Residential & Commercial Property Developers",
          description: "Need to create emotional buy-in before a project is built.",
          painPoints: "Difficulty communicating complex visions using 2D plans.",
          desires: "Stunning 3D renders that sell units off-plan."
        },
        {
          name: "Hardware Startups / R&D Directors",
          description: "Bridging the gap between a cool idea and a manufacturable product.",
          painPoints: "The Design-to-Engineering Gap.",
          desires: "Seamless integration of hardware design and smart software."
        }
      ],
      offers: [
        {
          name: "Design Optimization Audit",
          price: "FREE",
          valueProp: "A data-driven workflow audit to save thousands in R&D costs."
        },
        {
          name: "Rapid Visual Prototype",
          price: "$1,450",
          valueProp: "High-fidelity 3D results in under 48 hours for stakeholder approval."
        },
        {
          name: "Full-Cycle Product Development",
          price: "$10k - $50k+",
          valueProp: "End-to-end partnership from conceptual design to manufacturing hand-off."
        }
      ],
      voiceGuide: {
        tone: "Professional",
        adjectives: ["Precise", "Reliable", "Innovative", "Authoritative"],
        vocab_do: ["Simulation", "Validation", "High-Fidelity", "Optimization"],
        vocab_dont: ["Cheap", "Quick-fix", "Outsourcing", "Basic"],
        samples: ["At Stedaxis, we bridge the gap between creative vision and technical reality."]
      }
    };

    await prisma.businessBrain.create({
      data: {
        clientId: targetId,
        ...cleanData
      }
    });
    
    console.log(`Created client ${targetId} and initialized brand context.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
