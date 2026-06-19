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
    redirect("/login");
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
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

  const [users, total] = await Promise.all([
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
  ]);

  const safeUsers = users.map((user) => ({
    ...user,
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
    />
  );
}