"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";

type MenuProduct = {
  id: string;
  name: string;
  slug: string;
};

type MenuSeries = {
  id: string;
  name: string;
  products: MenuProduct[];
};

type MenuBrand = {
  id: string;
  name: string;
  logo: string | null;
  series: MenuSeries[];
  products: MenuProduct[];
};

type Props = {
  brands: MenuBrand[];
};

export default function BrandSeriesMenuClient({ brands }: Props) {
  const [activeBrandId, setActiveBrandId] = useState(brands[0]?.id || "");

  const activeBrand = useMemo(() => {
    return brands.find((brand) => brand.id === activeBrandId) || brands[0];
  }, [activeBrandId, brands]);

  const groups = useMemo(() => {
    if (!activeBrand) return [];

    const seriesGroups = activeBrand.series.map((series) => ({
      id: series.id,
      name: series.name,
      products: series.products,
    }));

    if (activeBrand.products.length > 0) {
      seriesGroups.push({
        id: "other-models",
        name: "Other Models",
        products: activeBrand.products,
      });
    }

    return seriesGroups;
  }, [activeBrand]);

  if (!activeBrand) {
    return null;
  }

  return (
    <section className="relative bg-[#09c9c0]">
      <div className="container">
        {/* BRAND TABS */}
        <div className="flex items-center gap-2 overflow-x-auto py-3">
          {brands.map((brand) => {
            const isActive = brand.id === activeBrand.id;

            return (
              <button
                key={brand.id}
                type="button"
                onClick={() => setActiveBrandId(brand.id)}
                className={`shrink-0 rounded-lg px-5 py-2 text-sm font-semibold uppercase tracking-wide transition ${
                  isActive
                    ? "bg-white text-[#09bdb5] shadow-sm"
                    : "text-black hover:bg-white/30"
                }`}
              >
                {brand.name}
              </button>
            );
          })}
        </div>

        {/* MEGA MENU BODY */}
        <div className="rounded-t-3xl bg-white p-5 shadow-xl md:p-7">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {activeBrand.name} Models
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Browse {activeBrand.name} products by series.
              </p>
            </div>

            <Link
              href={`/shop?brand=${encodeURIComponent(activeBrand.name)}`}
              className="hidden items-center gap-1 text-sm font-semibold text-[#09bdb5] hover:underline sm:inline-flex"
            >
              View All
              <ChevronRight size={16} />
            </Link>
          </div>

          {groups.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="border-r border-gray-100 last:border-r-0"
                >
                  <div className="mb-4 inline-flex rounded-full bg-gray-100 px-4 py-2 text-sm font-bold uppercase tracking-wide text-gray-900">
                    {group.name}
                  </div>

                  <div className="max-h-[380px] space-y-1 overflow-y-auto pr-3">
                    {group.products.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        className="block rounded-lg px-3 py-2 text-sm font-semibold uppercase tracking-wide text-gray-500 transition hover:bg-gray-50 hover:text-[#09bdb5]"
                      >
                        {product.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed p-8 text-center">
              <p className="text-sm text-gray-500">
                No active products found for this brand.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}