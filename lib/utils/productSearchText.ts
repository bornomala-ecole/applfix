type ProductSearchVariant = {
  sku?: string | null;
  title?: string | null;
  color?: string | null;
};

type BuildProductSearchTextArgs = {
  name?: string | null;
  brandName?: string | null;
  categoryName?: string | null;
  seriesName?: string | null;
  variants?: ProductSearchVariant[];
};

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildProductSearchText({
  name,
  brandName,
  categoryName,
  seriesName,
  variants = [],
}: BuildProductSearchTextArgs) {
  const parts: string[] = [];

  if (name) parts.push(name);
  if (brandName) parts.push(brandName);
  if (categoryName) parts.push(categoryName);
  if (seriesName) parts.push(seriesName);

  variants.forEach((variant) => {
    if (variant.sku) parts.push(variant.sku);
    if (variant.title) parts.push(variant.title);
    if (variant.color) parts.push(variant.color);
  });

  return normalizeSearchText(parts.join(" "));
}