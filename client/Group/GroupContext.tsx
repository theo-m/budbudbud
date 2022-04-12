import { createContext, PropsWithChildren, useContext } from "react";
import type { UseQueryResult } from "react-query";
import superjson from "superjson";

import { GroupWithMeets, GroupWithUsers } from "@/server/group/db";
import trpc from "../trpc";

const GroupContext = createContext<{
  id: string;
  groupQuery: UseQueryResult<GroupWithUsers>;
  meetsQuery: UseQueryResult<GroupWithMeets["meets"]>;
} | null>(null);

export const useGroupContext = () => {
  const gc = useContext(GroupContext);
  if (!gc) throw new Error("Element not in a group context");

  return gc;
};

export const GroupContextProvider = ({
  id,
  payload,
  children,
}: PropsWithChildren<{ id: string; payload: string }>) => {
  const groupQuery = trpc.useQuery(["group/byId", id], {
    initialData: () => superjson.parse(payload),
  });

  const meetsQuery = trpc.useQuery(["meet/upcomingForGroupId", id]);

  return (
    <GroupContext.Provider value={{ id, groupQuery, meetsQuery }}>
      {children}
    </GroupContext.Provider>
  );
};
