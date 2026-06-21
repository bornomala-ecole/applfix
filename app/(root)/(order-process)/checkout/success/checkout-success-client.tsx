// app/checkout/success/checkout-success-client.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutSuccessClient() {
  const router = useRouter();

  useEffect(() => {
    window.dispatchEvent(new Event("cart-updated"));
    router.refresh();
  }, [router]);

  return null;
}