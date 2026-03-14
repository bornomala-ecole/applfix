import { DetailedProduct } from "@/lib/types/shop";

export const productDetailData: { [key: string]: DetailedProduct } = {
  "iphone-15-pro": {
    id: 2,
    name: "iPhone 15 Pro",
    brand: "Apple",
    slug: "iphone-15-pro",
    price: 999, // Base price for the default variant
    originalPrice: undefined,
    image: "/images/products/iphone-15-pro.png", // Main thumbnail
    images: [
      "/images/products/iphone-15-pro-1.png",
      "/images/products/iphone-15-pro-2.png",
      "/images/products/iphone-15-pro-3.png",
      "/images/products/iphone-15-pro-4.png",
    ],
    rating: 4.9,
    reviews: 450,
    description: "The iPhone 15 Pro features a stunning titanium design, A17 Pro chip with GPU, and a customizable Action button. A powerful new Pro camera system, 5x telephoto, and next-generation portraits make it the best iPhone yet.",
    specifications: [
      { label: "Display", value: "6.1-inch Super Retina XDR display" },
      { label: "Chip", value: "A17 Pro chip" },
      { label: "Camera", value: "Pro system: 48MP Main, 12MP Ultra Wide, 12MP Telephoto" },
      { label: "Battery Life", value: "Up to 23 hours video playback" },
      { label: "Storage", value: "128GB, 256GB, 512GB, 1TB" },
      { label: "Material", value: "Titanium" },
    ],
    variants: {
      color: [
        { name: "Natural Titanium", hex: "#E7E0D7" },
        { name: "Blue Titanium", hex: "#5B7C99" },
        { name: "White Titanium", hex: "#F4F4F4" },
        { name: "Black Titanium", hex: "#3C3C3C" },
      ],
      storage: [
        { size: "128GB", price: 999 },
        { size: "256GB", price: 1099 },
        { size: "512GB", price: 1299 },
        { size: "1TB", price: 1499 },
      ],
    },
  },
  // You would add more products here
};