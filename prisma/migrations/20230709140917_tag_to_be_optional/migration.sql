/*
  Warnings:

  - Made the column `tagId` on table `TagId` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "TagId" ALTER COLUMN "tagId" SET NOT NULL;
