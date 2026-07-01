"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

export type HeroSlideItem = {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageDesktop: string;
  imageMobile?: string | null;
  buttonText: string;
  buttonLink: string;
};

type Props = {
  slides: HeroSlideItem[];
};

export default function HeroSliderClient({ slides }: Props) {
  if (!slides.length) {
    return null;
  }

  return (
    <section className="my-4 lg:my-10">
      <div className="container">
        <div className="relative w-full overflow-hidden rounded-xl lg:rounded-2xl">
          <Swiper
            modules={[Navigation, Pagination, Autoplay, EffectFade]}
            slidesPerView={1}
            loop={slides.length > 1}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            autoplay={
              slides.length > 1
                ? {
                    delay: 5000,
                    disableOnInteraction: false,
                  }
                : false
            }
            pagination={
              slides.length > 1
                ? {
                    clickable: true,
                  }
                : false
            }
            navigation={
              slides.length > 1
                ? {
                    prevEl: ".hero-prev",
                    nextEl: ".hero-next",
                  }
                : false
            }
            className="w-full"
          >
            {slides.map((slide, index) => (
              <SwiperSlide key={slide.id} className="w-full">
                <div className="relative h-[320px] w-full sm:h-[380px] lg:h-[520px]">
                  {/* mobile image */}
                  <Image
                    src={slide.imageMobile || slide.imageDesktop}
                    alt={slide.title}
                    fill
                    priority={index === 0}
                    sizes="100vw"
                    className="object-cover lg:hidden"
                  />

                  {/* desktop image */}
                  <Image
                    src={slide.imageDesktop}
                    alt={slide.title}
                    fill
                    priority={index === 0}
                    sizes="100vw"
                    className="hidden object-cover lg:block"
                  />

                  {/* overlay */}
                  <div className="absolute inset-0 bg-black/40" />

                  {/* content */}
                  <div className="absolute inset-0 flex items-end lg:items-center">
                    <div className="w-full px-4 pb-6 lg:px-14 lg:pb-0">
                      <div className="max-w-[520px] rounded-xl bg-white/90 p-4 shadow-xl backdrop-blur-sm sm:p-5 lg:p-8">
                        {slide.subtitle && (
                          <p className="mb-2 text-xs font-medium text-primaryRed sm:text-sm">
                            {slide.subtitle}
                          </p>
                        )}

                        <h2 className="mb-3 text-xl font-bold text-gray-900 sm:text-2xl lg:text-4xl">
                          {slide.title}
                        </h2>

                        {slide.description && (
                          <p className="mb-4 hidden text-sm text-gray-600 lg:block">
                            {slide.description}
                          </p>
                        )}

                        <Link
                          href={slide.buttonLink || "/shop"}
                          className="inline-flex items-center justify-center rounded-lg bg-primaryRed px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 lg:px-6 lg:py-3"
                        >
                          {slide.buttonText || "Shop Now"}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}

            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  className="hero-prev absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg lg:flex"
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  type="button"
                  className="hero-next absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg lg:flex"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </Swiper>
        </div>
      </div>
    </section>
  );
}