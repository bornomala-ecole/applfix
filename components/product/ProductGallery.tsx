"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [mainImage, setMainImage] = useState(images[0]);

  const handlePrevImage = () => {
    const currentIndex = images.indexOf(mainImage);
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setMainImage(images[prevIndex]);
  };

  const handleNextImage = () => {
    const currentIndex = images.indexOf(mainImage);
    const nextIndex = (currentIndex + 1) % images.length;
    setMainImage(images[nextIndex]);
  };

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row">
      {/* Thumbnails */}
      <div className="flex gap-2 lg:flex-col">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setMainImage(img)}
            className={`overflow-hidden rounded-lg border-2 transition-all ${
              mainImage === img ? "border-primaryRed" : "border-transparent"
            }`}
          >
            <Image
              src={img}
              alt={`${productName} thumbnail ${index + 1}`}
              width={80}
              height={80}
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative flex-1">
        <Image
          src={mainImage}
          alt={productName}
          width={600}
          height={600}
          className="h-full w-full object-contain"
        />
        {/* Navigation Arrows */}
        <button
          onClick={handlePrevImage}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow-lg transition hover:bg-white"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={handleNextImage}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow-lg transition hover:bg-white"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}