-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "bestSelling" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "seriesId" TEXT;

-- CreateTable
CREATE TABLE "Series" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Series_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Series_brandId_idx" ON "Series"("brandId");

-- CreateIndex
CREATE INDEX "Series_sortOrder_idx" ON "Series"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Series_brandId_name_key" ON "Series"("brandId", "name");

-- CreateIndex
CREATE INDEX "Brand_sortOrder_idx" ON "Brand"("sortOrder");

-- CreateIndex
CREATE INDEX "Product_seriesId_idx" ON "Product"("seriesId");

-- CreateIndex
CREATE INDEX "Product_brandId_seriesId_idx" ON "Product"("brandId", "seriesId");

-- CreateIndex
CREATE INDEX "Product_bestSelling_idx" ON "Product"("bestSelling");

-- AddForeignKey
ALTER TABLE "Series" ADD CONSTRAINT "Series_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE SET NULL ON UPDATE CASCADE;
