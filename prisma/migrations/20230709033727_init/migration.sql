-- CreateEnum
CREATE TYPE "APPROVAL_STATUS" AS ENUM ('ALLOWED', 'REJECTED', 'WAITING');

-- CreateEnum
CREATE TYPE "LOAN_STATUS" AS ENUM ('FINISH', 'USED', 'NOT_STARTED');

-- CreateEnum
CREATE TYPE "GOODS_STATUS" AS ENUM ('READY_IN_INVENTORY', 'TAKEN_BY_USER');

-- CreateTable
CREATE TABLE "UserActivity" (
    "id" TEXT NOT NULL,
    "user_chat_id" TEXT NOT NULL,
    "activity" TEXT,

    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "user_chat_id" TEXT NOT NULL,
    "nim" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "rentId" TEXT,
    "roleId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goods" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rentId" TEXT,

    CONSTRAINT "Goods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagId" (
    "id" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "status" "GOODS_STATUS" DEFAULT 'READY_IN_INVENTORY',
    "goodsId" TEXT,

    CONSTRAINT "TagId_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rent" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER,
    "startRent" TIMESTAMP(3),
    "finishRent" TIMESTAMP(3),
    "rentApprovalStatus" "APPROVAL_STATUS" DEFAULT 'WAITING',
    "loanStatus" "LOAN_STATUS" DEFAULT 'NOT_STARTED',

    CONSTRAINT "Rent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GoodsToRent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_RentToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserActivity_user_chat_id_key" ON "UserActivity"("user_chat_id");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_user_chat_id_key" ON "User"("user_chat_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_nim_key" ON "User"("nim");

-- CreateIndex
CREATE UNIQUE INDEX "TagId_tagId_key" ON "TagId"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "_GoodsToRent_AB_unique" ON "_GoodsToRent"("A", "B");

-- CreateIndex
CREATE INDEX "_GoodsToRent_B_index" ON "_GoodsToRent"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RentToUser_AB_unique" ON "_RentToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RentToUser_B_index" ON "_RentToUser"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagId" ADD CONSTRAINT "TagId_goodsId_fkey" FOREIGN KEY ("goodsId") REFERENCES "Goods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GoodsToRent" ADD CONSTRAINT "_GoodsToRent_A_fkey" FOREIGN KEY ("A") REFERENCES "Goods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GoodsToRent" ADD CONSTRAINT "_GoodsToRent_B_fkey" FOREIGN KEY ("B") REFERENCES "Rent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RentToUser" ADD CONSTRAINT "_RentToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Rent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RentToUser" ADD CONSTRAINT "_RentToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
