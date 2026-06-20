import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import OrdersClient from "./orders-client";

type Props = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    paymentStatus?: string;
  }>;
};

export default async function DashboardOrdersPage({ searchParams }: Props) {
  const {
    page: pageParam,
    search: searchParam,
    status: statusParam,
    paymentStatus: paymentStatusParam,
  } = await searchParams;

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/orders");
  }

  const page = Math.max(Number(pageParam || 1), 1);
  const limit = 10;
  const skip = (page - 1) * limit;

  const search = searchParam?.trim() || "";

  const allowedStatuses = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  const allowedPaymentStatuses = [
    "unpaid",
    "paid",
    "failed",
    "refunded",
  ];

  const status =
    statusParam && allowedStatuses.includes(statusParam)
      ? statusParam
      : "all";

  const paymentStatus =
    paymentStatusParam && allowedPaymentStatuses.includes(paymentStatusParam)
      ? paymentStatusParam
      : "all";

  const where: Prisma.OrderWhereInput = {
    userId: session.user.id,

    ...(search && {
      OR: [
        {
          id: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          items: {
            some: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
        {
          items: {
            some: {
              sku: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
      ],
    }),

    ...(status !== "all" && {
      status,
    }),

    ...(paymentStatus !== "all" && {
      paymentStatus,
    }),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      select: {
        id: true,
        subtotal: true,
        shippingFee: true,
        tax: true,
        discount: true,
        total: true,
        status: true,
        paymentMethod: true,
        paymentStatus: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            items: true,
          },
        },
        items: {
          select: {
            id: true,
            name: true,
            price: true,
            quantity: true,
            sku: true,
            variantTitle: true,
            color: true,
            imageUrl: true,
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: {
                  where: {
                    type: "main",
                  },
                  select: {
                    id: true,
                    url: true,
                    alt: true,
                    type: true,
                  },
                  take: 1,
                },
              },
            },
            variant: {
              select: {
                id: true,
                title: true,
                color: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),

    prisma.order.count({
      where,
    }),
  ]);

  const safeOrders = orders.map((order) => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    totalQuantity: order.items.reduce((sum, item) => {
      return sum + item.quantity;
    }, 0),
  }));

  return (
    <OrdersClient
      orders={safeOrders}
      page={page}
      total={total}
      limit={limit}
      search={search}
      statusFilter={status}
      paymentStatusFilter={paymentStatus}
    />
  );
}