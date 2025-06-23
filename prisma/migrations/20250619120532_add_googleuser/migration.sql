/*
  Warnings:

  - A unique constraint covering the columns `[google_user_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `formsubmission` ADD COLUMN `google_user_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `token` ADD COLUMN `google_user_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `tokenpurchase` ADD COLUMN `google_user_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `google_user_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `voucherusage` ADD COLUMN `google_user_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `webtraffic` ADD COLUMN `google_user_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `GoogleUser` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `google_id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(100) NULL,
    `first_name` VARCHAR(100) NULL,
    `last_name` VARCHAR(100) NULL,
    `profile_picture` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `GoogleUser_google_id_key`(`google_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_GoogleUserToVoucher` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_GoogleUserToVoucher_AB_unique`(`A`, `B`),
    INDEX `_GoogleUserToVoucher_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_google_user_id_key` ON `User`(`google_user_id`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_google_user_id_fkey` FOREIGN KEY (`google_user_id`) REFERENCES `GoogleUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WebTraffic` ADD CONSTRAINT `WebTraffic_google_user_id_fkey` FOREIGN KEY (`google_user_id`) REFERENCES `GoogleUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FormSubmission` ADD CONSTRAINT `FormSubmission_google_user_id_fkey` FOREIGN KEY (`google_user_id`) REFERENCES `GoogleUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Token` ADD CONSTRAINT `Token_google_user_id_fkey` FOREIGN KEY (`google_user_id`) REFERENCES `GoogleUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VoucherUsage` ADD CONSTRAINT `VoucherUsage_google_user_id_fkey` FOREIGN KEY (`google_user_id`) REFERENCES `GoogleUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TokenPurchase` ADD CONSTRAINT `TokenPurchase_google_user_id_fkey` FOREIGN KEY (`google_user_id`) REFERENCES `GoogleUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GoogleUserToVoucher` ADD CONSTRAINT `_GoogleUserToVoucher_A_fkey` FOREIGN KEY (`A`) REFERENCES `GoogleUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GoogleUserToVoucher` ADD CONSTRAINT `_GoogleUserToVoucher_B_fkey` FOREIGN KEY (`B`) REFERENCES `Voucher`(`voucher_id`) ON DELETE CASCADE ON UPDATE CASCADE;
