import { prisma } from "@/server/clients";
import { groupByIdWithUsers } from "@/server/group/db";

export const createMeet = (groupId: string, day: Date) =>
  prisma.meet.create({
    data: {
      groupId,
      day: new Date(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()),
      validated: false,
      placeId: null,
    },
  });

export const meetById = async (id: string, requestAuthorEmail: string) => {
  const meet = await prisma.meet.findUnique({
    where: { id },
    rejectOnNotFound: true,
  });
  const group = await groupByIdWithUsers(meet.groupId, requestAuthorEmail);

  return { ...meet, group };
};

export const voteOnMeet = (meetId: string, userId: string, placeId?: string) =>
  prisma.meetVote.create({
    data: { userId, meetId, placeId: placeId },
  });

export const deleteVote = (meetId: string, placeId: string, userId: string) =>
  prisma.meetVote.delete({
    where: { meetId_placeId_userId: { userId, meetId, placeId } },
  });

export const markValidated = (id: string) =>
  prisma.meet.update({ where: { id }, data: { validated: true } });
