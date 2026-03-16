import Image from "next/image"
import Link from "next/link"

type Brand = {
  id: number
  name: string
  image: string
  link: string
}

const brands: Brand[] = [
  {
    id: 1,
    name: "Apple",
    image: "/images/brands/apple.png",
    link: "/shop?brand=apple",
  },
  {
    id: 2,
    name: "Samsung",
    image: "/images/brands/samsung.png",
    link: "/shop?brand=samsung",
  },
  {
    id: 3,
    name: "Xiaomi",
    image: "/images/brands/xiaomi.png",
    link: "/shop?brand=xiaomi",
  },
  {
    id: 4,
    name: "OnePlus",
    image: "/images/brands/oneplus.png",
    link: "/shop?brand=oneplus",
  },
  {
    id: 5,
    name: "Google",
    image: "/images/brands/google.png",
    link: "/shop?brand=google",
  },
]

export default function BrandSection() {
  return (
    <section className="py-12">
      <div className="container">

        <h2 className="text-2xl font-semibold mb-8">
          Shop by Brand
        </h2>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">

          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={brand.link}
              className="group flex flex-col items-center justify-center rounded-lg border p-6 transition hover:border-primary]"
            >
              <div className="relative h-[50px] w-[120px]">
                <Image
                  src={brand.image}
                  alt={brand.name}
                  fill
                  className="object-contain"
                />
              </div>

              <p className="mt-3 text-sm font-medium">
                {brand.name}
              </p>
            </Link>
          ))}

        </div>
      </div>
    </section>
  )
}