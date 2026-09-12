-- AlterTable
ALTER TABLE "Lot" ADD COLUMN     "hasEquippedKitchen" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFurnished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "furnishedEquipment" TEXT[];
