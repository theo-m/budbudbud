import { prisma } from "@/server/clients";

export const getUserByIdOrNull = (id: string) =>
  prisma.user.findUnique({ where: { id } });
export const getUserByEmailOrNull = (email: string) =>
  prisma.user.findUnique({ where: { email } });

export const markUserInvitedBy = (
  userId: string,
  inviterId: string,
  date: Date
) =>
  prisma.user.update({
    where: { id: userId },
    data: { invitedById: inviterId, invitedAt: date },
  });
