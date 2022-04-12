-- AddForeignKey
ALTER TABLE "meet_votes" ADD CONSTRAINT "meet_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meet_votes" ADD CONSTRAINT "meet_votes_meetId_fkey" FOREIGN KEY ("meetId") REFERENCES "meets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meet_votes" ADD CONSTRAINT "meet_votes_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;
