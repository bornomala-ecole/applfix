/*
  Warnings:

  - You are about to drop the column `price` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `ram` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `storage` on the `ProductVariant` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[productId,title,color]` on the table `ProductVariant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `ProductImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `ProductVariant` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Product_slug_idx";

-- DropIndex
DROP INDEX "ProductVariant_productId_idx";

-- DropIndex
DROP INDEX "ProductVariant_productId_storage_color_idx";

-- DropIndex
DROP INDEX "ProductVariant_sku_idx";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "price",
DROP COLUMN "stock";

-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "ram",
DROP COLUMN "storage",
ADD COLUMN     "title" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Product_isActive_idx" ON "Product"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_productId_title_color_key" ON "ProductVariant"("productId", "title", "color");
