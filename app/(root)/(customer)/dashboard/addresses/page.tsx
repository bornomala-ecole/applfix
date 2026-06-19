import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AddressesClient from "./addresses-client";

export default async function DashboardAddressesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

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
    select: {
      id: true,
      type: true,
      fullName: true,
      phone: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      state: true,
      postalCode: true,
      country: true,
      isDefault: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const safeAddresses = addresses.map((address) => ({
    ...address,
    createdAt: address.createdAt.toISOString(),
    updatedAt: address.updatedAt.toISOString(),
  }));

  return <AddressesClient addresses={safeAddresses} />;
}