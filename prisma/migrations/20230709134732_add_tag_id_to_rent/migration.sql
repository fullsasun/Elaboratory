/*
  Warnings:

  - You are about to drop the column `quantity` on the `Rent` table. All the data in the column will be lost.
  - Added the required column `tagIdId` to the `Rent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Rent" DROP COLUMN "quantity",
ADD COLUMN     "tagIdId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Rent" ADD CONSTRAINT "Rent_tagIdId_fkey" FOREIGN KEY ("tagIdId") REFERENCES "TagId"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
