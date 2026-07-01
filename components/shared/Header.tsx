"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import {
  getGuestCart,
  getGuestCartCount,
  clearGuestCart,
} from "@/lib/cart/guestCart";

import {
  ShoppingCart,
  CircleUser,
  LogIn,
  LayoutDashboard,
  LogOut,
  Search,
  Menu,
} from "lucide-react";

import CartDrawer from "../cart/CartDrawer";
import MobileMenuDrawer from "./MobileMenuDrawer";

const GUEST_CART_SYNC_LOCK = "guest_cart_sync_in_progress";

export default function Header() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [showUserItems, setShowUserItems] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const userRef = useRef<HTMLDivElement | null>(null);

  const getDashboardLink = () => {
    const role = session?.user?.role;

    if (role === "ADMIN" || role === "SUPER_ADMIN") {
      return "/admin/dashboard";
    }

    if (role === "MANAGER") {
      return "/manager/dashboard";
    }

    return "/dashboard";
  };

  const toggleUserItems = () => setShowUserItems((prev) => !prev);
  const toggleCart = () => setShowCart((prev) => !prev);
  const toggleMobileMenu = () => setShowMobileMenu((prev) => !prev);

  const closeUserMenu = () => setShowUserItems(false);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanQuery = searchQuery.trim();

    if (!cleanQuery) {
      router.push("/search");
      return;
    }

    router.push(`/search?q=${encodeURIComponent(cleanQuery)}`);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserItems(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          <div className="top_bar bg-primaryRed py-1 text-center text-white">
            <div className="container">
              <p>Special announcement/discount will be here...</p>
            </div>
          </div>
        )}

        <div
          className={`header_middile transition-all duration-300 ${
            isScrolled ? "bg-[#ddd] py-1" : "py-2"
          }`}
        >
          <div className="container">
            <header
              className={`flex items-center justify-between gap-6 transition-all duration-300 ${
                isScrolled ? "py-1" : "py-4"
              }`}
            >
              <div className="nav_left flex items-center gap-3 lg:hidden">
                <button type="button" onClick={toggleMobileMenu}>
                  <Menu className="h-6 w-6 cursor-pointer hover:text-red-600" />
                </button>
              </div>

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

              <div className="search hidden lg:block">
                <form
                  onSubmit={handleSearchSubmit}
                  className="relative flex items-center"
                >
                  <Search
                    size={17}
                    className="pointer-events-none absolute left-3 text-gray-400"
                  />

                  <input
                    className={`rounded border pl-10 pr-4 outline-none transition focus:border-primaryRed focus:ring-2 focus:ring-red-100 ${
                      isScrolled ? "py-1" : "py-2"
                    }`}
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search products..."
                    aria-label="Search products"
                  />
                </form>
              </div>

              <div className="nav-right">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleCart}
                    className="relative"
                  >
                    <ShoppingCart className="h-6 w-6 cursor-pointer hover:text-red-600" />

                    {cartCount > 0 && (
                      <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primaryRed px-1 text-[11px] text-white">
                        {cartCount}
                      </span>
                    )}
                  </button>

                  <div className="group relative z-20" ref={userRef}>
                    <CircleUser
                      onClick={toggleUserItems}
                      className="h-6 w-6 cursor-pointer hover:text-red-600"
                    />

                    {showUserItems && (
                      <div className="absolute right-0 top-[90%] w-[200px] pt-3">
                        {session ? (
                          <div className="rounded bg-gray-600 px-4 py-2 text-white">
                            <Link
                              onClick={closeUserMenu}
                              className="mb-2 flex items-center gap-2 border-b pb-2 hover:text-primaryRed"
                              href={getDashboardLink()}
                            >
                              <LayoutDashboard className="h-6 w-6" />
                              Dashboard
                            </Link>

                            <button
                              className="flex cursor-pointer items-center gap-2 hover:text-primaryRed"
                              onClick={() => {
                                setShowUserItems(false);
                                signOut();
                              }}
                            >
                              <LogOut className="h-6 w-6" />
                              Logout
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col rounded bg-gray-600 px-4 py-2 text-white">
                            <Link
                              onClick={closeUserMenu}
                              className="mb-2 flex items-center gap-2 border-b pb-2 hover:text-primaryRed"
                              href="/login"
                            >
                              <LogIn className="h-6 w-6" />
                              Login
                            </Link>
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

        <div
          className={`header_bottom hidden bg-primaryRed lg:block ${
            isScrolled ? "py-1 text-md" : "py-2 text-lg"
          }`}
        >
          <div className="container">
            <ul className="flex items-center gap-2">
              <li className="font-semibold text-white hover:text-gray-200">
                <Link href="/">Home</Link>
              </li>

              <li className="font-semibold text-white hover:text-gray-200">
                <Link href="/shop">Shop</Link>
              </li>

              <li className="font-semibold text-white hover:text-gray-200">
                <Link href="/about">About</Link>
              </li>

              <li className="font-semibold text-white hover:text-gray-200">
                <Link href="/contact">Contact</Link>
              </li>

              {session && (
                <li className="font-semibold text-white hover:text-gray-200">
                  <Link href={getDashboardLink()}>Dashboard</Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mobile_search mt-4 flex justify-center px-4 lg:hidden">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex w-full max-w-4xl justify-center"
          >
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              className="w-full rounded border py-2 pl-10 pr-4 outline-none transition focus:border-primaryRed focus:ring-2 focus:ring-red-100"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
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
  );
}