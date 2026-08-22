-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippedAt" TIMESTAMP(3),
ADD COLUMN     "trackingCode" TEXT,
ADD COLUMN     "trackingUrl" TEXT;
