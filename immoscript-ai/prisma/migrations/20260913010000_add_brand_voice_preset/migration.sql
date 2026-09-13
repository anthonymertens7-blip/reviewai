-- CreateTable
CREATE TABLE "BrandVoicePreset" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "target" TEXT,
    "tone" TEXT,
    "mainArgument" TEXT,
    "cta" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrandVoicePreset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BrandVoicePreset_organizationId_idx" ON "BrandVoicePreset"("organizationId");

-- AddForeignKey
ALTER TABLE "BrandVoicePreset" ADD CONSTRAINT "BrandVoicePreset_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
