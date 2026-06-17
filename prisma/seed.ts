import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding 20+ products...")

  // ======================
  // 🏷 BRANDS
  // ======================
  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { name: "Apple" },
      update: {},
      create: { name: "Apple", logo: "/brands/apple.png" },
    }),
    prisma.brand.upsert({
      where: { name: "Samsung" },
      update: {},
      create: { name: "Samsung", logo: "/brands/samsung.png" },
    }),
    prisma.brand.upsert({
      where: { name: "Xiaomi" },
      update: {},
      create: { name: "Xiaomi", logo: "/brands/xiaomi.png" },
    }),
  ])

  const [apple, samsung, xiaomi] = brands

  // ======================
  // 📂 CATEGORY
  // ======================
  const category = await prisma.category.upsert({
    where: { name: "Smartphones" },
    update: {},
    create: { name: "Smartphones" },
  })

  // ======================
  // 📱 PRODUCT DATA (20+ PHONES)
  // ======================
  const products = [
    { name: "iPhone 15 Pro", brand: apple, price: 999 },
    { name: "iPhone 15 Pro Max", brand: apple, price: 1199 },
    { name: "iPhone 15", brand: apple, price: 799 },
    { name: "iPhone 14 Pro", brand: apple, price: 899 },
    { name: "iPhone 14", brand: apple, price: 699 },

    { name: "Galaxy S24 Ultra", brand: samsung, price: 1299 },
    { name: "Galaxy S24+", brand: samsung, price: 1099 },
    { name: "Galaxy S24", brand: samsung, price: 899 },
    { name: "Galaxy S23 Ultra", brand: samsung, price: 999 },
    { name: "Galaxy Z Fold 5", brand: samsung, price: 1799 },

    { name: "Xiaomi 14", brand: xiaomi, price: 699 },
    { name: "Xiaomi 13 Pro", brand: xiaomi, price: 799 },
    { name: "Xiaomi 13", brand: xiaomi, price: 649 },
    { name: "Redmi Note 13 Pro", brand: xiaomi, price: 399 },
    { name: "Redmi Note 12", brand: xiaomi, price: 299 },

    { name: "OnePlus 12", brand: xiaomi, price: 799 },
    { name: "OnePlus 11", brand: xiaomi, price: 699 },
    { name: "Pixel 8 Pro", brand: samsung, price: 999 },
    { name: "Pixel 8", brand: samsung, price: 799 },
    { name: "Nothing Phone 2", brand: xiaomi, price: 599 },
  ]

  // ======================
  // 🔥 CREATE PRODUCTS
  // ======================
  for (const p of products) {
    const slug = p.name.toLowerCase().replace(/\s+/g, "-")

    await prisma.product.create({
      data: {
        name: p.name,
        slug,
        description: `${p.name} premium smartphone`,

        brandId: p.brand.id,
        categoryId: category.id,

        images: {
          create: [
            {
              url: `/products/${slug}-1.png`,
            },
          ],
        },

        variants: {
          create: [
            {
              sku: `${slug}-128`,
              storage: "128GB",
              color: "Black",
              price: p.price,
              stock: 10,
            },
            {
              sku: `${slug}-256`,
              storage: "256GB",
              color: "Black",
              price: p.price + 100,
              stock: 8,
            },
          ],
        },
      },
    })
  }

  console.log("✅ 20+ products seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })