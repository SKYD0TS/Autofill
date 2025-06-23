-- AlterTable
ALTER TABLE `googleuser` ADD COLUMN `role` ENUM('admin', 'customer') NOT NULL DEFAULT 'customer';
