-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "fromName" TEXT,
ADD COLUMN     "imapHost" TEXT,
ADD COLUMN     "imapPort" INTEGER,
ADD COLUMN     "smtpHost" TEXT,
ADD COLUMN     "smtpPass" TEXT,
ADD COLUMN     "smtpPort" INTEGER,
ADD COLUMN     "smtpUser" TEXT;
