/*
  Warnings:

  - You are about to drop the column `amount` on the `Bid` table. All the data in the column will be lost.
  - Added the required column `maxAmount` to the `Bid` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bid" DROP COLUMN "amount",
ADD COLUMN     "maxAmount" DOUBLE PRECISION NOT NULL;
