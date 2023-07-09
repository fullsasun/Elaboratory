-- DropForeignKey
ALTER TABLE "Rent" DROP CONSTRAINT "Rent_tagIdId_fkey";

-- AlterTable
ALTER TABLE "Rent" ALTER COLUMN "tagIdId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Rent" ADD CONSTRAINT "Rent_tagIdId_fkey" FOREIGN KEY ("tagIdId") REFERENCES "TagId"("id") ON DELETE SET NULL ON UPDATE CASCADE;
