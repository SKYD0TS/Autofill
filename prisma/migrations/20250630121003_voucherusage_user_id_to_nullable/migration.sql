-- DropForeignKey
ALTER TABLE `voucherusage` DROP FOREIGN KEY `VoucherUsage_user_id_fkey`;

-- DropIndex
DROP INDEX `VoucherUsage_user_id_fkey` ON `voucherusage`;

-- AlterTable
ALTER TABLE `voucherusage` MODIFY `user_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `VoucherUsage` ADD CONSTRAINT `VoucherUsage_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;
