import { prisma } from "@/server/clients";
import { Prisma } from "@prisma/client";

export const groupByIdWithUsers = async (id: string) => {
  const group = await prisma.group.findUnique({
    where: { id },
    rejectOnNotFound: true,
  });
  const groupUsers = await prisma.userGroup.findMany({
    where: { groupId: id },
    include: { user: { select: { id: true, email: true, name: true } } },
  });
  return { ...group, users: groupUsers };
};

export type GroupWithUsers = Prisma.PromiseReturnType<
  typeof groupByIdWithUsers
>;

export const addUserToGroup = (groupId: string, userId: string) =>
  prisma.userGroup.create({ data: { groupId, userId, admin: false } });
