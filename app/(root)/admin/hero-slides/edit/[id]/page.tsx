"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { uploadImage } from "@/lib/cloudinary/uploadImage";

type UploadedImage = {
  url: string;
  publicId: string | null;
};

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

export default function EditHeroSlidePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [originalSlide, setOriginalSlide] = useState<HeroSlide | null>(null);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");

  const [buttonText, setButtonText] = useState("Shop Now");
  const [buttonLink, setButtonLink] = useState("/shop");

  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

  const [desktopImage, setDesktopImage] = useState<UploadedImage | null>(null);
  const [mobileImage, setMobileImage] = useState<UploadedImage | null>(null);

  useEffect(() => {
    async function loadSlide() {
      try {
        const res = await fetch(`/api/admin/hero-slides/${id}`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data?.message || "Failed to load hero slide");
          router.push("/admin/hero-slides");
          return;
        }

        const slide = data.slide as HeroSlide;

        setOriginalSlide(slide);

        setTitle(slide.title || "");
        setSubtitle(slide.subtitle || "");
        setDescription(slide.description || "");

        setButtonText(slide.buttonText || "Shop Now");
        setButtonLink(slide.buttonLink || "/shop");

        setSortOrder(String(slide.sortOrder ?? 0));
        setIsActive(Boolean(slide.isActive));

        setDesktopImage({
          url: slide.imageDesktop,
          publicId: slide.imageDesktopPublicId || null,
        });

        setMobileImage(
          slide.imageMobile
            ? {
                url: slide.imageMobile,
                publicId: slide.imageMobilePublicId || null,
              }
            : null
        );
      } catch {
        toast.error("Failed to load hero slide");
        router.push("/admin/hero-slides");
      } finally {
        setPageLoading(false);
      }
    }

    if (id) {
      loadSlide();
    }
  }, [id, router]);

  async function deleteCloudinaryImage(publicId: string) {
    await fetch("/api/admin/delete-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publicId }),
    });
  }

  async function handleDesktopUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploaded = await uploadImage(file);

      // If replacing a newly uploaded unsaved image, delete that unsaved image.
      if (
        desktopImage?.publicId &&
        desktopImage.publicId !== originalSlide?.imageDesktopPublicId
      ) {
        await deleteCloudinaryImage(desktopImage.publicId);
      }

      setDesktopImage({
        url: uploaded.url,
        publicId: uploaded.publicId,
      });

      toast.success("Desktop image uploaded");
    } catch {
      toast.error("Desktop image upload failed");
    }
  }

  async function handleMobileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploaded = await uploadImage(file);

      // If replacing a newly uploaded unsaved image, delete that unsaved image.
      if (
        mobileImage?.publicId &&
        mobileImage.publicId !== originalSlide?.imageMobilePublicId
      ) {
        await deleteCloudinaryImage(mobileImage.publicId);
      }

      setMobileImage({
        url: uploaded.url,
        publicId: uploaded.publicId,
      });

      toast.success("Mobile image uploaded");
    } catch {
      toast.error("Mobile image upload failed");
    }
  }

  async function removeDesktopImage() {
    if (!desktopImage) return;

    // Desktop image is required, so only remove unsaved replacement images.
    if (
      desktopImage.publicId &&
      desktopImage.publicId !== originalSlide?.imageDesktopPublicId
    ) {
      try {
        await deleteCloudinaryImage(desktopImage.publicId);
      } catch {
        toast.error("Failed to delete unsaved image");
      }
    }

    setDesktopImage(null);
  }

  async function removeMobileImage() {
    if (!mobileImage) return;

    // Existing DB image is deleted only after successful save.
    // Unsaved replacement image can be deleted immediately.
    if (
      mobileImage.publicId &&
      mobileImage.publicId !== originalSlide?.imageMobilePublicId
    ) {
      try {
        await deleteCloudinaryImage(mobileImage.publicId);
      } catch {
        toast.error("Failed to delete unsaved image");
      }
    }

    setMobileImage(null);
  }

  async function cleanupReplacedImages() {
    if (!originalSlide) return;
  
    const cleanupPublicIds: string[] = [];
  
    const originalDesktopPublicId = originalSlide.imageDesktopPublicId;
    const currentDesktopPublicId = desktopImage?.publicId;
  
    if (
      typeof originalDesktopPublicId === "string" &&
      originalDesktopPublicId.length > 0 &&
      typeof currentDesktopPublicId === "string" &&
      currentDesktopPublicId.length > 0 &&
      currentDesktopPublicId !== originalDesktopPublicId
    ) {
      cleanupPublicIds.push(originalDesktopPublicId);
    }
  
    const originalMobilePublicId = originalSlide.imageMobilePublicId;
    const currentMobilePublicId = mobileImage?.publicId;
  
    if (
      typeof originalMobilePublicId === "string" &&
      originalMobilePublicId.length > 0 &&
      originalMobilePublicId !== currentMobilePublicId
    ) {
      cleanupPublicIds.push(originalMobilePublicId);
    }
  
    if (cleanupPublicIds.length > 0) {
      await Promise.allSettled(
        cleanupPublicIds.map((publicId) => deleteCloudinaryImage(publicId))
      );
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!desktopImage?.url) {
      toast.error("Desktop image is required");
      return;
    }

    const numericSortOrder = Number(sortOrder);

    if (!Number.isFinite(numericSortOrder)) {
      toast.error("Sort order must be a valid number");
      return;
    }

    setSaving(true);

    const payload = {
      title,
      subtitle,
      description,

      imageDesktop: desktopImage.url,
      imageDesktopPublicId: desktopImage.publicId,

      imageMobile: mobileImage?.url || null,
      imageMobilePublicId: mobileImage?.publicId || null,

      buttonText,
      buttonLink,
      sortOrder: numericSortOrder,
      isActive,
    };

    const res = await fetch(`/api/admin/hero-slides/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    const data = await res.json().catch(() => null);

    if (res.ok) {
      await cleanupReplacedImages();

      toast.success(data?.message || "Hero slide updated successfully");
      router.push("/admin/hero-slides");
      router.refresh();
    } else {
      toast.error(data?.message || "Failed to update hero slide");
    }
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-5xl rounded-xl border bg-white p-6 text-gray-500">
          Loading hero slide...
        </div>
      </div>
    );
  }

  if (!originalSlide) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-5xl rounded-xl border bg-white p-6 text-gray-500">
          Hero slide not found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Hero Slide
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Update homepage slider text, images, button, sort order, and
              status.
            </p>
          </div>

          <Link
            href="/admin/hero-slides"
            className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Back to Slides
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              Slide Content
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Title
                </label>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="New Year Collection"
                  className="w-full rounded border p-2"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Subtitle
                </label>

                <input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Trending products for 2026"
                  className="w-full rounded border p-2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short hero slide description"
                  className="min-h-[100px] w-full rounded border p-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Button Text
                </label>

                <input
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="Shop Now"
                  className="w-full rounded border p-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Button Link
                </label>

                <input
                  value={buttonLink}
                  onChange={(e) => setButtonLink(e.target.value)}
                  placeholder="/shop"
                  className="w-full rounded border p-2"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              Slide Images
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Desktop Image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleDesktopUpload}
                />

                <p className="mt-1 text-xs text-gray-500">
                  Required. Recommended wide banner image.
                </p>

                {desktopImage ? (
                  <div className="mt-4 rounded-xl border p-4">
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                      <img
                        src={desktopImage.url}
                        alt={title || "Desktop hero slide"}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={removeDesktopImage}
                      className="mt-3 rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                    >
                      Remove Desktop Image
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border bg-gray-50 p-4 text-sm text-gray-500">
                    No desktop image selected.
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Mobile Image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMobileUpload}
                />

                <p className="mt-1 text-xs text-gray-500">
                  Optional. If empty, desktop image can be reused on frontend.
                </p>

                {mobileImage ? (
                  <div className="mt-4 rounded-xl border p-4">
                    <div className="relative aspect-[9/12] w-full max-w-xs overflow-hidden rounded-lg border">
                      <img
                        src={mobileImage.url}
                        alt={title || "Mobile hero slide"}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={removeMobileImage}
                      className="mt-3 rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                    >
                      Remove Mobile Image
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border bg-gray-50 p-4 text-sm text-gray-500">
                    No mobile image selected.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              Publishing
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Sort Order
                </label>

                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full rounded border p-2"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Lower numbers appear first.
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />

                <div>
                  <p className="font-medium text-gray-900">Active Slide</p>
                  <p className="text-xs text-gray-500">
                    Active slides appear on homepage.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <button
            disabled={saving}
            className="w-full rounded-lg bg-black p-3 text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}