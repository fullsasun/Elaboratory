-- AlterTable
ALTER TABLE "Goods" ADD COLUMN     "lateRentId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lateRentId" TEXT;

-- CreateTable
CREATE TABLE "lateRent" (
    "id" TEXT NOT NULL,
    "startRent" TIMESTAMP(3),
    "finishRent" TIMESTAMP(3),
    "rentApprovalStatus" "APPROVAL_STATUS" DEFAULT 'WAITING',
    "loanStatus" "LOAN_STATUS" DEFAULT 'NOT_STARTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tagIdId" TEXT,

    CONSTRAINT "lateRent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_lateRentId_fkey" FOREIGN KEY ("lateRentId") REFERENCES "lateRent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goods" ADD CONSTRAINT "Goods_lateRentId_fkey" FOREIGN KEY ("lateRentId") REFERENCES "lateRent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lateRent" ADD CONSTRAINT "lateRent_tagIdId_fkey" FOREIGN KEY ("tagIdId") REFERENCES "TagId"("id") ON DELETE SET NULL ON UPDATE CASCADE;
