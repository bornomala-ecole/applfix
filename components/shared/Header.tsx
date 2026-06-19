"use client"

import { useState, useRef, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"

import {
  User,
  Heart,
  ShoppingCart,
  CircleUser,
  LogIn,
  UserPlus,
  LayoutDashboard,
  LogOut,
  Search,
  Menu,
  X
} from "lucide-react"

import CartDrawer from "../cart/CartDrawer"
import MobileMenuDrawer from "./MobileMenuDrawer"

export default function Header() {
  const { data: session, status } = useSession()

  const [showUserItems, setShowUserItems] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const userRef = useRef<HTMLDivElement | null>(null)

  // =========================
  // 🎯 ROLE BASED DASHBOARD
  // =========================
  const getDashboardLink = () => {
    const role = session?.user?.role

    if (role === "ADMIN" || role === "SUPER_ADMIN") {
      return "/admin/dashboard"
    }

    if (role === "manager") {
      return "/manager/dashboard"
    }

    return "/dashboard"
  }

  const toggleUserItems = () => setShowUserItems((prev) => !prev)
  const toggleCart = () => setShowCart((prev) => !prev)
  const toggleMobileMenu = () => setShowMobileMenu((prev) => !prev)

  const closeUserMenu = () => setShowUserItems(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserItems(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <section
        className={`header_section sticky top-0 z-50 transition-all duration-300 ${
          isScrolled ? "shadow-md" : "shadow-none"
        }`}
      >
        {!isScrolled && (
          <div className="top_bar bg-primaryRed text-white py-1 text-center">
            <div className="container">
              <p>Special announcement/discount will be here...</p>
            </div>
          </div>
        )}

        {/* Middle Header */}
        <div
          className={`header_middile transition-all duration-300 ${
            isScrolled ? "bg-[#ddd] py-1" : "py-2"
          }`}
        >
          <div className="container">
            <header
              className={`flex justify-between gap-6 items-center transition-all duration-300 ${
                isScrolled ? "py-1" : "py-4"
              }`}
            >
              {/* Mobile Menu */}
              <div className="nav_left lg:hidden flex gap-3 items-center">
                <button type="button" onClick={toggleMobileMenu}>
                  <Menu className="cursor-pointer hover:text-red-600 w-6 h-6" />
                </button>
              </div>

              {/* Logo */}
              <Link href="/">
                <Image
                  src="/images/logo.png"
                  className={`min-h-[25px] min-w-[130px] ${
                    isScrolled ? "scale-[.75]" : ""
                  }`}
                  width={130}
                  height={20}
                  alt="Site logo"
                />
              </Link>

              {/* Search */}
              <div className="search hidden lg:block">
                <form>
                  <input
                    className={`rounded px-4 ${
                      isScrolled ? "py-1" : "py-2"
                    } border`}
                    type="text"
                    placeholder="Search ..."
                  />
                </form>
              </div>

              {/* Right Icons */}
              <div className="nav-right">
                <div className="flex gap-2 items-center">
                  <button type="button" onClick={toggleCart}>
                    <ShoppingCart className="cursor-pointer hover:text-red-600 w-6 h-6" />
                  </button>

                  {/* User Dropdown */}
                  <div className="group relative z-20" ref={userRef}>
                    <CircleUser
                      onClick={toggleUserItems}
                      className="cursor-pointer hover:text-red-600 w-6 h-6"
                    />

                    {showUserItems && (
                      <div className="absolute top-[90%] pt-3 right-0 w-[200px]">
                        {session ? (
                          <div className="bg-gray-600 text-white px-4 py-2 rounded">
                            <Link
                              onClick={closeUserMenu}
                              className="border-b pb-2 mb-2 hover:text-primaryRed flex gap-2 items-center"
                              href={getDashboardLink()}
                            >
                              <LayoutDashboard className="w-6 h-6" />
                              Dashboard
                            </Link>

                            <button
                              className="hover:text-primaryRed cursor-pointer flex gap-2 items-center"
                              onClick={() => {
                                setShowUserItems(false)
                                signOut()
                              }}
                            >
                              <LogOut className="w-6 h-6" />
                              Logout
                            </button>
                          </div>
                        ) : (
                          <div className="bg-gray-600 text-white px-4 py-2 rounded flex flex-col">
                            <Link
                              onClick={closeUserMenu}
                              className="border-b pb-2 mb-2 flex gap-2 items-center hover:text-primaryRed"
                              href="/login"
                            >
                              <LogIn className="w-6 h-6" />
                              Login
                            </Link>

                            {/* <Link
                              onClick={closeUserMenu}
                              className="flex gap-2 items-center hover:text-primaryRed"
                              href="/register"
                            >
                              <UserPlus className="w-6 h-6" />
                              Register
                            </Link> */}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </header>
          </div>
        </div>

        {/* Bottom Nav */}
        <div
          className={`header_bottom hidden lg:block bg-primaryRed ${
            isScrolled ? "py-1 text-md" : "py-2 text-lg"
          }`}
        >
          <div className="container">
            <ul className="flex gap-2 items-center">
              <li className="text-white hover:text-gray-200 font-semibold">
                <Link href="/">Home</Link>
              </li>

              <li className="text-white hover:text-gray-200 font-semibold">
                <Link href="/shop">Shop</Link>
              </li>

              <li className="text-white hover:text-gray-200 font-semibold">
                <Link href="/about">About</Link>
              </li>

              <li className="text-white hover:text-gray-200 font-semibold">
                <Link href="/contact">Contact</Link>
              </li>

              {session && (
                <li className="text-white hover:text-gray-200 font-semibold">
                  <Link href={getDashboardLink()}>
                    Dashboard
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="mobile_search lg:hidden flex justify-center mt-4">
          <form className="w-full max-w-4xl flex justify-center">
            <input
              className="rounded px-4 py-2 border"
              type="text"
              placeholder="Search ..."
            />
          </form>
        </div>
      </section>

      <CartDrawer showCart={showCart} setShowCart={setShowCart} />
      <MobileMenuDrawer
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
      />
    </>
  )
}