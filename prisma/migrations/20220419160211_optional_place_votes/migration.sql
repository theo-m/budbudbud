-- DropForeignKey
ALTER TABLE "meet_votes" DROP CONSTRAINT "meet_votes_placeId_fkey";

-- AlterTable
ALTER TABLE "meet_votes" ALTER COLUMN "placeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "meet_votes" ADD CONSTRAINT "meet_votes_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "places"("id") ON DELETE SET NULL ON UPDATE CASCADE;
