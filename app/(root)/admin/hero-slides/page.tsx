import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import HeroSlidesClient from "./hero-slides-client";

type Props = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
};

export default async function HeroSlidesPage({ searchParams }: Props) {
  const {
    page: pageParam,
    search: searchParam,
    status: statusParam,
  } = await searchParams;

  const page = Math.max(Number(pageParam || 1), 1);
  const limit = 20;
  const skip = (page - 1) * limit;

  const search = searchParam?.trim() || "";

  const status =
    statusParam === "active" || statusParam === "inactive"
      ? statusParam
      : "all";

  const where: Prisma.HeroSlideWhereInput = {
    ...(search && {
      OR: [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          subtitle: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          buttonText: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          buttonLink: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    }),

    ...(status !== "all" && {
      isActive: status === "active",
    }),
  };

  const [slides, total] = await Promise.all([
    prisma.heroSlide.findMany({
      where,
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
      skip,
      take: limit,
    }),

    prisma.heroSlide.count({
      where,
    }),
  ]);

  const safeSlides = slides.map((slide) => ({
    ...slide,
    createdAt: slide.createdAt.toISOString(),
    updatedAt: slide.updatedAt.toISOString(),
  }));

  return (
    <HeroSlidesClient
      slides={safeSlides}
      page={page}
      total={total}
      limit={limit}
      search={search}
      statusFilter={status}
    />
  );
}