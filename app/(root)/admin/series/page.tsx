import { prisma } from "@/lib/prisma";
import {
  createSeriesAction,
  deleteSeriesAction,
  updateSeriesAction,
} from "./actions";

export default async function AdminSeriesPage() {
  const [brands, series] = await Promise.all([
    prisma.brand.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    }),

    prisma.series.findMany({
      orderBy: [
        {
          brand: {
            name: "asc",
          },
        },
        {
          sortOrder: "asc",
        },
        {
          name: "asc",
        },
      ],
      include: {
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Product Series</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add, edit, and remove product series under each brand.
        </p>
      </div>

      {/* ADD SERIES FORM */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-gray-900">
          Add New Series
        </h2>

        <form action={createSeriesAction} className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Brand
            </label>

            <select
              name="brandId"
              required
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-black"
            >
              <option value="">Select Brand</option>

              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Series Name
            </label>

            <input
              name="name"
              type="text"
              required
              placeholder="Example: Redmi Note"
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Sort Order
            </label>

            <input
              name="sortOrder"
              type="number"
              defaultValue={0}
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>

          <div className="md:col-span-4">
            <button
              type="submit"
              className="rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Add Series
            </button>
          </div>
        </form>
      </div>

      {/* SERIES LIST */}
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Existing Series
          </h2>
        </div>

        {series.length > 0 ? (
          <div className="divide-y">
            {series.map((item) => (
              <form
                key={item.id}
                action={updateSeriesAction}
                className="grid gap-4 px-6 py-4 md:grid-cols-12 md:items-end"
              >
                <input type="hidden" name="id" value={item.id} />

                <div className="md:col-span-3">
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    Brand
                  </label>

                  <select
                    name="brandId"
                    defaultValue={item.brandId}
                    required
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-black"
                  >
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-4">
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    Series Name
                  </label>

                  <input
                    name="name"
                    type="text"
                    defaultValue={item.name}
                    required
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-black"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    Sort Order
                  </label>

                  <input
                    name="sortOrder"
                    type="number"
                    defaultValue={item.sortOrder}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-black"
                  />
                </div>

                <div className="md:col-span-1">
                  <p className="text-xs font-medium text-gray-500">Products</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {item._count.products}
                  </p>
                </div>

                <div className="flex gap-2 md:col-span-2">
                  <button
                    type="submit"
                    className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-black"
                  >
                    Save
                  </button>

                  <button
                    formAction={deleteSeriesAction}
                    className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </form>
            ))}
          </div>
        ) : (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-gray-500">No series found.</p>
          </div>
        )}
      </div>
    </div>
  );
}