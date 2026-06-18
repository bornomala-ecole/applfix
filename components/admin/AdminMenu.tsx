"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const AdminMenu = () => {
  const pathname = usePathname()

  const menu = [
    { name: "Dashboard", href: "/admin/dashboard" },
    { name: "Products", href: "/admin/products" },
    { name: "Brands", href: "/admin/brands" },
    { name: "Categories", href: "/admin/categories" },
  ]

  return (
    <aside className="w-full h-full bg-white border rounded-xl p-4 shadow-sm">

      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-800">
          Admin Panel
        </h2>
        <p className="text-xs text-gray-500">
          Management Dashboard
        </p>
      </div>

      {/* MENU */}
      <nav className="flex flex-col gap-2">

        {menu.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition
                ${
                  isActive
                    ? "bg-black text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              {item.name}
            </Link>
          )
        })}

      </nav>

      {/* FOOTER */}
      <div className="mt-6 pt-4 border-t text-xs text-gray-400">
        APPFLIX Admin v1.0
      </div>

    </aside>
  )
}

export default AdminMenu