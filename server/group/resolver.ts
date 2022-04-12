import { z } from "zod";

import { createRouter, withAuthentication } from "@/server/router";
import { prisma } from "@/server/clients";
import {
  addUserToGroup,
  groupByIdWithUsers,
  groupByIdWithUsersWithAdminPermission,
  GroupWithUsers,
  newMessage,
  updateGroupName,
} from "@/server/group/db";
import { ServerErrors } from "@/server/errors";
import { getUserByEmailOrNull } from "@/server/user/db";

export default createRouter()
  .query("byId", {
    input: z.string().cuid(),
    resolve: withAuthentication(async (id, me) => {
      const group: GroupWithUsers = await groupByIdWithUsers(id, me.email);
      if (!group.users.find(({ user }) => user.id === me.id))
        throw ServerErrors.PermissionError("not part of this group");

      return group;
    }),
  })

  .query("mine", {
    resolve: withAuthentication(async (_, me) => {
      const groupIds: string[] = await prisma.userGroup
        .findMany({
          select: { groupId: true },
          where: { userId: { equals: me.id } },
        })
        .then((p) => p.map(({ groupId }) => groupId));

      return await prisma.group.findMany({
        where: { id: { in: groupIds } },
        include: {
          userGroups: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });
    }),
  })

  .mutation("addUser", {
    input: z.object({
      groupId: z.string().cuid(),
      userEmail: z.string().email(),
    }),
    resolve: withAuthentication(async ({ groupId, userEmail }, me) => {
      const group = await groupByIdWithUsersWithAdminPermission(
        groupId,
        me.email
      );

      // early return when user already in
      if (group.users.find((u) => u.user.email === userEmail)) return;

      const existingUser = await getUserByEmailOrNull(userEmail);
      if (existingUser) {
        await addUserToGroup(groupId, existingUser.id);
        return;
      }
      // TODO: send invite

      // here's how to use verification tokens: e.g. to create one and verify it on our own route
      // https://github.com/nextauthjs/next-auth/blob/7a4bf038b119ae65ffbff67645e65d6ab9c4f847/packages/next-auth/src/core/routes/callback.ts#L203-L212
      // here's where it's called:
      // https://github.com/nextauthjs/next-auth/blob/7a4bf038b119ae65ffbff67645e65d6ab9c4f847/packages/next-auth/src/core/index.ts#L120-L133

      // using the adapter is probly the right call:
      // const newUser = await PrismaAdapter(prisma).createUser({ email: "" });
      // await PrismaAdapter(prisma).createVerificationToken("bobom");
      // more on the adapter's logic here:
      // https://github.com/nextauthjs/adapters/blob/main/packages/prisma/src/index.ts#L35-L47
    }),
  })

  .mutation("create", {
    input: z.object({
      name: z.string().nonempty(),
      users: z.array(z.string().cuid()),
    }),
    resolve: withAuthentication(async ({ name, users }, me) => {
      const { id } = await prisma.group.create({ data: { name } });
      await prisma.userGroup.createMany({
        data: [...new Set([...users, me.id])].map((uid) => ({
          groupId: id,
          userId: uid,
          admin: uid === me.id,
        })),
      });
      return id;
    }),
  })

  .mutation("updateName", {
    input: z.object({ id: z.string().cuid(), name: z.string().nonempty() }),
    resolve: withAuthentication(async ({ id, name }, me) => {
      await groupByIdWithUsersWithAdminPermission(id, me.email);
      await updateGroupName(id, name);
      return;
    }),
  })

  .mutation("newMessage", {
    input: z.object({ id: z.string().cuid(), text: z.string().nonempty() }),
    resolve: withAuthentication(async ({ id, text }, me) => {
      const group = await groupByIdWithUsers(id, me.email);
      await newMessage(group.id, text, me.id);
    }),
  });
