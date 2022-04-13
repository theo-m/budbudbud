import { TRPCError } from "@trpc/server";

export class ServerErrors {
  static AuthError = new TRPCError({
    code: "UNAUTHORIZED",
    message: `No user found in context.`,
  });
  static PermissionError = (m: string) =>
    new TRPCError({ code: "FORBIDDEN", message: m });
  static GenericInternalError = (m: string) =>
    new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: m });
  static GenericBadRequestError = (m?: string) =>
    new TRPCError({ code: "BAD_REQUEST", message: m ?? "Bad request" });
}
