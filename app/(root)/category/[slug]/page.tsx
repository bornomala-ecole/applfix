import Image from "next/image"
import { notFound } from "next/navigation"

import { prisma } from "@/lib/prisma"
import ShopClient from "@/components/shop/ShopClient"

import {
  getShopFilterData,
  getShopProducts,
  parseShopFilters,
  parseShopPage,
  parseShopQuery,
  parseShopSort,
  ShopSearchParams,
} from "@/lib/services/shopService"

export const dynamic = "force-dynamic"

type CategoryPageProps = {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<ShopSearchParams>
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams

  const category = await prisma.category.findFirst({
    where: {
      OR: [
        { slug },
        { id: slug },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
    },
  })

  if (!category) {
    notFound()
  }

  const filterData = await getShopFilterData()

  const query = parseShopQuery(resolvedSearchParams)

  const parsedFilters = parseShopFilters(
    resolvedSearchParams,
    filterData.priceBounds
  )

  const filters = {
    ...parsedFilters,
    brands: [],
    categories: [category.name],
  }

  const sort = parseShopSort(resolvedSearchParams.sort)
  const page = parseShopPage(resolvedSearchParams.page)

  const { products, pagination } = await getShopProducts({
    query,
    filters,
    sort,
    page,
    pageSize: 12,
  })

  return (
    <div className="bg-gray-50">
      <div className="container py-8 sm:py-10">
        {/* CATEGORY HERO */}
        <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primaryRed">
            Category Collection
          </p>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white p-4 shadow-sm">
                {category.image ? (
                  <div className="relative h-full w-full">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="96px"
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <span className="line-clamp-2 text-center text-sm font-bold text-gray-900">
                    {category.name}
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                  {category.name}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
                  Browse all available products in {category.name}. Compare
                  prices, sort products, and find the right item for your needs.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PRODUCT LIST */}
        <ShopClient
          query={query}
          products={products}
          pagination={pagination}
          availableBrands={[]}
          availableCategories={[]}
          priceBounds={filterData.priceBounds}
          initialFilters={filters}
          initialSort={sort}
          showBrandFilter={false}
          showCategoryFilter={false}
          lockedFilters={{
            brands: [],
            categories: [category.name],
          }}
        />
      </div>
    </div>
  )
}