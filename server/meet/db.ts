import { prisma } from "@/server/clients";
import { groupByIdWithUsers } from "@/server/group/db";

export const createMeet = (groupId: string, day: Date) =>
  prisma.meet.create({
    data: { groupId, day, validated: false, placeId: null },
  });

export const meetById = async (id: string, requestAuthorEmail: string) => {
  const meet = await prisma.meet.findUnique({
    where: { id },
    rejectOnNotFound: true,
  });
  await groupByIdWithUsers(meet.groupId, requestAuthorEmail);
  return meet;
};

export const voteOnMeet = async (
  meetId: string,
  placeId: string,
  userId: string
) => prisma.meetVote.create({ data: { userId, meetId, placeId } });

export const deleteVote = async (
  meetId: string,
  placeId: string,
  userId: string
) =>
  prisma.meetVote.delete({
    where: { meetId_placeId_userId: { userId, meetId, placeId } },
  });
