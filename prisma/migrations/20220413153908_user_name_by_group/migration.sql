/*
  Warnings:

  - Added the required column `name` to the `user_groups` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE user_groups
    ADD COLUMN name TEXT;

UPDATE user_groups ug
SET name = coalesce(u.name, u.email)
FROM users u
WHERE u.id = ug."userId";

ALTER TABLE user_groups
    ALTER COLUMN name SET NOT NULL;