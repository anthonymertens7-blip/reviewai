-- CreateTable
CREATE TABLE "LotPhoto" (
    "id" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LotPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LotPhoto_lotId_idx" ON "LotPhoto"("lotId");

-- AddForeignKey
ALTER TABLE "LotPhoto" ADD CONSTRAINT "LotPhoto_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "Lot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
