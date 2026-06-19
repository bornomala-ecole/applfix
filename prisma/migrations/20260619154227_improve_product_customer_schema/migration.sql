-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "shortDescription" TEXT;

-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "comparePrice" DOUBLE PRECISION,
ADD COLUMN     "costPrice" DOUBLE PRECISION,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lowStockThreshold" INTEGER NOT NULL DEFAULT 5;

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "Address_userId_isDefault_idx" ON "Address"("userId", "isDefault");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "Product_isFeatured_idx" ON "Product"("isFeatured");

-- CreateIndex
CREATE INDEX "Product_createdAt_idx" ON "Product"("createdAt");

-- CreateIndex
CREATE INDEX "ProductImage_productId_idx" ON "ProductImage"("productId");

-- CreateIndex
CREATE INDEX "ProductImage_type_idx" ON "ProductImage"("type");

-- CreateIndex
CREATE INDEX "ProductImage_productId_type_idx" ON "ProductImage"("productId", "type");

-- CreateIndex
CREATE INDEX "ProductImage_sortOrder_idx" ON "ProductImage"("sortOrder");

-- CreateIndex
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");

-- CreateIndex
CREATE INDEX "ProductVariant_isActive_idx" ON "ProductVariant"("isActive");

-- CreateIndex
CREATE INDEX "ProductVariant_price_idx" ON "ProductVariant"("price");

-- CreateIndex
CREATE INDEX "ProductVariant_stock_idx" ON "ProductVariant"("stock");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");
