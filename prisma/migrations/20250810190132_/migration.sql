-- CreateTable
CREATE TABLE `Job` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `runAt` DATETIME(3) NOT NULL,
    `status` ENUM('pending', 'processing', 'done', 'failed', 'failed_no_tokens') NOT NULL DEFAULT 'pending',
    `lastTriedAt` DATETIME(3) NULL,
    `failureReason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
