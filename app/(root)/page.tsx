import BestSellers from "@/components/home/BestSellers";
import BrandSection from "@/components/home/BrandSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import HeroSlider from "@/components/home/HeroSlider";
import LatestNews from "@/components/home/LatestNews";
import Newsletter from "@/components/home/NewsLetter";
import OurServices from "@/components/home/OurServices";
import Testimonials from "@/components/home/Testimonials";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <HeroSlider />
      <BrandSection />
      <FeaturedProducts />
      <OurServices />
      <Testimonials />
      <LatestNews />
      <BestSellers />
      <Newsletter />
    </>
  );
}
