-- DropForeignKey
ALTER TABLE `tokenpurchase` DROP FOREIGN KEY `TokenPurchase_user_id_fkey`;

-- DropIndex
DROP INDEX `TokenPurchase_user_id_fkey` ON `tokenpurchase`;

-- AlterTable
ALTER TABLE `tokenpurchase` MODIFY `user_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `TokenPurchase` ADD CONSTRAINT `TokenPurchase_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;
