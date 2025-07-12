/*
  Warnings:

  - You are about to alter the column `discount_percentage` on the `voucher` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `Int`.

*/
-- AlterTable
ALTER TABLE `voucher` MODIFY `discount_percentage` INTEGER NOT NULL;
