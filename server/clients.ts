import { PrismaClient } from "@prisma/client";
import { Client } from "postmark";

export const mailClient = new Client(process.env.POSTMARK_KEY ?? "");

export const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"],
});
