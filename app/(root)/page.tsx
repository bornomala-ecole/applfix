import FeaturedProducts from "@/components/home/FeaturedProducts";
import HeroSlider from "@/components/home/HeroSlider";
import LatestNews from "@/components/home/LatestNews";
import Newsletter from "@/components/home/NewsLetter";
import OurServices from "@/components/home/OurServices";
import Testimonials from "@/components/home/Testimonials";
import BrandSeriesMenu from "@/components/home/BrandSeriesMenu";
import Image from "next/image";
import BrandCarousel from "@/components/home/BrandCarousel";
import BestSellerProducts from "@/components/home/BestSellers";
import CategoryCarousel from "@/components/home/CategoryCarousel";

export default function Home() {
  return (
    <>
      <HeroSlider />
      <BrandSeriesMenu />
      <CategoryCarousel />
      <FeaturedProducts />
      <BrandCarousel />
      <BestSellerProducts />
      <OurServices />
      {/* <Testimonials /> */}
      {/* <LatestNews /> */}
      {/* <Newsletter /> */}
    </>
  );
}
