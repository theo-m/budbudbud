import * as trpcNext from "@trpc/server/adapters/next";
import * as trpc from "@trpc/server";
import { inferAsyncReturnType } from "@trpc/server";
import { ProcedureResolver } from "@trpc/server/src/internals/procedure";
import { getSession } from "next-auth/react";

import { ServerErrors } from "./errors";
import { prisma } from "@/server/clients";
import { User } from "@prisma/client";

export async function createContext(opts?: trpcNext.CreateNextContextOptions) {
  if (!opts) throw new Error("");
  // throw new TRPCError({
  //   code: "INTERNAL_SERVER_ERROR",
  //   message: "null request",
  // });

  const session = await getSession({ req: opts.req });
  const user = session?.user;

  return { user, req: opts.req, res: opts.res };
}

export type Context = inferAsyncReturnType<typeof createContext>;

// Helper function to create a router with your app's context
export function createRouter() {
  return trpc.router<Context>();
}

export function withAuthentication<In, Out>(
  fn: (inp: In, user: User, ctx: Context) => Out | Promise<Out>
): ProcedureResolver<Context, In, Out> {
  return async ({ ctx, input }) => {
    if (!ctx.user || !ctx.user.email) throw ServerErrors.AuthError;
    const user = await prisma.user.findUnique({
      where: { email: ctx.user.email },
      rejectOnNotFound: true,
    });

    return fn(input, user, ctx);
  };
}
