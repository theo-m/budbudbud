import { prisma } from "@/server/clients";

export const createPlace = (address: string) =>
  prisma.place.create({ data: { address } });

export const placeById = (id: string) =>
  prisma.place.findUnique({ where: { id }, rejectOnNotFound: true });
