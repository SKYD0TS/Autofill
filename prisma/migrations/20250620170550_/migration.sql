/*
  Warnings:

  - You are about to drop the column `google_user_id` on the `token` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `token` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `token` DROP FOREIGN KEY `Token_google_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `token` DROP FOREIGN KEY `Token_user_id_fkey`;

-- DropIndex
DROP INDEX `Token_google_user_id_key` ON `token`;

-- DropIndex
DROP INDEX `Token_user_id_key` ON `token`;

-- AlterTable
ALTER TABLE `token` DROP COLUMN `google_user_id`,
    DROP COLUMN `user_id`;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_token_id_fkey` FOREIGN KEY (`token_id`) REFERENCES `Token`(`token_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GoogleUser` ADD CONSTRAINT `GoogleUser_token_id_fkey` FOREIGN KEY (`token_id`) REFERENCES `Token`(`token_id`) ON DELETE SET NULL ON UPDATE CASCADE;
