import { Product } from "@/lib/types/shop";

export const allProducts: Product[] = [
  // iPhones
  { id: 1, name: "iPhone 15 Pro Max", brand: "Apple", slug: "iphone-15-pro-max", price: 1199, image: "/images/products/iphone-15-pro-max.png", rating: 4.8, reviews: 325, badge: "New" },
  { id: 2, name: "iPhone 15 Pro", brand: "Apple", slug: "iphone-15-pro", price: 999, image: "/images/products/iphone-15-pro.png", rating: 4.9, reviews: 450 },
  { id: 3, name: "iPhone 15", brand: "Apple", slug: "iphone-15", price: 799, image: "/images/products/iphone-15.png", rating: 4.7, reviews: 210 },
  { id: 4, name: "iPhone 14", brand: "Apple", slug: "iphone-14", price: 699, originalPrice: 799, image: "/images/products/iphone-14.png", rating: 4.6, reviews: 580, badge: "Sale" },
  // Samsung
  { id: 5, name: "Galaxy S24 Ultra", brand: "Samsung", slug: "galaxy-s24-ultra", price: 1199, image: "/images/products/galaxy-s24-ultra.png", rating: 4.7, reviews: 190 },
  { id: 6, name: "Galaxy S24", brand: "Samsung", slug: "galaxy-s24", price: 799, image: "/images/products/galaxy-s24.png", rating: 4.5, reviews: 150 },
  { id: 7, name: "Galaxy Z Fold 5", brand: "Samsung", slug: "galaxy-z-fold5", price: 1799, originalPrice: 1999, image: "/images/products/galaxy-z-fold5.png", rating: 4.4, reviews: 95, badge: "Sale" },
  { id: 8, name: "Galaxy A54", brand: "Samsung", slug: "galaxy-a54", price: 449, image: "/images/products/galaxy-a54.png", rating: 4.3, reviews: 310 },
  // Google
  { id: 9, name: "Pixel 8 Pro", brand: "Google", slug: "pixel-8-pro", price: 999, originalPrice: 1099, image: "/images/products/pixel-8-pro.png", rating: 4.6, reviews: 120, badge: "Sale" },
  { id: 10, name: "Pixel 8", brand: "Google", slug: "pixel-8", price: 699, image: "/images/products/pixel-8.png", rating: 4.5, reviews: 88 },
  { id: 11, name: "Pixel 7a", brand: "Google", slug: "pixel-7a", price: 499, image: "/images/products/pixel-7a.png", rating: 4.4, reviews: 205 },
  // OnePlus
  { id: 12, name: "OnePlus 12", brand: "OnePlus", slug: "oneplus-12", price: 799, image: "/images/products/oneplus-12.png", rating: 4.7, reviews: 189 },
  { id: 13, name: "OnePlus Open", brand: "OnePlus", slug: "oneplus-open", price: 1699, image: "/images/products/oneplus-open.png", rating: 4.5, reviews: 45 },
  // Xiaomi
  { id: 14, name: "Xiaomi 14 Pro", brand: "Xiaomi", slug: "xiaomi-14-pro", price: 899, image: "/images/products/xiaomi-14-pro.png", rating: 4.5, reviews: 78, badge: "New" },
  { id: 15, name: "Xiaomi 13T Pro", brand: "Xiaomi", slug: "xiaomi-13t-pro", price: 699, image: "/images/products/xiaomi-13t-pro.png", rating: 4.3, reviews: 110 },
];