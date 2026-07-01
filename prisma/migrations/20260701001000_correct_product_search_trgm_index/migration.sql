CREATE EXTENSION IF NOT EXISTS pg_trgm;

DROP INDEX IF EXISTS "Product_productSearchText_idx";

CREATE INDEX IF NOT EXISTS "Product_productSearchText_trgm_idx"
ON "Product"
USING gin ("productSearchText" gin_trgm_ops);
