import ShopClient from "@/components/shop/ShopClient";
import {
  getShopFilterData,
  getShopProducts,
} from "@/lib/services/shopService";
import { FilterState, SortOption } from "@/lib/types/shop";

export const dynamic = "force-static";
export const revalidate = 3600;

export default async function ShopPage() {
  const filterData = await getShopFilterData();

  const query = "";

  const filters: FilterState = {
    brands: [],
    categories: [],
    priceRange: filterData.priceBounds,
    onSale: false,
  };

  const sort: SortOption = "featured";
  const page = 1;

  const { products, pagination } = await getShopProducts({
    query,
    filters,
    sort,
    page,
    pageSize: 12,
  });

  return (
    <div className="bg-gray-50">
      <div className="container py-8 sm:py-10">
        <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primaryRed">
            Product Collection
          </p>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                Shop All Products
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
                Browse our complete collection of quality products, compare
                options, filter by brand or category, and find the right item
                for your needs.
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 px-5 py-4 text-sm text-gray-600">
              <span className="font-semibold text-gray-950">
                Fast browsing
              </span>
              <span className="block text-xs text-gray-500">
                Product details load when needed
              </span>
            </div>
          </div>
        </div>

        <ShopClient
          query={query}
          products={products}
          pagination={pagination}
          availableBrands={filterData.brands}
          availableCategories={filterData.categories}
          priceBounds={filterData.priceBounds}
          initialFilters={filters}
          initialSort={sort}
        />
      </div>
    </div>
  );
}