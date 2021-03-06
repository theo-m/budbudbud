import { Prisma } from "@prisma/client";

import { prisma } from "@/server/clients";
import { ServerErrors } from "@/server/errors";

const uncheckedGroupById = (id: string) =>
  prisma.group.findUnique({ where: { id }, rejectOnNotFound: true });

export const groupByIdWithUsers = async (
  id: string,
  requestAuthorEmail: string
) => {
  const group = await uncheckedGroupById(id);

  const groupUsers = await prisma.userGroup.findMany({
    where: { groupId: id },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  if (!groupUsers.find((u) => u.user.email === requestAuthorEmail))
    throw ServerErrors.PermissionError(
      "request author is not a member of this group"
    );

  const messages = await prisma.groupMessage.findMany({
    where: { groupId: id },
    orderBy: { createdAt: "asc" },
  });

  return { ...group, users: groupUsers, messages };
};

export type GroupWithUsers = Prisma.PromiseReturnType<
  typeof groupByIdWithUsers
>;

export const checkUserEmailIsGroupAdmin = (
  group: GroupWithUsers,
  email: string
) => !!group.users.find((u) => u.user.email === email && u.admin);

export const groupByIdWithUsersWithAdminPermission = async (
  id: string,
  requestAuthorEmail: string
): Promise<GroupWithUsers> => {
  const group: GroupWithUsers = await groupByIdWithUsers(
    id,
    requestAuthorEmail
  );

  if (!checkUserEmailIsGroupAdmin(group, requestAuthorEmail)) {
    throw ServerErrors.PermissionError("request author is not group admin");
  } else {
    return group;
  }
};

export const groupByIdWithMeets = async (
  id: string,
  requestAuthorEmail: string
) => {
  const group: GroupWithUsers = await groupByIdWithUsers(
    id,
    requestAuthorEmail
  );

  const meets = await prisma.meet.findMany({
    where: { groupId: id },
    include: { meetVotes: { include: { place: true, user: true } } },
    orderBy: { day: "desc" },
    take: 5,
  });

  return { ...group, meets };
};

export type GroupWithMeets = Prisma.PromiseReturnType<
  typeof groupByIdWithMeets
>;

export const addUserToGroup = (groupId: string, userId: string, name: string) =>
  prisma.userGroup.create({ data: { groupId, userId, admin: false, name } });

export const removeUserFromGroup = (groupId: string, userId: string) =>
  prisma.userGroup.delete({ where: { userId_groupId: { groupId, userId } } });

export const updateGroupName = (groupId: string, name: string) =>
  prisma.group.update({ where: { id: groupId }, data: { name } });

export const newMessage = (groupId: string, text: string, authorId: string) =>
  prisma.groupMessage.create({ data: { authorId, text, groupId } });

export const userGroups = (userId: string) =>
  prisma.userGroup
    .findMany({
      select: { groupId: true },
      where: { userId },
    })
    .then((p) => p.map(({ groupId }) => groupId))
    .then((groupIds) =>
      prisma.group.findMany({
        where: { id: { in: groupIds } },
        include: {
          userGroups: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      })
    );
