-- CreateTable
CREATE TABLE "meet_votes" (
    "id" TEXT NOT NULL,
    "meetId" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meet_votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "meet_votes_meetId_placeId_userId_key" ON "meet_votes"("meetId", "placeId", "userId");
