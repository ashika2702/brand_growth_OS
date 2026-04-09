-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "googleAccessToken" TEXT,
ADD COLUMN     "googleRefreshToken" TEXT,
ADD COLUMN     "googleTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "googleSearchConsoleUrl" TEXT;
