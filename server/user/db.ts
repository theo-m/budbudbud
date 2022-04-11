import { prisma } from "@/server/clients";

export const getUserByIdOrNull = (id: string) =>
  prisma.user.findUnique({ where: { id } });
export const getUserByEmailOrNull = (email: string) =>
  prisma.user.findUnique({ where: { email } });
