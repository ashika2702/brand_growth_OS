-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "currentSequenceId" TEXT,
ADD COLUMN     "isAutoPilotActive" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "NeuralSequence" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "steps" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NeuralSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadSequence" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "sequenceId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "nextStepAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadSequence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NeuralSequence_clientId_idx" ON "NeuralSequence"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "LeadSequence_leadId_sequenceId_key" ON "LeadSequence"("leadId", "sequenceId");

-- AddForeignKey
ALTER TABLE "NeuralSequence" ADD CONSTRAINT "NeuralSequence_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadSequence" ADD CONSTRAINT "LeadSequence_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadSequence" ADD CONSTRAINT "LeadSequence_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "NeuralSequence"("id") ON DELETE CASCADE ON UPDATE CASCADE;
