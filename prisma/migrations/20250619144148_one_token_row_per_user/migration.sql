/*
  Warnings:

  - A unique constraint covering the columns `[google_user_id]` on the table `Token` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `googleuser` ADD COLUMN `token_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `token` MODIFY `token_count` INTEGER NOT NULL DEFAULT 40;

-- CreateIndex
CREATE UNIQUE INDEX `Token_google_user_id_key` ON `Token`(`google_user_id`);
