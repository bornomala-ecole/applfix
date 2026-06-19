"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { toast } from "react-toastify";

type Brand = {
  id: string;
  name: string;
  logo?: string | null;
};

type Category = {
  id: string;
  name: string;
};

type ProductImage = {
  id: string;
  url: string;
  publicId?: string | null;
  alt?: string | null;
  type: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
};

type ProductVariant = {
  id: string;
  productId: string;
  sku: string;
  title: string;
  color?: string | null;
  price: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  brandId?: string | null;
  categoryId?: string | null;
  isActive: boolean;
  brand?: Brand | null;
  category?: Category | null;
  images: ProductImage[];
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
};

type Props = {
  products: Product[];
  brands: Brand[];
  categories: Category[];
  page: number;
  total: number;
  limit: number;
  search: string;
  brandFilter: string;
  categoryFilter: string;
  statusFilter: string;
};

export default function ProductsClient({
  products,
  brands,
  categories,
  page,
  total,
  limit,
  search,
  brandFilter,
  categoryFilter,
  statusFilter,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(search);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.ceil(total / limit);

  function updateQuery(paramsToUpdate: {
    search?: string;
    brand?: string;
    category?: string;
    status?: string;
    page?: number;
  }) {
    const params = new URLSearchParams(searchParams.toString());

    if (paramsToUpdate.search !== undefined) {
      if (paramsToUpdate.search.trim()) {
        params.set("search", paramsToUpdate.search.trim());
      } else {
        params.delete("search");
      }

      params.set("page", "1");
    }

    if (paramsToUpdate.brand !== undefined) {
      if (paramsToUpdate.brand === "all") {
        params.delete("brand");
      } else {
        params.set("brand", paramsToUpdate.brand);
      }

      params.set("page", "1");
    }

    if (paramsToUpdate.category !== undefined) {
      if (paramsToUpdate.category === "all") {
        params.delete("category");
      } else {
        params.set("category", paramsToUpdate.category);
      }

      params.set("page", "1");
    }

    if (paramsToUpdate.status !== undefined) {
      if (paramsToUpdate.status === "all") {
        params.delete("status");
      } else {
        params.set("status", paramsToUpdate.status);
      }

      params.set("page", "1");
    }

    if (paramsToUpdate.page !== undefined) {
      params.set("page", String(paramsToUpdate.page));
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function clearFilters() {
    setSearchValue("");
  
    startTransition(() => {
      router.push(pathname);
    });
  }

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    updateQuery({
      search: searchValue,
    });
  }

  function changePage(newPage: number) {
    updateQuery({
      page: newPage,
    });
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      toast.success("Product deleted");
      router.refresh();
    } else {
      toast.error("Failed to delete product");
    }

    setDeleteId(null);
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Products
          </h1>

          <p className="text-sm text-gray-500">
            Total Products:{" "}
            <span className="font-semibold">{total}</span>
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800"
        >
          + Add Product
        </Link>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-lg border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <form
            onSubmit={handleSearchSubmit}
            className="md:col-span-1 flex gap-2"
          >
            <input
              type="text"
              placeholder="Search products..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="border p-2 rounded w-full"
            />

            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              Search
            </button>
          </form>

          <select
            value={brandFilter}
            onChange={(e) =>
              updateQuery({
                brand: e.target.value,
              })
            }
            className="border p-2 rounded"
          >
            <option value="all">All Brands</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) =>
              updateQuery({
                category: e.target.value,
              })
            }
            className="border p-2 rounded"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              updateQuery({
                status: e.target.value,
              })
            }
            className="border p-2 rounded"
          >
            <option value="all">All Status</option>
            <option value="active">Active Products</option>
            <option value="inactive">Inactive Products</option>
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="border px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm font-medium"
          >
            Clear Filters
          </button>
        </div>

        {isPending && (
          <p className="text-xs text-gray-400 mt-2">
            Loading products...
          </p>
        )}
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {products.length === 0 && (
          <div className="bg-white border rounded-xl p-6 text-center text-gray-500">
            No products found.
          </div>
        )}

        {products.map((product) => {
          const variants = product.variants || [];

          const totalStock = variants.reduce(
            (sum, variant) => sum + (variant.stock || 0),
            0
          );

          const minPrice = variants.length
            ? Math.min(...variants.map((variant) => variant.price))
            : 0;

          const isVariable = variants.length > 0;

          const mainImage = product.images?.find(
            (image) => image.type === "main"
          );

          return (
            <div
              key={product.id}
              className="bg-white border rounded-xl p-4 flex flex-wrap gap-2 md:gap-0 items-center justify-between hover:shadow-sm transition"
            >
              {/* LEFT */}
              <div className="flex items-center gap-4 flex-wrap">
                {mainImage ? (
                  <img
                    src={mainImage.url}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover border"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">
                    No Image
                  </div>
                )}

                <div className="flex flex-wrap">
                  <h2 className="font-semibold text-gray-900">
                    {product.name}
                  </h2>

                  <div className="flex gap-2 mt-1 flex-wrap text-xs">
                    <span className="px-2 py-0.5 bg-gray-100 rounded">
                      {product.brand?.name || "No Brand"}
                    </span>

                    <span className="px-2 py-0.5 bg-gray-100 rounded">
                      {product.category?.name || "No Category"}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded ${
                        isVariable
                          ? "bg-blue-100 text-blue-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {isVariable ? "Variable" : "Simple"}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded ${
                        product.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {/* MIDDLE */}
              <div className="text-sm text-gray-600 text-center">
                {isVariable ? (
                  <>
                    <div className="font-semibold text-gray-900">
                      ${minPrice}+
                    </div>

                    <div className="text-xs text-gray-400">
                      {variants.length} variants
                    </div>
                  </>
                ) : (
                  <div className="font-semibold text-gray-900">
                    Single Product
                  </div>
                )}
              </div>

              {/* RIGHT */}
              <div className="text-right text-sm">
                <div className="font-semibold">
                  Stock: {totalStock}
                </div>

                <div className="text-xs text-gray-400">
                  Updated recently
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2 ml-6">
                <Link
                  href={`/admin/products/${product.id}`}
                  className="px-3 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700"
                >
                  View
                </Link>

                <Link
                  href={`/admin/products/edit/${product.id}`}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-500"
                >
                  Edit
                </Link>

                <button
                  onClick={() => setDeleteId(product.id)}
                  className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex gap-2 mt-8 justify-center flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => changePage(i + 1)}
              className={`px-3 py-1 rounded border text-sm ${
                page === i + 1
                  ? "bg-black text-white"
                  : "bg-white"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[320px]">
            <h2 className="text-lg font-bold mb-2">
              Delete Product?
            </h2>

            <p className="text-sm text-gray-500 mb-4">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                Cancel
              </button>

              <button
                onClick={() => handleDelete(deleteId)}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}