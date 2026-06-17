/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `ProductImage` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ProductImage_productId_idx";

-- AlterTable
ALTER TABLE "ProductImage" DROP COLUMN "updatedAt",
ADD COLUMN     "publicId" TEXT;
