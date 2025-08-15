-- CreateEnum
CREATE TYPE "public"."PlanItemKind" AS ENUM ('PLANNED', 'ACTUAL');

-- CreateEnum
CREATE TYPE "public"."PlanItemStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETE', 'CANCELED');

-- CreateTable
CREATE TABLE "public"."Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Site" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductionLine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PunnetSize" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sizeGrams" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PunnetSize_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Fruit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Fruit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FruitVariant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fruitId" TEXT NOT NULL,

    CONSTRAINT "FruitVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "punnetSizeId" TEXT NOT NULL,
    "multiType" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantityPacks" INTEGER NOT NULL,
    "dueAt" TIMESTAMP(3),
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MasterRunRate" (
    "id" TEXT NOT NULL,
    "punnetSizeId" TEXT NOT NULL,
    "lineId" TEXT NOT NULL,
    "packsPerMinute" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "MasterRunRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SpecificRunRate" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "lineId" TEXT NOT NULL,
    "packsPerMinute" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SpecificRunRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MasterChangeover" (
    "id" TEXT NOT NULL,
    "fromPunnetSizeId" TEXT NOT NULL,
    "toPunnetSizeId" TEXT NOT NULL,
    "minutes" INTEGER NOT NULL,

    CONSTRAINT "MasterChangeover_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SpecificChangeover" (
    "id" TEXT NOT NULL,
    "fromProductId" TEXT NOT NULL,
    "toProductId" TEXT NOT NULL,
    "minutes" INTEGER NOT NULL,

    CONSTRAINT "SpecificChangeover_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductVariety" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "fruitVariantId" TEXT NOT NULL,
    "preferred" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProductVariety_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Plan" (
    "id" TEXT NOT NULL,
    "planDate" TIMESTAMP(3) NOT NULL,
    "siteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlanItem" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productionLineId" TEXT NOT NULL,
    "kind" "public"."PlanItemKind" NOT NULL,
    "status" "public"."PlanItemStatus" NOT NULL DEFAULT 'SCHEDULED',
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "setupMinutes" INTEGER NOT NULL,
    "runMinutes" INTEGER NOT NULL,
    "previousItemId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductionLine_siteId_idx" ON "public"."ProductionLine"("siteId");

-- CreateIndex
CREATE INDEX "FruitVariant_fruitId_idx" ON "public"."FruitVariant"("fruitId");

-- CreateIndex
CREATE INDEX "Product_customerId_idx" ON "public"."Product"("customerId");

-- CreateIndex
CREATE INDEX "Product_punnetSizeId_idx" ON "public"."Product"("punnetSizeId");

-- CreateIndex
CREATE INDEX "Order_customerId_idx" ON "public"."Order"("customerId");

-- CreateIndex
CREATE INDEX "Order_productId_idx" ON "public"."Order"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "MasterRunRate_punnetSizeId_lineId_key" ON "public"."MasterRunRate"("punnetSizeId", "lineId");

-- CreateIndex
CREATE UNIQUE INDEX "SpecificRunRate_productId_lineId_key" ON "public"."SpecificRunRate"("productId", "lineId");

-- CreateIndex
CREATE UNIQUE INDEX "MasterChangeover_fromPunnetSizeId_toPunnetSizeId_key" ON "public"."MasterChangeover"("fromPunnetSizeId", "toPunnetSizeId");

-- CreateIndex
CREATE UNIQUE INDEX "SpecificChangeover_fromProductId_toProductId_key" ON "public"."SpecificChangeover"("fromProductId", "toProductId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariety_productId_fruitVariantId_key" ON "public"."ProductVariety"("productId", "fruitVariantId");

-- CreateIndex
CREATE INDEX "Plan_siteId_idx" ON "public"."Plan"("siteId");

-- CreateIndex
CREATE INDEX "Plan_planDate_idx" ON "public"."Plan"("planDate");

-- CreateIndex
CREATE INDEX "PlanItem_planId_idx" ON "public"."PlanItem"("planId");

-- CreateIndex
CREATE INDEX "PlanItem_orderId_idx" ON "public"."PlanItem"("orderId");

-- CreateIndex
CREATE INDEX "PlanItem_productionLineId_idx" ON "public"."PlanItem"("productionLineId");

-- CreateIndex
CREATE INDEX "PlanItem_startAt_idx" ON "public"."PlanItem"("startAt");

-- AddForeignKey
ALTER TABLE "public"."ProductionLine" ADD CONSTRAINT "ProductionLine_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "public"."Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FruitVariant" ADD CONSTRAINT "FruitVariant_fruitId_fkey" FOREIGN KEY ("fruitId") REFERENCES "public"."Fruit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_punnetSizeId_fkey" FOREIGN KEY ("punnetSizeId") REFERENCES "public"."PunnetSize"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MasterRunRate" ADD CONSTRAINT "MasterRunRate_punnetSizeId_fkey" FOREIGN KEY ("punnetSizeId") REFERENCES "public"."PunnetSize"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MasterRunRate" ADD CONSTRAINT "MasterRunRate_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "public"."ProductionLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SpecificRunRate" ADD CONSTRAINT "SpecificRunRate_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SpecificRunRate" ADD CONSTRAINT "SpecificRunRate_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "public"."ProductionLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MasterChangeover" ADD CONSTRAINT "MasterChangeover_fromPunnetSizeId_fkey" FOREIGN KEY ("fromPunnetSizeId") REFERENCES "public"."PunnetSize"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MasterChangeover" ADD CONSTRAINT "MasterChangeover_toPunnetSizeId_fkey" FOREIGN KEY ("toPunnetSizeId") REFERENCES "public"."PunnetSize"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SpecificChangeover" ADD CONSTRAINT "SpecificChangeover_fromProductId_fkey" FOREIGN KEY ("fromProductId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SpecificChangeover" ADD CONSTRAINT "SpecificChangeover_toProductId_fkey" FOREIGN KEY ("toProductId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductVariety" ADD CONSTRAINT "ProductVariety_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductVariety" ADD CONSTRAINT "ProductVariety_fruitVariantId_fkey" FOREIGN KEY ("fruitVariantId") REFERENCES "public"."FruitVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Plan" ADD CONSTRAINT "Plan_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "public"."Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlanItem" ADD CONSTRAINT "PlanItem_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlanItem" ADD CONSTRAINT "PlanItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlanItem" ADD CONSTRAINT "PlanItem_productionLineId_fkey" FOREIGN KEY ("productionLineId") REFERENCES "public"."ProductionLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlanItem" ADD CONSTRAINT "PlanItem_previousItemId_fkey" FOREIGN KEY ("previousItemId") REFERENCES "public"."PlanItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
