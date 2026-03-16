import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

// Define the type for footer links
type FooterLink = {
  id: number;
  name: string;
  href: string;
};

// Define the type for a footer column
type FooterColumn = {
  title: string;
  links: FooterLink[];
};

// Sample data for footer columns
const footerColumns: FooterColumn[] = [
  {
    title: "Shop",
    links: [
      { id: 1, name: "All Phones", href: "/shop" },
      { id: 2, name: "Best Sellers", href: "/shop?sort=bestsellers" },
      { id: 3, name: "New Arrivals", href: "/shop?sort=new" },
      { id: 4, name: "Deals", href: "/shop?sort=deals" },
    ],
  },
  {
    title: "Help",
    links: [
      { id: 1, name: "Contact Us", href: "/contact" },
      { id: 2, name: "FAQs", href: "/faq" },
      { id: 3, name: "Shipping & Delivery", href: "/shipping" },
      { id: 4, name: "Returns & Refunds", href: "/returns" },
    ],
  },
  {
    title: "About",
    links: [
      { id: 1, name: "Our Story", href: "/about" },
      { id: 2, name: "Blog", href: "/blog" },
      { id: 3, name: "Careers", href: "/careers" },
      { id: 4, name: "Privacy Policy", href: "/privacy" },
      { id: 5, name: "Terms of Service", href: "/terms" },
    ],
  },
];

const socialLinks = [
  { id: 1, name: "Facebook", icon: Facebook, href: "#" },
  { id: 2, name: "Twitter", icon: Twitter, href: "#" },
  { id: 3, name: "Instagram", icon: Instagram, href: "#" },
  { id: 4, name: "YouTube", icon: Youtube, href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Company Info & Socials */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 text-2xl font-bold text-white">
              YourStore
            </Link>
            <p className="mb-6 max-w-sm text-sm">
              Your trusted destination for the latest and greatest in mobile technology. Find the perfect phone for you.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <Link
                    key={social.id}
                    href={social.href}
                    aria-label={social.name}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition-colors hover:bg-primaryRed hover:text-white"
                  >
                    <IconComponent size={20} />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Footer Links */}
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 text-base font-semibold text-white">
                {column.title}
              </h3>
              <ul className="space-y-2 text-sm">
                {column.links.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      className="transition-colors hover:text-white"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-base font-semibold text-white">Get in Touch</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Mail size={18} className="shrink-0" />
                <span>support@yourstore.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="shrink-0 mt-0.5" />
                <span>123 Tech Street<br />Silicon Valley, CA 94025</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-gray-800">
        <div className="container py-6">
          <p className="text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} YourStore. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}