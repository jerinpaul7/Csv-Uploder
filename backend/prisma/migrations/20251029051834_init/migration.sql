-- CreateTable
CREATE TABLE "Stock" (
    "id" SERIAL NOT NULL,
    "ItemName" TEXT NOT NULL,
    "SKU" TEXT NOT NULL,
    "Category" TEXT NOT NULL,
    "Unit" TEXT NOT NULL,
    "CurrentStock" DOUBLE PRECISION NOT NULL,
    "ReorderLevel" INTEGER NOT NULL,
    "Status" TEXT NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);
