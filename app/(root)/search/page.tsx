import ShopClient from "@/components/shop/ShopClient";
import {
  getShopFilterData,
  getShopProducts,
  parseShopFilters,
  parseShopPage,
  parseShopQuery,
  parseShopSort,
  ShopSearchParams,
} from "@/lib/services/shopService";
import { FilterState } from "@/lib/types/shop";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: Promise<ShopSearchParams>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;

  const filterData = await getShopFilterData();

  const query = parseShopQuery(resolvedSearchParams);

  const filters: FilterState = parseShopFilters(
    resolvedSearchParams,
    filterData.priceBounds
  );

  const sort = parseShopSort(resolvedSearchParams.sort);
  const page = parseShopPage(resolvedSearchParams.page);

  const { products, pagination } = await getShopProducts({
    query,
    filters,
    sort,
    page,
    pageSize: 12,
  });

  const title = query ? `Search results for "${query}"` : "Search products";

  return (
    <div className="bg-gray-50">
      <div className="container py-8 sm:py-10">
        <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primaryRed">
            Search
          </p>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                {title}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
                Search products, then refine results by brand, category, price,
                sale status, and sorting.
              </p>
            </div>

            {/* <div className="rounded-2xl bg-gray-50 px-5 py-4 text-sm text-gray-600">
              <span className="font-semibold text-gray-950">
                Optimized search
              </span>
              <span className="block text-xs text-gray-500">
                Results use productSearchText
              </span>
            </div> */}


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