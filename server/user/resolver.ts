import { z } from "zod";

import { createRouter } from "@/server/router";

export default createRouter()
  .query("byId", { resolve: () => {} })
  .mutation("updateName", { input: z.string(), resolve: () => {} });
