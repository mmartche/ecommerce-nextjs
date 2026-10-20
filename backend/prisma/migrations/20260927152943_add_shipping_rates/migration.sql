-- CreateTable
CREATE TABLE "ShippingRate" (
    "id" SERIAL NOT NULL,
    "provider" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "zoneName" TEXT NOT NULL,
    "postalCodeFrom" INTEGER NOT NULL,
    "postalCodeTo" INTEGER NOT NULL,
    "minWeightGrams" INTEGER NOT NULL,
    "maxWeightGrams" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "estimatedDelivery" TEXT,
    "deliveryNote" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShippingRate_postalCodeFrom_postalCodeTo_idx" ON "ShippingRate"("postalCodeFrom", "postalCodeTo");

-- CreateIndex
CREATE INDEX "ShippingRate_minWeightGrams_maxWeightGrams_idx" ON "ShippingRate"("minWeightGrams", "maxWeightGrams");

-- CreateIndex
CREATE INDEX "ShippingRate_active_idx" ON "ShippingRate"("active");
