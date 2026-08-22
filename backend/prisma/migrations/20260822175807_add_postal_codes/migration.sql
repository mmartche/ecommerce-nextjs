-- CreateTable
CREATE TABLE "PostalCode" (
    "id" SERIAL NOT NULL,
    "postalCode" TEXT NOT NULL,
    "locality" TEXT NOT NULL,
    "district" TEXT,
    "county" TEXT,
    "street" TEXT,

    CONSTRAINT "PostalCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PostalCode_postalCode_key" ON "PostalCode"("postalCode");
