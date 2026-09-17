-- AlterTable
ALTER TABLE "GeneratedContent" ADD COLUMN     "externalPostUrl" TEXT,
ADD COLUMN     "externalLikes" INTEGER,
ADD COLUMN     "externalViews" INTEGER,
ADD COLUMN     "externalComments" INTEGER,
ADD COLUMN     "externalStatsUpdatedAt" TIMESTAMP(3);
