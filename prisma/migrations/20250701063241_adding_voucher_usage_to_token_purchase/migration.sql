/*
  Warnings:

  - A unique constraint covering the columns `[voucher_usage_id]` on the table `TokenPurchase` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `voucher_usage_id` to the `TokenPurchase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `tokenpurchase` ADD COLUMN `voucher_usage_id` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `TokenPurchase_voucher_usage_id_key` ON `TokenPurchase`(`voucher_usage_id`);

-- AddForeignKey
ALTER TABLE `TokenPurchase` ADD CONSTRAINT `TokenPurchase_voucher_usage_id_fkey` FOREIGN KEY (`voucher_usage_id`) REFERENCES `VoucherUsage`(`usage_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
