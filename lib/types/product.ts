export type ProductImage = {
  url: string;
  public_id: string;
  alt?: string;
};

export type ProductOptionDefinition = {
  name: string; // color, storage, condition
  values: string[];
};

export type ProductVariant = {
  sku: string;
  price: number;
  stock: number;
  image?: ProductImage;
  options: Record<string, string>; // { color: "Black", storage: "128GB" }
};

export type ProductSpecification = {
  label: string;
  value: string;
};

export type ProductDocumentType = {
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  brand: string;
  category: string;
  tags?: string[];

  mainImage: ProductImage;
  galleryImages: ProductImage[];

  hasVariants: boolean;
  optionDefinitions: ProductOptionDefinition[];
  variants: ProductVariant[];

  basePrice?: number;
  baseStock?: number;
  baseSku?: string;

  specifications: ProductSpecification[];

  averageRating: number;
  numReviews: number;

  isFeatured: boolean;
  isPublished: boolean;

  seoTitle?: string;
  seoDescription?: string;
};