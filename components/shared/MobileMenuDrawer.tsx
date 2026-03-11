"use client"

import Link from "next/link"
import { X } from "lucide-react"
import { Dispatch, SetStateAction, useEffect } from "react"

type MobileMenuDrawerProps = {
  showMobileMenu: boolean
  setShowMobileMenu: Dispatch<SetStateAction<boolean>>
}

export default function MobileMenuDrawer({
  showMobileMenu,
  setShowMobileMenu,
}: MobileMenuDrawerProps) {
  const closeMenu = () => setShowMobileMenu(false)

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowMobileMenu(false)
      }
    }

    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [setShowMobileMenu])

  return (
    <>
      <div
        onClick={closeMenu}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 lg:hidden ${
          showMobileMenu ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      <aside
        className={`fixed top-0 left-0 h-screen w-[280px] bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          showMobileMenu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b px-4 py-4">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button className="cursor-pointer" type="button" onClick={closeMenu}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4">
          <ul className="flex flex-col gap-4">
            <li>
              <Link
                href="/"
                onClick={closeMenu}
                className="block text-base font-medium hover:text-primaryRed"
              >
                Home
              </Link>
            </li>

            <li>
              <Link
                href="/shop"
                onClick={closeMenu}
                className="block text-base font-medium hover:text-primaryRed"
              >
                Shop
              </Link>
            </li>

            <li>
              <Link
                href="/about"
                onClick={closeMenu}
                className="block text-base font-medium hover:text-primaryRed"
              >
                About
              </Link>
            </li>

            <li>
              <Link
                href="/contact"
                onClick={closeMenu}
                className="block text-base font-medium hover:text-primaryRed"
              >
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  )
}