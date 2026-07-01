"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"

type Category = {
  id: string
  name: string
  slug?: string | null
  image?: string | null
  sortOrder: number
  productCount?: number
}

export default function CategoryCarouselClient({
  categories,
}: {
  categories: Category[]
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null)

  function scrollLeft() {
    scrollRef.current?.scrollBy({
      left: -360,
      behavior: "smooth",
    })
  }

  function scrollRight() {
    scrollRef.current?.scrollBy({
      left: 360,
      behavior: "smooth",
    })
  }

  return (
    <section className="bg-white py-12">
      <div className="container">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
              Shop Categories
            </div>

            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Shop by Category
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Browse phones, replacement parts, accessories, and repair essentials.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-medium text-primaryRed hover:underline"
          >
            View All Products
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={scrollLeft}
            aria-label="Scroll categories left"
            className="absolute -left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-white text-gray-700 shadow-md transition hover:border-primaryRed hover:text-primaryRed md:flex"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            type="button"
            onClick={scrollRight}
            aria-label="Scroll categories right"
            className="absolute -right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-white text-gray-700 shadow-md transition hover:border-primaryRed hover:text-primaryRed md:flex"
          >
            <ChevronRight size={22} />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scroll-smooth pt-4 pb-4 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group flex min-w-[105px] snap-start flex-col items-center gap-3 sm:min-w-[125px] md:min-w-[145px]"
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-gray-200 bg-white p-4 shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:border-primaryRed group-hover:shadow-md sm:h-28 sm:w-28 md:h-32 md:w-32">
                  {category.image ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 128px"
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <span className="line-clamp-2 text-center text-sm font-semibold text-gray-800">
                      {category.name}
                    </span>
                  )}
                </div>

                <div className="text-center">
                  <p className="max-w-[120px] truncate text-sm font-medium text-gray-700 transition group-hover:text-primaryRed">
                    {category.name}
                  </p>

                  {typeof category.productCount === "number" && (
                    <p className="mt-1 text-xs text-gray-400">
                      {category.productCount} products
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-4 flex justify-center gap-3 md:hidden">
            <button
              type="button"
              onClick={scrollLeft}
              aria-label="Scroll categories left"
              className="flex h-9 w-9 items-center justify-center rounded-full border bg-white text-gray-700 shadow-sm transition hover:border-primaryRed hover:text-primaryRed"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={scrollRight}
              aria-label="Scroll categories right"
              className="flex h-9 w-9 items-center justify-center rounded-full border bg-white text-gray-700 shadow-sm transition hover:border-primaryRed hover:text-primaryRed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}