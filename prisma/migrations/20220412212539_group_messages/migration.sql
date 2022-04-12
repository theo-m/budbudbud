-- CreateTable
CREATE TABLE "group_message" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "authorId" TEXT,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "group_message_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "group_message" ADD CONSTRAINT "group_message_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_message" ADD CONSTRAINT "group_message_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
