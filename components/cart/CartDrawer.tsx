"use client"

import { Dispatch, SetStateAction, useEffect } from "react"
import { X } from "lucide-react"

type CartDrawerProps = {
  showCart: boolean
  setShowCart: Dispatch<SetStateAction<boolean>>
}

export default function CartDrawer({
  showCart,
  setShowCart,
}: CartDrawerProps) {
  
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowCart(false)
      }
    }

    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [setShowCart])

  return (
    <>
      <div
        onClick={() => setShowCart(false)}
        className={` fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          showCart ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      <aside
        className={`fixed top-0 right-0 h-screen w-[320px] sm:w-[400px] bg-white z-50 shadow-xl transition-transform duration-300 ease-in-out ${
          showCart ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b px-4 py-4">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <button className="cursor-pointer" type="button" onClick={() => setShowCart(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100vh-73px)]">
          <div className="border rounded p-3 mb-3">
            <h3 className="font-medium">Product Name</h3>
            <p className="text-sm text-gray-500">Qty: 1</p>
            <p className="font-semibold">$49.00</p>
          </div>

          <div className="border rounded p-3 mb-3">
            <h3 className="font-medium">Another Product</h3>
            <p className="text-sm text-gray-500">Qty: 2</p>
            <p className="font-semibold">$99.00</p>
          </div>
        </div>
      </aside>
    </>
  )
}