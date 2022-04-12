import { z } from "zod";

import { createRouter, withAuthentication } from "@/server/router";
import {
  groupByIdWithMeets,
  groupByIdWithUsers,
  GroupWithMeets,
} from "@/server/group/db";
import { createMeet, deleteVote, meetById, voteOnMeet } from "@/server/meet/db";
import { Place } from "@prisma/client";
import { createPlace, placeById } from "@/server/place/db";

export default createRouter()
  .query("upcomingForGroupId", {
    input: z.string().cuid(),
    resolve: withAuthentication(async (id, me) => {
      const group: GroupWithMeets = await groupByIdWithMeets(id, me.email);
      return group;
    }),
  })

  .mutation("create", {
    input: z.object({
      groupId: z.string().cuid(),
      day: z.date(),
      placeAddress: z.string().nonempty(),
    }),
    resolve: withAuthentication(async ({ groupId, day, placeAddress }, me) => {
      const group = await groupByIdWithUsers(groupId, me.email);
      const meet = await createMeet(group.id, day);
      return meet;
    }),
  })

  .mutation("vote", {
    input: z.object({
      meetId: z.string().cuid(),
      place: z.discriminatedUnion("type", [
        z.object({ type: z.literal("new"), address: z.string().nonempty() }),
        z.object({ type: z.literal("existing"), id: z.string().cuid() }),
      ]),
    }),
    resolve: withAuthentication(async ({ meetId, place: placeInput }, me) => {
      const meet = await meetById(meetId, me.email);

      let place: Place;
      switch (placeInput.type) {
        case "new":
          place = await createPlace(placeInput.address);
          break;
        case "existing":
          place = await placeById(placeInput.id);
      }

      await voteOnMeet(meet.id, place.id, me.id);
    }),
  })

  .mutation("removeVote", {
    input: z.object({ meetId: z.string().cuid(), placeId: z.string().cuid() }),
    resolve: withAuthentication(({ meetId, placeId }, me) =>
      deleteVote(meetId, placeId, me.id)
    ),
  });
