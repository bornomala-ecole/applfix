import Image from "next/image"
import Link from "next/link"
import { Calendar, ArrowRight } from "lucide-react"

// Define the type for a blog post
type BlogPost = {
  id: number
  title: string
  excerpt: string
  slug: string // URL-friendly version of the title
  author: string
  publishDate: string
  image: string
}

// Sample blog post data - in a real app, this would come from a CMS or API
const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "iPhone 15 Pro vs. Pro Max: Which One is Right for You?",
    excerpt: "We break down the key differences between Apple's flagship phones to help you decide.",
    slug: "iphone-15-pro-vs-pro-max",
    author: "Tech Team",
    publishDate: "Oct 26, 2023",
    image: "/images/blog/iphone-15-comparison.jpg",
  },
  {
    id: 2,
    title: "The Rise of Foldable Phones: A 2024 Preview",
    excerpt: "An in-depth look at the future of smartphone technology and the models leading the charge.",
    slug: "rise-of-foldable-phones-2024",
    author: "David Lee",
    publishDate: "Oct 22, 2023",
    image: "/images/blog/foldable-phones.jpg",
  },
  {
    id: 3,
    title: "How to Extend Your Phone's Battery Life",
    excerpt: "Simple and effective tips and tricks to make your phone's battery last all day long.",
    slug: "how-to-extend-phone-battery-life",
    author: "Sarah Jenkins",
    publishDate: "Oct 18, 2023",
    image: "/images/blog/phone-battery.jpg",
  },
];

export default function LatestNews() {
  return (
    <section className="py-12 lg:py-16">
      <div className="container">
        {/* Section Header */}
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Latest News & Reviews</h2>
          <Link
            href="/blog"
            className="group flex items-center gap-1 text-sm font-medium text-primaryRed hover:underline"
          >
            View All Articles
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <div
              key={post.id}
              className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-300 hover:shadow-lg"
            >
              {/* Post Image */}
              <Link href={`/blog/${post.slug}`}>
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </Link>

              {/* Post Content */}
              <div className="flex flex-1 flex-col p-5">
                {/* Meta Information */}
                <div className="mb-3 flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {post.publishDate}
                  </span>
                  <span>By {post.author}</span>
                </div>

                {/* Title */}
                <Link href={`/blog/${post.slug}`}>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-primaryRed">
                    {post.title}
                  </h3>
                </Link>

                {/* Excerpt */}
                <p className="mb-4 flex-grow text-sm text-gray-600 line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Read More Link */}
                <Link
                  href={`/blog/${post.slug}`}
                  className="self-start text-sm font-medium text-primaryRed hover:underline"
                >
                  Read More
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}