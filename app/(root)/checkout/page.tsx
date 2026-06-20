import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CheckoutClient from "./checkout-client";

export default async function CheckoutPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/checkout");
  }

  const cart = await prisma.cart.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                where: {
                  type: "main",
                },
                orderBy: {
                  sortOrder: "asc",
                },
                take: 1,
              },
            },
          },
          variant: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  const addresses = await prisma.address.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: [
      {
        isDefault: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  const cartItems = cart?.items || [];

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + item.variant.price * item.quantity;
  }, 0);

  const safeItems = cartItems.map((item) => ({
    id: item.id,
    quantity: item.quantity,

    product: {
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      isActive: item.product.isActive,
      images: item.product.images.map((image) => ({
        id: image.id,
        url: image.url,
        alt: image.alt,
      })),
    },

    variant: {
      id: item.variant.id,
      sku: item.variant.sku,
      title: item.variant.title,
      color: item.variant.color,
      price: item.variant.price,
      comparePrice: item.variant.comparePrice,
      stock: item.variant.stock,
      isActive: item.variant.isActive,
    },
  }));

  const safeAddresses = addresses.map((address) => ({
    id: address.id,
    type: address.type,
    fullName: address.fullName,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    isDefault: address.isDefault,
  }));

  return (
    <CheckoutClient
      items={safeItems}
      subtotal={subtotal}
      addresses={safeAddresses}
    />
  );
}