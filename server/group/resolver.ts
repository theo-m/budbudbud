import { z } from "zod";

import { createRouter, withAuthentication } from "@/server/router";
import { prisma } from "@/server/clients";
import {
  addUserToGroup,
  groupByIdWithUsers,
  GroupWithUsers,
  updateGroupName,
} from "@/server/group/db";
import { ServerErrors } from "@/server/errors";
import { getUserByEmailOrNull } from "@/server/user/db";

export default createRouter()
  .query("byId", {
    input: z.string().cuid(),
    resolve: withAuthentication(async (id, me) => {
      const group: GroupWithUsers = await groupByIdWithUsers(id);
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
      const group = await groupByIdWithUsers(groupId);
      const rel = group.users.find((u) => u.user.email === me.email);
      if (!rel || !rel.admin)
        throw ServerErrors.PermissionError("need to be admin of the group");

      if (group.users.find((u) => u.user.email === userEmail)) return;

      const existingUser = await getUserByEmailOrNull(userEmail);
      if (existingUser) {
        await addUserToGroup(groupId, existingUser.id);
        return;
      }
      // TODO: send invite
      // const newUser = await PrismaAdapter(prisma).createUser({ email: "" });
      // await PrismaAdapter(prisma).createVerificationToken("bobom");
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
      const group = await groupByIdWithUsers(id);
      const rel = group.users.find((u) => u.user.email === me.email);
      if (!rel || !rel.admin)
        throw ServerErrors.PermissionError("need to be admin of the group");
      await updateGroupName(id, name);
      return;
    }),
  });
