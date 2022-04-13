import { z } from "zod";

import { createRouter, withAuthentication } from "@/server/router";
import { mailClient, prisma } from "@/server/clients";
import {
  addUserToGroup,
  groupByIdWithUsers,
  groupByIdWithUsersWithAdminPermission,
  GroupWithUsers,
  newMessage,
  removeUserFromGroup,
  updateGroupName,
} from "@/server/group/db";
import { ServerErrors } from "@/server/errors";
import { getUserByEmailOrNull, markUserInvitedBy } from "@/server/user/db";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import addDays from "date-fns/addDays";
import * as crypto from "crypto";

// not exported by nextauth, borrowed from
// https://github.com/nextauthjs/next-auth/blob/7a4bf038b119ae65ffbff67645e65d6ab9c4f847/packages/next-auth/src/core/routes/callback.ts#L203-L212
function hashToken(token: string) {
  return (
    crypto
      .createHash("sha256")
      // Prefer provider specific secret, but use default secret if none specified
      .update(`${token}${process.env.AUTH_SECRET}`)
      .digest("hex")
  );
}

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

  .mutation("removeUser", {
    input: z.object({ groupId: z.string().cuid(), userId: z.string().cuid() }),
    resolve: withAuthentication(async ({ groupId, userId }, me) => {
      await groupByIdWithUsersWithAdminPermission(groupId, me.email);
      await removeUserFromGroup(groupId, userId);
    }),
  })

  .mutation("addUser", {
    input: z.object({
      groupId: z.string().cuid(),
      name: z.string().nonempty(),
      userEmail: z.string().email(),
    }),
    resolve: withAuthentication(async ({ groupId, userEmail, name }, me) => {
      const group = await groupByIdWithUsersWithAdminPermission(
        groupId,
        me.email
      );

      // early return when user already in
      if (group.users.find((u) => u.user.email === userEmail)) return;

      const existingUser = await getUserByEmailOrNull(userEmail);
      if (existingUser) {
        await addUserToGroup(groupId, existingUser.id, name);
        return;
      }

      const newUser = await PrismaAdapter(prisma).createUser?.({
        email: userEmail,
        emailVerified: null,
      });
      await markUserInvitedBy(newUser.id, me.id, new Date());
      await addUserToGroup(groupId, newUser.id, name);

      const token = crypto.randomBytes(32).toString("hex");
      const secret = await PrismaAdapter(prisma).createVerificationToken?.({
        token: hashToken(token),
        expires: addDays(new Date(), 1),
        identifier: userEmail,
      });
      if (!secret)
        throw ServerErrors.GenericInternalError(
          "could not create verification token"
        );

      const base =
        process.env.NODE_ENV === "production"
          ? process.env.VERCEL_URL
          : "http://localhost:3000";

      const cbUrl = `${base}/signin`;
      const url = `${base}/api/auth/callback/email?callbackUrl=${cbUrl}&token=${token}&email=${userEmail}`;

      await mailClient.sendEmail({
        To: userEmail,
        From: "ops@scorrilo.com",
        TextBody: `${
          me.name ?? me.email
        } has invited you to join their budbudbud group, see what's happening there by clicking here:\n${url}`,
        HtmlBody: `
        <div>Hey there great news you've been invited by ${
          me.name ?? me.email
        } to join their <span style="color: hsl(287,79%,52%)">budbudbud</span></div>
        <div>Simply <a href="${url}">click here</a> to see what's happening there</div>
        `,
        Subject: "You've been invited to budbudbud",
      });
    }),
  })

  .mutation("create", {
    input: z.object({
      name: z.string().nonempty(),
      users: z.array(
        z.object({ id: z.string().cuid(), name: z.string().nonempty() })
      ),
    }),
    resolve: withAuthentication(async ({ name, users }, me) => {
      const { id } = await prisma.group.create({ data: { name } });
      await prisma.userGroup.createMany({
        data: [
          ...new Set([...users, { id: me.id, name: me.name ?? me.email }]),
        ].map((u) => ({
          groupId: id,
          userId: u.id,
          name: u.name,
          admin: u.id === me.id,
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
