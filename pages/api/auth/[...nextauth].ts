import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";

import { prisma } from "@/server/clients";

export const env = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`[${key}] not found in environment`);

  return value;
};

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: env("AUTH_SECRET"),
  providers: [
    GoogleProvider({
      clientId: env("GOOGLE_OAUTH_CLIENT_ID"),
      clientSecret: env("GOOGLE_OAUTH_SECRET"),
    }),
    EmailProvider({
      server: env("SMTP_SERVER"),
      from: "ops@scorrilo.com",
    }),
  ],
});
