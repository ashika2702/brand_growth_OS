-- AlterTable
ALTER TABLE "HumanGate" ADD COLUMN     "leadId" TEXT;

-- AddForeignKey
ALTER TABLE "HumanGate" ADD CONSTRAINT "HumanGate_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
