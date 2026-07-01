"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { toast } from "react-toastify";

type HeroSlide = {
  id: string;

  title: string;
  subtitle?: string | null;
  description?: string | null;

  imageDesktop: string;
  imageDesktopPublicId?: string | null;

  imageMobile?: string | null;
  imageMobilePublicId?: string | null;

  buttonText: string;
  buttonLink: string;

  sortOrder: number;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
};

type Props = {
  slides: HeroSlide[];
  page: number;
  total: number;
  limit: number;
  search: string;
  statusFilter: string;
};

export default function HeroSlidesClient({
  slides,
  page,
  total,
  limit,
  search,
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

  async function deleteCloudinaryImage(publicId: string) {
    await fetch("/api/admin/delete-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publicId }),
    });
  }

  async function handleDelete(id: string) {
    const slideToDelete = slides.find((slide) => slide.id === id);

    const res = await fetch(`/api/admin/hero-slides/${id}`, {
      method: "DELETE",
    });

    const data = await res.json().catch(() => null);

    if (res.ok) {
      const publicIds = [
        slideToDelete?.imageDesktopPublicId,
        slideToDelete?.imageMobilePublicId,
      ].filter(Boolean) as string[];

      if (publicIds.length > 0) {
        await Promise.allSettled(
          publicIds.map((publicId) => deleteCloudinaryImage(publicId))
        );
      }

      toast.success(data?.message || "Hero slide deleted successfully");
      router.refresh();
    } else {
      toast.error(data?.message || "Failed to delete hero slide");
    }

    setDeleteId(null);
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Hero Slides
          </h1>

          <p className="text-sm text-gray-500">
            Total Slides:{" "}
            <span className="font-semibold">{total}</span>
          </p>
        </div>

        <Link
          href="/admin/hero-slides/new"
          className="rounded-lg bg-black px-5 py-2 text-white hover:bg-gray-800"
        >
          + Add Hero Slide
        </Link>
      </div>

      {/* FILTERS */}
      <div className="mb-6 rounded-lg border bg-white p-4">
        <div className="mb-3">
          <form
            onSubmit={handleSearchSubmit}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Search hero slides..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full rounded border p-2"
            />

            <button
              type="submit"
              className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
            >
              Search
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <select
            value={statusFilter}
            onChange={(e) =>
              updateQuery({
                status: e.target.value,
              })
            }
            className="rounded border p-2"
          >
            <option value="all">All Status</option>
            <option value="active">Active Slides</option>
            <option value="inactive">Inactive Slides</option>
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded border bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200"
          >
            Clear Filters
          </button>
        </div>

        {isPending && (
          <p className="mt-2 text-xs text-gray-400">
            Loading hero slides...
          </p>
        )}
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {slides.length === 0 && (
          <div className="rounded-xl border bg-white p-6 text-center text-gray-500">
            No hero slides found.
          </div>
        )}

        {slides.map((slide) => (
          <div
            key={slide.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4 transition hover:shadow-sm"
          >
            {/* LEFT */}
            <div className="flex flex-wrap items-center gap-4">
              <img
                src={slide.imageDesktop}
                alt={slide.title}
                className="h-14 w-24 rounded-lg border object-cover"
              />

              <div>
                <h2 className="font-semibold text-gray-900">
                  {slide.title}
                </h2>

                <p className="mt-0.5 max-w-xl text-sm text-gray-500 line-clamp-1">
                  {slide.subtitle || "No subtitle"}
                </p>

                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span
                    className={`rounded px-2 py-0.5 ${
                      slide.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {slide.isActive ? "Active" : "Inactive"}
                  </span>

                  <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700">
                    Sort: {slide.sortOrder}
                  </span>

                  <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700">
                    {slide.imageMobile ? "Mobile image" : "No mobile image"}
                  </span>
                </div>
              </div>
            </div>

            {/* MIDDLE */}
            <div className="text-sm text-gray-600">
              <div className="font-semibold text-gray-900">
                {slide.buttonText}
              </div>

              <a
                href={slide.buttonLink}
                target={
                  slide.buttonLink.startsWith("http") ? "_blank" : undefined
                }
                className="text-xs text-blue-600 hover:underline"
              >
                {slide.buttonLink}
              </a>
            </div>

            {/* RIGHT */}
            <div className="text-right text-sm">
              <div className="font-semibold">
                Updated
              </div>

              <div className="text-xs text-gray-400">
                {formatDate(slide.updatedAt)}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="ml-0 flex gap-2 md:ml-6">
              <Link
                href={`/admin/hero-slides/edit/${slide.id}`}
                className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-500"
              >
                Edit
              </Link>

              <button
                onClick={() => setDeleteId(slide.id)}
                className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => changePage(i + 1)}
              className={`rounded border px-3 py-1 text-sm ${
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="w-[340px] rounded-xl bg-white p-6">
            <h2 className="mb-2 text-lg font-bold">
              Delete Hero Slide?
            </h2>

            <p className="mb-4 text-sm text-gray-500">
              This will remove the slide from the homepage slider. The related
              Cloudinary images will also be deleted when possible.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded bg-gray-200 px-3 py-1"
              >
                Cancel
              </button>

              <button
                onClick={() => handleDelete(deleteId)}
                className="rounded bg-red-600 px-3 py-1 text-white"
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