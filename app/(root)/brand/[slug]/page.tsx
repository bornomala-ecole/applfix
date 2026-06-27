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

type BrandPageProps = {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<ShopSearchParams>
}

export default async function BrandPage({
  params,
  searchParams,
}: BrandPageProps) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams

  const brand = await prisma.brand.findFirst({
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
      logo: true,
    },
  })

  if (!brand) {
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
    brands: [brand.name],
    categories: [],
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
        {/* BRAND HERO */}
        <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primaryRed">
            Brand Collection
          </p>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white p-4 shadow-sm">
                {brand.logo ? (
                  <div className="relative h-full w-full">
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      fill
                      sizes="96px"
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <span className="line-clamp-2 text-center text-sm font-bold text-gray-900">
                    {brand.name}
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                  {brand.name} Products
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
                  Browse all available products from {brand.name}. Compare
                  prices, filter by category, sort products, and find the right
                  item for your needs.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-gray-50 px-5 py-4 text-sm text-gray-600">
              <span className="font-semibold text-gray-950">
                {pagination.totalProducts}
              </span>{" "}
              products found
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
        />
      </div>
    </div>
  )
}