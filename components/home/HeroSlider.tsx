import { prisma } from "@/lib/prisma";
import HeroSliderClient, { type HeroSlideItem } from "./HeroSliderClient";

export default async function HeroSlider() {
  const slides = await prisma.heroSlide.findMany({
    where: {
      isActive: true,
    },
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
    select: {
      id: true,
      title: true,
      subtitle: true,
      description: true,
      imageDesktop: true,
      imageMobile: true,
      buttonText: true,
      buttonLink: true,
    },
  });

  const safeSlides: HeroSlideItem[] = slides.map((slide) => ({
    id: slide.id,
    title: slide.title,
    subtitle: slide.subtitle,
    description: slide.description,
    imageDesktop: slide.imageDesktop,
    imageMobile: slide.imageMobile,
    buttonText: slide.buttonText,
    buttonLink: slide.buttonLink,
  }));

  return <HeroSliderClient slides={safeSlides} />;
}