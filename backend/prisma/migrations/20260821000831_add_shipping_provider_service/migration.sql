-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingProvider" TEXT,
ADD COLUMN     "shippingService" TEXT,
ALTER COLUMN "totalWeightGrams" DROP DEFAULT;
