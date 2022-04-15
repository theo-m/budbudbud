import { createContext, PropsWithChildren, useContext } from "react";
import type { UseQueryResult } from "react-query";

import { User } from "@prisma/client";
import trpc from "./trpc";
import { useSession } from "next-auth/react";

const UserContext = createContext<{ userQuery: UseQueryResult<User> } | null>(
  null
);

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("Out of UserContext");

  return ctx;
};

export const UserContextProvider = ({ children }: PropsWithChildren<{}>) => {
  const session = useSession();
  const userQuery = trpc.useQuery(["user/me"], {
    enabled: session.status === "authenticated",
  });

  return (
    <UserContext.Provider value={{ userQuery }}>
      {children}
    </UserContext.Provider>
  );
};
