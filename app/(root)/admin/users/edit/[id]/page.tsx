import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import EditUserClient from "./edit-user-client";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditUserPage({ params }: Props) {
  const { id } = await params;

  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/admin/users/edit/${id}`);
  }

  const currentUser = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
    redirect("/admin/users");
  }

  const [user, totalSpentAggregate, paidSpentAggregate] = await Promise.all([
    prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            accounts: true,
          },
        },
      },
    }),

    prisma.order.aggregate({
      where: {
        userId: id,
      },
      _sum: {
        total: true,
      },
    }),

    prisma.order.aggregate({
      where: {
        userId: id,
        paymentStatus: "paid",
      },
      _sum: {
        total: true,
      },
    }),
  ]);

  if (!user) {
    notFound();
  }

  return (
    <EditUserClient
      user={{
        ...user,
        totalSpent: totalSpentAggregate._sum.total || 0,
        paidSpent: paidSpentAggregate._sum.total || 0,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }}
      currentUserId={currentUser.id}
    />
  );
}