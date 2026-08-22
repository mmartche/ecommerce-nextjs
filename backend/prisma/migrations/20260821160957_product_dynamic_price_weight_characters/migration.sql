-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "characters" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "baseWeightGrams" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pricePerKey" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "weightPerKeyGrams" INTEGER NOT NULL DEFAULT 0;
