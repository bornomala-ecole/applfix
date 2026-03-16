"use client"
import { useState, useRef, useEffect } from "react"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import {User, Heart, ShoppingCart, CircleUser, LogIn, UserPlus, LayoutDashboard, LogOut, Search, Menu, X} from 'lucide-react'
import CartDrawer from "../cart/CartDrawer"
import MobileMenuDrawer from "./MobileMenuDrawer"
export default function Header() {

  const { data: session, status } = useSession()
  const [showUserItems, setShowUserItems] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  


  const userRef = useRef<HTMLDivElement | null>(null)

  const toggleUserItems = () => {
    setShowUserItems(prev => !prev)
  }
  const toggleCart = () => {
    setShowCart((prev) => !prev)
  }
  const toggleMobileMenu = () => {
    setShowMobileMenu((prev) => !prev)
  }


  const closeUserMenu = () => setShowUserItems(false)
  useEffect(() => {

    const handleClickOutside = (event: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserItems(false)
      }
    }
  
    document.addEventListener("mousedown", handleClickOutside)
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <>
      <section className="header_section">
        <div className="top_bar bg-primaryRed text-white py-1 text-center">
          <div className="container">
            <p>Special announcement/discount will be here...</p>
          </div>
        </div>

        <div className="header_middile py-2 lg:py-2">
          <div className="container">
            <header className="flex justify-between gap-6 items-center">

              <div className="nav_left lg:hidden flex gap-3 items-center">
                <button type="button" onClick={toggleMobileMenu}>
                  <Menu className="mobile_menu_opener cursor-pointer hover:text-red-600 w-6 h-6" />
                </button>
              </div>

              <Link href="/">
                <Image src="/images/logo.png" className="min-h-[25] min-w-[130]" width={130} height={20} alt="Site logo" />
              </Link>              

              <div className="search hidden lg:block">
                <form action="">
                  <input className="rounded px-4 py-2 border" type="text" placeholder="Search ..." />
                </form>
              </div>

              <div className="nav-right">
                <div className="flex gap-2 items-center">
                    <button type="button" onClick={toggleCart}>
                      <ShoppingCart className="cursor-pointer hover:text-red-600 w-6 h-6" />
                    </button>
                  {/* <Heart className="cursor-pointer hover:text-red-600 w-6 h-6 " /> */}
                  <div className="group user-group relative z-20" ref={userRef}>
                    <CircleUser onClick={toggleUserItems} className="cursor-pointer hover:text-red-600 w-6 h-6" />
                    {showUserItems && (
                      <div className="absolute top-[90%] pt-3 right-0 width-[200px]">
                        {session ? (
                          <div  className=" bg-gray-600 text-white px-4 py-2 rounded">
                              <Link  onClick={closeUserMenu} className="border-b pb-2 mb-2 hover:text-primaryRed flex gap-2 items-center" href="/dashboard">  <LayoutDashboard className="cursor-pointer  w-6 h-6 " />Dashboard</Link>
                              <button  className="hover:text-primaryRed cursor-pointer flex gap-2 items-center" onClick={() => { 
                                setShowUserItems(false) 
                                signOut() 
                              }}> <LogOut className="cursor-pointer  w-6 h-6 " />Logout</button>
                            </div>
                          ) : (
                            <div className=" bg-gray-600 text-white px-4 py-2 rounded flex flex-col">
                              <Link  onClick={closeUserMenu} className="border-b pb-2 mb-2 flex gap-2 items-center hover:text-primaryRed" href="/login"><LogIn className="cursor-pointer  w-6 h-6 " />Login</Link>
                              <Link  onClick={closeUserMenu} className="flex gap-2 items-center hover:text-primaryRed" href="/register"> <UserPlus className="cursor-pointer  w-6 h-6 " />Register</Link>
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

        <div className="header_bottom hidden lg:block bg-primaryRed py-2">
          <div className="container">
            <ul className="flex gap-2 items-center  ">
              <li className="text-white hover:text-gray-200 cursor-pointer text-lg font-semibold font-poppins"><Link href="/" >Home</Link></li>
              <li className="text-white hover:text-gray-200 cursor-pointer text-lg font-semibold font-poppins"><Link href="/shop" >Shop</Link></li>
              <li className="text-white hover:text-gray-200 cursor-pointer text-lg font-semibold font-poppins"><Link href="/about" >About</Link></li>
              <li className="text-white hover:text-gray-200 cursor-pointer text-lg font-semibold font-poppins"><Link href="/contact" >Contact</Link></li>
              {session ? (
                <li className="text-white hover:text-gray-200 cursor-pointer text-lg font-semibold font-poppins"><Link href={session.user.role === 'user' ? '/dashboard' : '/admin/dashboard' }>Dashboard</Link></li>
              ) : ('')}
            </ul>
          </div>
        </div>

        <div className="mobile_search lg:hidden flex justify-center mt-4">
          <form className="w-full max-w-4xl flex justify-center" action="">
            <input className="rounded px-4 py-2 border" type="text" placeholder="Search ..." />
          </form>          
        </div>


        
      </section>
      <CartDrawer showCart={showCart} setShowCart={setShowCart} />
      <MobileMenuDrawer   showMobileMenu={showMobileMenu}  setShowMobileMenu={setShowMobileMenu} />
    </>
  )
}