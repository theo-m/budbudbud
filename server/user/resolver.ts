import { createRouter, withAuthentication } from "@/server/router";
import { markUserFirstLogin } from "@/server/user/db";

export default createRouter()
  .query("me", {
    resolve: withAuthentication((_, me) => {
      return me;
    }),
  })
  .mutation("firstLogin", {
    resolve: withAuthentication(async (_, me) => {
      await markUserFirstLogin(me.id);
      return "ok";
    }),
  });
