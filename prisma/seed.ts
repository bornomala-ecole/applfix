import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const brands = [
  "Apple",
  "Samsung",
  "Google",
  "OnePlus",
  "Xiaomi",
  "Sony",
  "Motorola",
  "Nothing",
  "ASUS",
];

const categories = [
  "Smartphones",
  "Flagship Phones",
  "Budget Phones",
  "Gaming Phones",
  "Foldable Phones",
  "Refurbished Phones",
];

type SeedProduct = {
  name: string;
  slug: string;
  description: string;
  brand: string;
  category: string;
  isActive?: boolean;
  variants: {
    sku: string;
    title: string;
    color?: string;
    price: number;
    stock: number;
  }[];
};

const products: SeedProduct[] = [
  {
    name: "iPhone 15",
    slug: "iphone-15",
    description: "Apple iPhone 15 with powerful performance, excellent camera, and premium build quality.",
    brand: "Apple",
    category: "Flagship Phones",
    variants: [
      { sku: "APL-IP15-128-BLK", title: "128GB", color: "Black", price: 799, stock: 15 },
      { sku: "APL-IP15-256-BLU", title: "256GB", color: "Blue", price: 899, stock: 10 },
    ],
  },
  {
    name: "iPhone 15 Pro",
    slug: "iphone-15-pro",
    description: "Premium iPhone 15 Pro with titanium design, Pro camera system, and A17 Pro chip.",
    brand: "Apple",
    category: "Flagship Phones",
    variants: [
      { sku: "APL-IP15P-128-TTN", title: "128GB", color: "Natural Titanium", price: 999, stock: 8 },
      { sku: "APL-IP15P-256-BLK", title: "256GB", color: "Black Titanium", price: 1099, stock: 6 },
    ],
  },
  {
    name: "iPhone 14",
    slug: "iphone-14",
    description: "Reliable iPhone 14 with great battery life, smooth performance, and excellent cameras.",
    brand: "Apple",
    category: "Smartphones",
    variants: [
      { sku: "APL-IP14-128-RED", title: "128GB", color: "Red", price: 699, stock: 12 },
      { sku: "APL-IP14-256-WHT", title: "256GB", color: "Starlight", price: 799, stock: 7 },
    ],
  },
  {
    name: "iPhone 13 Refurbished",
    slug: "iphone-13-refurbished",
    description: "Certified refurbished iPhone 13 with strong performance and excellent value.",
    brand: "Apple",
    category: "Refurbished Phones",
    variants: [
      { sku: "APL-IP13-RFB-128-BLK", title: "128GB", color: "Midnight", price: 499, stock: 20 },
      { sku: "APL-IP13-RFB-256-PNK", title: "256GB", color: "Pink", price: 579, stock: 12 },
    ],
  },
  {
    name: "Samsung Galaxy S24",
    slug: "samsung-galaxy-s24",
    description: "Samsung Galaxy S24 with premium display, fast performance, and AI-powered features.",
    brand: "Samsung",
    category: "Flagship Phones",
    variants: [
      { sku: "SMS-S24-128-BLK", title: "128GB", color: "Onyx Black", price: 799, stock: 14 },
      { sku: "SMS-S24-256-VLT", title: "256GB", color: "Cobalt Violet", price: 859, stock: 9 },
    ],
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    slug: "samsung-galaxy-s24-ultra",
    description: "Samsung Galaxy S24 Ultra with large display, S Pen, premium camera system, and powerful performance.",
    brand: "Samsung",
    category: "Flagship Phones",
    variants: [
      { sku: "SMS-S24U-256-GRY", title: "256GB", color: "Titanium Gray", price: 1199, stock: 6 },
      { sku: "SMS-S24U-512-BLK", title: "512GB", color: "Titanium Black", price: 1299, stock: 4 },
    ],
  },
  {
    name: "Samsung Galaxy Z Fold 5",
    slug: "samsung-galaxy-z-fold-5",
    description: "Foldable Samsung phone with large inner display, multitasking features, and premium design.",
    brand: "Samsung",
    category: "Foldable Phones",
    variants: [
      { sku: "SMS-ZF5-256-BLK", title: "256GB", color: "Phantom Black", price: 1499, stock: 5 },
      { sku: "SMS-ZF5-512-BLU", title: "512GB", color: "Icy Blue", price: 1649, stock: 3 },
    ],
  },
  {
    name: "Samsung Galaxy A54",
    slug: "samsung-galaxy-a54",
    description: "Affordable Samsung phone with solid display, good camera, and dependable battery life.",
    brand: "Samsung",
    category: "Budget Phones",
    variants: [
      { sku: "SMS-A54-128-BLK", title: "128GB", color: "Black", price: 349, stock: 22 },
      { sku: "SMS-A54-256-WHT", title: "256GB", color: "White", price: 399, stock: 14 },
    ],
  },
  {
    name: "Google Pixel 8",
    slug: "google-pixel-8",
    description: "Google Pixel 8 with clean Android experience, excellent camera, and smart AI features.",
    brand: "Google",
    category: "Smartphones",
    variants: [
      { sku: "GGL-PX8-128-BLK", title: "128GB", color: "Obsidian", price: 699, stock: 13 },
      { sku: "GGL-PX8-256-RSE", title: "256GB", color: "Rose", price: 759, stock: 8 },
    ],
  },
  {
    name: "Google Pixel 8 Pro",
    slug: "google-pixel-8-pro",
    description: "Google Pixel 8 Pro with professional camera features, bright display, and AI tools.",
    brand: "Google",
    category: "Flagship Phones",
    variants: [
      { sku: "GGL-PX8P-128-BLK", title: "128GB", color: "Obsidian", price: 999, stock: 7 },
      { sku: "GGL-PX8P-256-BAY", title: "256GB", color: "Bay", price: 1059, stock: 5 },
    ],
  },
  {
    name: "Google Pixel 7a",
    slug: "google-pixel-7a",
    description: "Budget-friendly Pixel phone with excellent camera quality and clean Android software.",
    brand: "Google",
    category: "Budget Phones",
    variants: [
      { sku: "GGL-PX7A-128-WHT", title: "128GB", color: "Snow", price: 399, stock: 18 },
      { sku: "GGL-PX7A-128-BLK", title: "128GB", color: "Charcoal", price: 399, stock: 16 },
    ],
  },
  {
    name: "OnePlus 12",
    slug: "oneplus-12",
    description: "OnePlus 12 with fast performance, smooth display, and rapid charging support.",
    brand: "OnePlus",
    category: "Flagship Phones",
    variants: [
      { sku: "OP-12-256-BLK", title: "256GB", color: "Silky Black", price: 799, stock: 10 },
      { sku: "OP-12-512-GRN", title: "512GB", color: "Flowy Emerald", price: 899, stock: 6 },
    ],
  },
  {
    name: "OnePlus 12R",
    slug: "oneplus-12r",
    description: "Performance-focused OnePlus phone with strong battery life and great value.",
    brand: "OnePlus",
    category: "Smartphones",
    variants: [
      { sku: "OP-12R-128-BLU", title: "128GB", color: "Cool Blue", price: 499, stock: 15 },
      { sku: "OP-12R-256-GRY", title: "256GB", color: "Iron Gray", price: 599, stock: 9 },
    ],
  },
  {
    name: "OnePlus Nord N30",
    slug: "oneplus-nord-n30",
    description: "Affordable OnePlus phone with large display, fast charging, and reliable everyday performance.",
    brand: "OnePlus",
    category: "Budget Phones",
    variants: [
      { sku: "OP-NN30-128-BLK", title: "128GB", color: "Chromatic Gray", price: 299, stock: 25 },
      { sku: "OP-NN30-256-BLK", title: "256GB", color: "Chromatic Gray", price: 349, stock: 12 },
    ],
  },
  {
    name: "Xiaomi 14",
    slug: "xiaomi-14",
    description: "Xiaomi 14 with flagship performance, premium camera system, and compact design.",
    brand: "Xiaomi",
    category: "Flagship Phones",
    variants: [
      { sku: "XMI-14-256-BLK", title: "256GB", color: "Black", price: 749, stock: 9 },
      { sku: "XMI-14-512-WHT", title: "512GB", color: "White", price: 849, stock: 5 },
    ],
  },
  {
    name: "Xiaomi Redmi Note 13",
    slug: "xiaomi-redmi-note-13",
    description: "Affordable Xiaomi Redmi phone with strong battery, smooth display, and great everyday value.",
    brand: "Xiaomi",
    category: "Budget Phones",
    variants: [
      { sku: "XMI-RN13-128-BLK", title: "128GB", color: "Midnight Black", price: 249, stock: 30 },
      { sku: "XMI-RN13-256-BLU", title: "256GB", color: "Ice Blue", price: 299, stock: 18 },
    ],
  },
  {
    name: "Xiaomi Poco F5",
    slug: "xiaomi-poco-f5",
    description: "Performance-focused Poco phone with gaming-friendly power and excellent value.",
    brand: "Xiaomi",
    category: "Gaming Phones",
    variants: [
      { sku: "XMI-POCOF5-256-BLK", title: "256GB", color: "Black", price: 429, stock: 16 },
      { sku: "XMI-POCOF5-256-WHT", title: "256GB", color: "White", price: 429, stock: 11 },
    ],
  },
  {
    name: "Sony Xperia 1 V",
    slug: "sony-xperia-1-v",
    description: "Sony Xperia flagship with cinematic display, advanced camera controls, and premium design.",
    brand: "Sony",
    category: "Flagship Phones",
    variants: [
      { sku: "SNY-XP1V-256-BLK", title: "256GB", color: "Black", price: 1199, stock: 4 },
      { sku: "SNY-XP1V-512-GRN", title: "512GB", color: "Khaki Green", price: 1299, stock: 2 },
    ],
  },
  {
    name: "Sony Xperia 5 V",
    slug: "sony-xperia-5-v",
    description: "Compact Sony Xperia phone with premium camera tools and excellent media features.",
    brand: "Sony",
    category: "Smartphones",
    variants: [
      { sku: "SNY-XP5V-128-BLK", title: "128GB", color: "Black", price: 799, stock: 7 },
      { sku: "SNY-XP5V-256-BLU", title: "256GB", color: "Blue", price: 899, stock: 4 },
    ],
  },
  {
    name: "Motorola Edge Plus",
    slug: "motorola-edge-plus",
    description: "Motorola Edge Plus with premium display, fast charging, and flagship-level performance.",
    brand: "Motorola",
    category: "Flagship Phones",
    variants: [
      { sku: "MTR-EDGEPLUS-256-BLK", title: "256GB", color: "Interstellar Black", price: 799, stock: 9 },
      { sku: "MTR-EDGEPLUS-512-BLK", title: "512GB", color: "Interstellar Black", price: 899, stock: 5 },
    ],
  },
  {
    name: "Motorola Moto G Power",
    slug: "motorola-moto-g-power",
    description: "Budget Motorola phone with long battery life and reliable daily performance.",
    brand: "Motorola",
    category: "Budget Phones",
    variants: [
      { sku: "MTR-GPOWER-128-BLK", title: "128GB", color: "Black", price: 199, stock: 35 },
      { sku: "MTR-GPOWER-128-BLU", title: "128GB", color: "Blue", price: 199, stock: 20 },
    ],
  },
  {
    name: "Nothing Phone 2",
    slug: "nothing-phone-2",
    description: "Nothing Phone 2 with transparent design, Glyph interface, and smooth Android experience.",
    brand: "Nothing",
    category: "Smartphones",
    variants: [
      { sku: "NTH-PH2-128-WHT", title: "128GB", color: "White", price: 599, stock: 10 },
      { sku: "NTH-PH2-256-BLK", title: "256GB", color: "Black", price: 699, stock: 7 },
    ],
  },
  {
    name: "Nothing Phone 2a",
    slug: "nothing-phone-2a",
    description: "Affordable Nothing phone with unique design, solid performance, and clean software.",
    brand: "Nothing",
    category: "Budget Phones",
    variants: [
      { sku: "NTH-PH2A-128-WHT", title: "128GB", color: "White", price: 349, stock: 18 },
      { sku: "NTH-PH2A-256-BLK", title: "256GB", color: "Black", price: 399, stock: 12 },
    ],
  },
  {
    name: "ASUS ROG Phone 8",
    slug: "asus-rog-phone-8",
    description: "Gaming-focused smartphone with powerful performance, fast display, and premium cooling design.",
    brand: "Samsung",
    category: "Gaming Phones",
    variants: [
      { sku: "ROG-PH8-256-BLK", title: "256GB", color: "Phantom Black", price: 999, stock: 5 },
      { sku: "ROG-PH8-512-BLK", title: "512GB", color: "Phantom Black", price: 1199, stock: 3 },
    ],
  },
  {
    name: "Samsung Galaxy Z Flip 5",
    slug: "samsung-galaxy-z-flip-5",
    description: "Compact foldable Samsung phone with stylish design and flexible camera experience.",
    brand: "Samsung",
    category: "Foldable Phones",
    variants: [
      { sku: "SMS-ZFLIP5-256-MNT", title: "256GB", color: "Mint", price: 999, stock: 8 },
      { sku: "SMS-ZFLIP5-512-GRY", title: "512GB", color: "Graphite", price: 1099, stock: 5 },
    ],
  },
  {
    name: "iPhone 12 Refurbished",
    slug: "iphone-12-refurbished",
    description: "Certified refurbished iPhone 12 with OLED display and strong everyday performance.",
    brand: "Apple",
    category: "Refurbished Phones",
    variants: [
      { sku: "APL-IP12-RFB-64-BLK", title: "64GB", color: "Black", price: 349, stock: 20 },
      { sku: "APL-IP12-RFB-128-BLU", title: "128GB", color: "Blue", price: 399, stock: 15 },
    ],
  },
  {
    name: "Samsung Galaxy S22 Refurbished",
    slug: "samsung-galaxy-s22-refurbished",
    description: "Refurbished Galaxy S22 with compact flagship performance and premium display.",
    brand: "Samsung",
    category: "Refurbished Phones",
    variants: [
      { sku: "SMS-S22-RFB-128-BLK", title: "128GB", color: "Black", price: 399, stock: 14 },
      { sku: "SMS-S22-RFB-256-GRN", title: "256GB", color: "Green", price: 459, stock: 9 },
    ],
  },
  {
    name: "Google Pixel 6 Refurbished",
    slug: "google-pixel-6-refurbished",
    description: "Refurbished Google Pixel 6 with excellent camera quality and clean Android software.",
    brand: "Google",
    category: "Refurbished Phones",
    variants: [
      { sku: "GGL-PX6-RFB-128-BLK", title: "128GB", color: "Stormy Black", price: 299, stock: 18 },
      { sku: "GGL-PX6-RFB-256-GRN", title: "256GB", color: "Sorta Seafoam", price: 349, stock: 10 },
    ],
  },
  {
    name: "Motorola Razr Plus",
    slug: "motorola-razr-plus",
    description: "Modern flip phone with foldable display, compact design, and stylish outer screen.",
    brand: "Motorola",
    category: "Foldable Phones",
    variants: [
      { sku: "MTR-RAZRPLUS-256-BLK", title: "256GB", color: "Infinite Black", price: 899, stock: 6 },
      { sku: "MTR-RAZRPLUS-256-RED", title: "256GB", color: "Viva Magenta", price: 899, stock: 4 },
    ],
  },
  {
    name: "Xiaomi Black Shark 5",
    slug: "xiaomi-black-shark-5",
    description: "Gaming phone with strong performance, responsive display, and gamer-focused features.",
    brand: "Xiaomi",
    category: "Gaming Phones",
    variants: [
      { sku: "XMI-BS5-128-BLK", title: "128GB", color: "Black", price: 499, stock: 8 },
      { sku: "XMI-BS5-256-WHT", title: "256GB", color: "White", price: 599, stock: 5 },
    ],
  },
];

function imageUrl(name: string, label: string) {
  return `https://placehold.co/800x800/png?text=${encodeURIComponent(
    `${name} ${label}`
  )}`;
}

async function main() {
  console.log("🌱 Seeding started...");

  // ======================
  // BRANDS
  // ======================
  for (const brandName of brands) {
    await prisma.brand.upsert({
      where: {
        name: brandName,
      },
      update: {},
      create: {
        name: brandName,
        logo: `https://placehold.co/300x120/png?text=${encodeURIComponent(
          brandName
        )}`,
      },
    });
  }

  console.log("✅ Brands seeded");

  // ======================
  // CATEGORIES
  // ======================
  for (const categoryName of categories) {
    await prisma.category.upsert({
      where: {
        name: categoryName,
      },
      update: {},
      create: {
        name: categoryName,
      },
    });
  }

  console.log("✅ Categories seeded");

  // ======================
  // PRODUCTS
  // ======================
  for (const productData of products) {
    const brand = await prisma.brand.findUnique({
      where: {
        name: productData.brand,
      },
    });

    const category = await prisma.category.findUnique({
      where: {
        name: productData.category,
      },
    });

    if (!brand || !category) {
      throw new Error(
        `Missing brand or category for product: ${productData.name}`
      );
    }

    const product = await prisma.product.upsert({
      where: {
        slug: productData.slug,
      },
      update: {
        name: productData.name,
        description: productData.description,
        brandId: brand.id,
        categoryId: category.id,
        isActive: productData.isActive ?? true,
      },
      create: {
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        brandId: brand.id,
        categoryId: category.id,
        isActive: productData.isActive ?? true,
      },
    });

    // Clear old images for this product before adding fresh demo images
    await prisma.productImage.deleteMany({
      where: {
        productId: product.id,
      },
    });

    await prisma.productImage.createMany({
      data: [
        {
          productId: product.id,
          url: imageUrl(productData.name, "Main"),
          alt: productData.name,
          type: "main",
        },
        {
          productId: product.id,
          url: imageUrl(productData.name, "Gallery 1"),
          alt: `${productData.name} gallery image 1`,
          type: "gallery",
        },
        {
          productId: product.id,
          url: imageUrl(productData.name, "Gallery 2"),
          alt: `${productData.name} gallery image 2`,
          type: "gallery",
        },
      ],
    });

    // Upsert variants
    for (const variant of productData.variants) {
      await prisma.productVariant.upsert({
        where: {
          sku: variant.sku,
        },
        update: {
          productId: product.id,
          title: variant.title,
          color: variant.color,
          price: variant.price,
          stock: variant.stock,
        },
        create: {
          productId: product.id,
          sku: variant.sku,
          title: variant.title,
          color: variant.color,
          price: variant.price,
          stock: variant.stock,
        },
      });
    }

    console.log(`✅ Seeded product: ${productData.name}`);
  }

  console.log("🎉 Seeding completed successfully");
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });