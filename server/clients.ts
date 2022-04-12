import { PrismaClient } from "@prisma/client";
import { Client } from "postmark";

export const mailClient = new Client(process.env.POSTMARK_KEY ?? "");

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({ log: [] });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
