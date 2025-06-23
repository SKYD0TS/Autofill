/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `Token` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `token_id` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Token_user_id_key` ON `Token`(`user_id`);
