/*
  Warnings:

  - You are about to drop the `stock` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."stock";

-- CreateTable
CREATE TABLE "Stock" (
    "id" SERIAL NOT NULL,
    "ItemName" TEXT NOT NULL,
    "SKU" TEXT NOT NULL,
    "Category" TEXT NOT NULL,
    "Unit" TEXT NOT NULL,
    "CurrentStock" DOUBLE PRECISION NOT NULL,
    "ReorderLevel" DOUBLE PRECISION NOT NULL,
    "Status" TEXT NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);
