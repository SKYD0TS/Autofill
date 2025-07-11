/*
  Warnings:

  - Added the required column `purchase_status` to the `TokenPurchase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `tokenpurchase` ADD COLUMN `purchase_status` ENUM('unpaid', 'paid') NOT NULL;
