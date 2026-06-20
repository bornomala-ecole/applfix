"use client"

import { useState, useRef, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import {
  getGuestCart,
  getGuestCartCount,
  clearGuestCart,
} from "@/lib/cart/guestCart";



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

const GUEST_CART_SYNC_LOCK = "guest_cart_sync_in_progress";

export default function Header() {
  const { data: session, status } = useSession()

  const [showUserItems, setShowUserItems] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const [cartCount, setCartCount] = useState(0);


  const userRef = useRef<HTMLDivElement | null>(null)

  // =========================
  // 🎯 ROLE BASED DASHBOARD
  // =========================
  const getDashboardLink = () => {
    const role = session?.user?.role

    if (role === "ADMIN" || role === "SUPER_ADMIN") {
      return "/admin/dashboard"
    }

    if (role === "MANAGER") {
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

  /*
  async function loadCartCount() {
    if (!session) {
      setCartCount(0);
      return;
    }
  
    const res = await fetch("/api/cart", {
      cache: "no-store",
    });
  
    if (!res.ok) {
      setCartCount(0);
      return;
    }
  
    const data = await res.json();
    setCartCount(data.count || 0);
  }
    */
  async function loadCartCount() {
    if (status === "loading") return;
  
    if (status !== "authenticated") {
      setCartCount(getGuestCartCount());
      return;
    }
  
    const res = await fetch("/api/cart", {
      cache: "no-store",
    });
  
    if (!res.ok) {
      setCartCount(0);
      return;
    }
  
    const data = await res.json();
    setCartCount(data.count || 0);
  }
  
  async function syncGuestCartToDatabase() {
    if (status !== "authenticated") return;
  
    const guestCart = getGuestCart();
  
    if (!guestCart.length) return;
  
    // Prevent duplicate sync in React Strict Mode / re-render
    if (localStorage.getItem(GUEST_CART_SYNC_LOCK) === "true") {
      return;
    }
  
    localStorage.setItem(GUEST_CART_SYNC_LOCK, "true");
  
    try {
      for (const item of guestCart) {
        await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          }),
        });
      }
  
      clearGuestCart();
      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      console.error("GUEST_CART_SYNC_ERROR", error);
    } finally {
      localStorage.removeItem(GUEST_CART_SYNC_LOCK);
    }
  }


  useEffect(() => {
    async function run() {
      if (status === "loading") return;
  
      if (status === "authenticated") {
        await syncGuestCartToDatabase();
      }
  
      await loadCartCount();
    }
  
    run();
  
    const handleCartUpdated = () => {
      loadCartCount();
    };
  
    window.addEventListener("cart-updated", handleCartUpdated);
  
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdated);
    };
  }, [status]);


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
                <button
                  type="button"
                  onClick={toggleCart}
                  className="relative"
                >
                  <ShoppingCart className="cursor-pointer hover:text-red-600 w-6 h-6" />

                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-5 h-5 rounded-full bg-primaryRed text-white text-[11px] flex items-center justify-center px-1">
                      {cartCount}
                    </span>
                  )}
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