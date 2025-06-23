-- DropForeignKey
ALTER TABLE `token` DROP FOREIGN KEY `Token_user_id_fkey`;

-- DropIndex
DROP INDEX `Token_user_id_fkey` ON `token`;

-- AlterTable
ALTER TABLE `token` MODIFY `user_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Token` ADD CONSTRAINT `Token_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;
