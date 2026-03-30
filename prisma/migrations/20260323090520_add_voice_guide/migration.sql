-- AlterTable
ALTER TABLE "BusinessBrain" ADD COLUMN     "voiceGuide" JSONB;

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "canvaAccessToken" TEXT,
ADD COLUMN     "canvaRefreshToken" TEXT,
ADD COLUMN     "canvaTokenExpiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ContentRequest" ADD COLUMN     "aiImageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "canvaDesignUrl" TEXT,
ADD COLUMN     "publishAt" TIMESTAMP(3);
