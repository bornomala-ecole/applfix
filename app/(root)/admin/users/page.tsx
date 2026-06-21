import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Prisma, UserRole } from "@prisma/client";
import UsersClient from "./users-client";

type Props = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    role?: string;
  }>;
};

export default async function UsersPage({ searchParams }: Props) {
  const {
    page: pageParam,
    search: searchParam,
    role: roleParam,
  } = await searchParams;

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin/users");
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

  if (
    !currentUser ||
    !["ADMIN", "SUPER_ADMIN"].includes(currentUser.role)
  ) {
    redirect("/dashboard");
  }

  const page = Math.max(Number(pageParam || 1), 1);
  const limit = 20;
  const skip = (page - 1) * limit;

  const search = searchParam?.trim() || "";
  const validRoles = Object.values(UserRole);

  const role =
    roleParam && validRoles.includes(roleParam as UserRole)
      ? (roleParam as UserRole)
      : undefined;

  const where: Prisma.UserWhereInput = {
    ...(search && {
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    }),

    ...(role && {
      role,
    }),
  };

  const [users, total, totalCustomers, totalAdmins] = await Promise.all([
    prisma.user.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),

    prisma.user.count({
      where,
    }),

    prisma.user.count({
      where: {
        role: "CUSTOMER",
      },
    }),

    prisma.user.count({
      where: {
        role: {
          in: ["ADMIN", "SUPER_ADMIN"],
        },
      },
    }),
  ]);

  const userIds = users.map((user) => user.id);

  const orderTotals =
    userIds.length > 0
      ? await prisma.order.groupBy({
          by: ["userId"],
          where: {
            userId: {
              in: userIds,
            },
          },
          _sum: {
            total: true,
          },
        })
      : [];

  const totalSpentByUserId = new Map(
    orderTotals.map((item) => [
      item.userId,
      item._sum.total || 0,
    ])
  );

  const safeUsers = users.map((user) => ({
    ...user,
    totalSpent: totalSpentByUserId.get(user.id) || 0,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }));

  return (
    <UsersClient
      users={safeUsers}
      page={page}
      total={total}
      limit={limit}
      search={search}
      roleFilter={role || "all"}
      currentUserId={currentUser.id}
      currentUserRole={currentUser.role}
      totalCustomers={totalCustomers}
      totalAdmins={totalAdmins}
    />
  );
}