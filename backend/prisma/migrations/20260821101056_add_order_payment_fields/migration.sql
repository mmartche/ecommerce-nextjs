-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "paymentProvider" TEXT,
ADD COLUMN     "paymentReference" TEXT,
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING';
