import { getBrandSeriesMenu } from "@/lib/services/brandSeriesService";
import BrandSeriesMenuClient from "./BrandSeriesMenuClient";

export default async function BrandSeriesMenu() {
  const brands = await getBrandSeriesMenu();

  if (!brands.length) {
    return null;
  }

  return <BrandSeriesMenuClient brands={brands} />;
}