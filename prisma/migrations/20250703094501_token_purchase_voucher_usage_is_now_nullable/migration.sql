/*
  Warnings:

  - A unique constraint covering the columns `[token_purchase_id]` on the table `VoucherUsage` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `tokenpurchase` DROP FOREIGN KEY `TokenPurchase_voucher_usage_id_fkey`;

-- AlterTable
ALTER TABLE `tokenpurchase` MODIFY `voucher_usage_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `voucherusage` ADD COLUMN `token_purchase_id` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `VoucherUsage_token_purchase_id_key` ON `VoucherUsage`(`token_purchase_id`);

-- AddForeignKey
ALTER TABLE `VoucherUsage` ADD CONSTRAINT `VoucherUsage_token_purchase_id_fkey` FOREIGN KEY (`token_purchase_id`) REFERENCES `TokenPurchase`(`purchase_id`) ON DELETE SET NULL ON UPDATE CASCADE;
