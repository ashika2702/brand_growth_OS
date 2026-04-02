/*
  Warnings:

  - You are about to drop the column `googleAdsCampaignId` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `googleAdsKey` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `linkedInAccessToken` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `linkedInCompanyId` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `metaAccessToken` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `metaPageId` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `xAccessToken` on the `Client` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Client" DROP COLUMN "googleAdsCampaignId",
DROP COLUMN "googleAdsKey",
DROP COLUMN "linkedInAccessToken",
DROP COLUMN "linkedInCompanyId",
DROP COLUMN "metaAccessToken",
DROP COLUMN "metaPageId",
DROP COLUMN "xAccessToken",
ADD COLUMN     "autoPilotMode" TEXT NOT NULL DEFAULT 'manual';

-- CreateTable
CREATE TABLE "HumanGate" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "agentId" TEXT,
    "gateType" TEXT NOT NULL,
    "question" TEXT,
    "contextJson" JSONB,
    "optionsJson" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HumanGate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HumanGate_clientId_status_idx" ON "HumanGate"("clientId", "status");

-- AddForeignKey
ALTER TABLE "HumanGate" ADD CONSTRAINT "HumanGate_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
