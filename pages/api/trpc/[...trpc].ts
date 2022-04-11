import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import superjson from "superjson";

import { Context, createContext } from "@/server/router";
import userRouter from "@/server/user/resolver";
import groupRouter from "@/server/group/resolver";
import meetRouter from "@/server/meet/resolver";
import placeRouter from "@/server/place/resolver";

const appRouter = trpc
  .router<Context>()
  .merge("user/", userRouter)
  .merge("group/", groupRouter)
  .merge("meet/", meetRouter)
  .merge("place/", placeRouter);

// export type definition of API
export type AppRouter = typeof appRouter;

// export API handler
export default trpcNext.createNextApiHandler({
  router: appRouter.transformer(superjson),
  createContext: createContext,
});
