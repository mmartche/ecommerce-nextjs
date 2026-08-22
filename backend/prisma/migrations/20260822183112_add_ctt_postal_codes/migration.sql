/*
  Warnings:

  - You are about to drop the column `county` on the `PostalCode` table. All the data in the column will be lost.
  - You are about to drop the column `district` on the `PostalCode` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `PostalCode` table. All the data in the column will be lost.
  - You are about to drop the column `street` on the `PostalCode` table. All the data in the column will be lost.
  - Added the required column `countyCode` to the `PostalCode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `districtCode` to the `PostalCode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `localityCode` to the `PostalCode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postalCode3` to the `PostalCode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postalCode4` to the `PostalCode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postalDesignation` to the `PostalCode` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "PostalCode_postalCode_key";

-- AlterTable
ALTER TABLE "PostalCode" DROP COLUMN "county",
DROP COLUMN "district",
DROP COLUMN "postalCode",
DROP COLUMN "street",
ADD COLUMN     "countyCode" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "districtCode" TEXT NOT NULL,
ADD COLUMN     "extra1" TEXT,
ADD COLUMN     "extra2" TEXT,
ADD COLUMN     "extra3" TEXT,
ADD COLUMN     "extra4" TEXT,
ADD COLUMN     "localityCode" TEXT NOT NULL,
ADD COLUMN     "postalCode3" TEXT NOT NULL,
ADD COLUMN     "postalCode4" TEXT NOT NULL,
ADD COLUMN     "postalDesignation" TEXT NOT NULL,
ADD COLUMN     "rawLine" TEXT,
ADD COLUMN     "streetCode" TEXT,
ADD COLUMN     "streetName" TEXT,
ADD COLUMN     "streetPreposition" TEXT,
ADD COLUMN     "streetPreposition2" TEXT,
ADD COLUMN     "streetTitle" TEXT,
ADD COLUMN     "streetType" TEXT;

-- CreateIndex
CREATE INDEX "PostalCode_postalCode4_postalCode3_idx" ON "PostalCode"("postalCode4", "postalCode3");

-- CreateIndex
CREATE INDEX "PostalCode_locality_idx" ON "PostalCode"("locality");

-- CreateIndex
CREATE INDEX "PostalCode_streetCode_idx" ON "PostalCode"("streetCode");
