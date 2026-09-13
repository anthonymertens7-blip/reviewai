-- AlterTable
ALTER TABLE "Program" ADD COLUMN     "isCoOwnership" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "condoLotsCount" INTEGER;

-- AlterTable
ALTER TABLE "Lot" ADD COLUMN     "dpeEnergyClass" TEXT,
ADD COLUMN     "dpeGesClass" TEXT,
ADD COLUMN     "condoAnnualCharges" DOUBLE PRECISION;
