-- CreateTable
CREATE TABLE "ContentRequest" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "platform" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "title" TEXT NOT NULL,
    "briefText" TEXT,
    "aiBrief" JSONB,
    "campaign" TEXT,
    "dueDate" TIMESTAMP(3),
    "assignedTo" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "voiceScore" INTEGER,
    "performanceData" JSONB,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentIntelligence" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "tips" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentIntelligence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentRequest_clientId_status_idx" ON "ContentRequest"("clientId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ContentIntelligence_clientId_key" ON "ContentIntelligence"("clientId");

-- AddForeignKey
ALTER TABLE "ContentRequest" ADD CONSTRAINT "ContentRequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentIntelligence" ADD CONSTRAINT "ContentIntelligence_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
