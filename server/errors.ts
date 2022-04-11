export class ServerErrors {
  // static AuthError = new TRPCError({
  //   code: "UNAUTHORIZED",
  //   message: `No user found in context.`,
  // });
  static AuthError = new Error("unauth");
  static PermissionError = (m: string) => new Error(m);
}
