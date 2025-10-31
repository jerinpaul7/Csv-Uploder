/*
  Warnings:

  - A unique constraint covering the columns `[SKU]` on the table `stock` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "stock_SKU_key" ON "stock"("SKU");
