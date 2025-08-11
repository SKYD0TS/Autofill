/*
  Warnings:

  - You are about to drop the column `hasPendingJobs` on the `googleuser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `googleuser` DROP COLUMN `hasPendingJobs`,
    ADD COLUMN `hasPendingJob` BOOLEAN NOT NULL DEFAULT false;
