import { TRPCError } from "@trpc/server";

export class ServerErrors {
  static AuthError = new TRPCError({
    code: "UNAUTHORIZED",
    message: `No user found in context.`,
  });
  static PermissionError = (m: string) =>
    new TRPCError({ code: "FORBIDDEN", message: m });
}
