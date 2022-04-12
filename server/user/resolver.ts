import { createRouter, withAuthentication } from "@/server/router";

export default createRouter().query("me", {
  resolve: withAuthentication((_, me) => {
    return me;
  }),
});
