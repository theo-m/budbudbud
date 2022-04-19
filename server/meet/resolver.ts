import { z } from "zod";

import { createRouter, withAuthentication } from "@/server/router";
import {
  checkUserEmailIsGroupAdmin,
  groupByIdWithMeets,
  groupByIdWithUsers,
  GroupWithMeets,
} from "@/server/group/db";
import {
  createMeet,
  deleteVote,
  markValidated,
  meetById,
  voteOnMeet,
} from "@/server/meet/db";
import { Place } from "@prisma/client";
import { createPlace, placeById } from "@/server/place/db";
import { ServerErrors } from "@/server/errors";

export default createRouter()
  .query("upcomingForGroupId", {
    input: z.string().cuid(),
    resolve: withAuthentication(async (id, me) => {
      const group: GroupWithMeets = await groupByIdWithMeets(id, me.email);
      return group.meets;
    }),
  })

  .mutation("create", {
    input: z.object({
      groupId: z.string().cuid(),
      day: z.date(),
    }),
    resolve: withAuthentication(async ({ groupId, day }, me) => {
      const group = await groupByIdWithUsers(groupId, me.email);

      const meet = await createMeet(group.id, day);

      await voteOnMeet(meet.id, me.id);
      return meet;
    }),
  })

  .mutation("vote", {
    input: z.object({
      meetId: z.string().cuid(),
      place: z
        .discriminatedUnion("type", [
          z.object({ type: z.literal("new"), address: z.string().nonempty() }),
          z.object({ type: z.literal("existing"), id: z.string().cuid() }),
        ])
        .optional(),
    }),
    resolve: withAuthentication(async ({ meetId, place: placeInput }, me) => {
      const meet = await meetById(meetId, me.email);

      let place: Place | undefined;
      if (placeInput) {
        switch (placeInput.type) {
          case "new":
            place = await createPlace(placeInput.address);
            break;
          case "existing":
            place = await placeById(placeInput.id);
        }
        await voteOnMeet(meet.id, me.id);
      }

      await voteOnMeet(meet.id, me.id, place?.id);
    }),
  })

  .mutation("removeVote", {
    input: z.object({
      meetId: z.string().cuid(),
      placeId: z.string().cuid().optional(),
    }),
    resolve: withAuthentication(async ({ meetId, placeId }, me) => {
      await deleteVote(meetId, me.id, placeId);
      return;
    }),
  })

  .mutation("validate", {
    input: z.object({
      id: z.string().cuid(),
      placeId: z.string().cuid().optional(),
    }),
    resolve: withAuthentication(async ({ id, placeId }, me) => {
      const meet = await meetById(id, me.email);
      if (!checkUserEmailIsGroupAdmin(meet.group, me.email))
        throw ServerErrors.PermissionError("only admins can validate events");

      await markValidated(id);

      // TODO: send calendar files to members
      // https://postmarkapp.com/support/article/1101-how-do-i-send-calendar-invites-with-postmark
      // need this? probly not:
      // https://github.com/sebbo2002/ical-generator
    }),
  });
