-- CreateEnum
CREATE TYPE "ModerationReportStatus" AS ENUM ('OPEN', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ModerationReportTargetType" AS ENUM (
    'PRODUCT',
    'STORE_PROFILE',
    'MALL_PROFILE',
    'STORE_IMAGE',
    'MALL_IMAGE'
);

-- CreateEnum
CREATE TYPE "ModerationDecisionAction" AS ENUM (
    'PRODUCT_REMOVED',
    'REPORT_DISMISSED',
    'STORE_PROFILE_CORRECTED',
    'MALL_PROFILE_CORRECTED',
    'STORE_IMAGE_REMOVED',
    'MALL_IMAGE_REMOVED'
);

-- AlterTable
ALTER TABLE "malls"
ADD COLUMN "hero_image_url" TEXT;

-- AlterTable
ALTER TABLE "stores"
ADD COLUMN "logo_image_url" TEXT;

-- CreateTable
CREATE TABLE "moderation_reports" (
    "id" TEXT NOT NULL,
    "target_type" "ModerationReportTargetType" NOT NULL,
    "reason" TEXT NOT NULL,
    "details_json" JSONB,
    "status" "ModerationReportStatus" NOT NULL DEFAULT 'OPEN',
    "resolution_action" "ModerationDecisionAction",
    "resolution_reason" TEXT,
    "product_id" TEXT,
    "store_id" TEXT,
    "mall_id" TEXT,
    "reported_by_user_id" TEXT,
    "reviewed_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),

    CONSTRAINT "moderation_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "moderation_reports_status_created_at_idx" ON "moderation_reports"("status", "created_at");

-- CreateIndex
CREATE INDEX "moderation_reports_target_status_created_at_idx" ON "moderation_reports"("target_type", "status", "created_at");

-- CreateIndex
CREATE INDEX "moderation_reports_product_id_idx" ON "moderation_reports"("product_id");

-- CreateIndex
CREATE INDEX "moderation_reports_store_id_idx" ON "moderation_reports"("store_id");

-- CreateIndex
CREATE INDEX "moderation_reports_mall_id_idx" ON "moderation_reports"("mall_id");

-- AddForeignKey
ALTER TABLE "moderation_reports"
ADD CONSTRAINT "moderation_reports_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_reports"
ADD CONSTRAINT "moderation_reports_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_reports"
ADD CONSTRAINT "moderation_reports_mall_id_fkey" FOREIGN KEY ("mall_id") REFERENCES "malls"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_reports"
ADD CONSTRAINT "moderation_reports_reported_by_user_id_fkey" FOREIGN KEY ("reported_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_reports"
ADD CONSTRAINT "moderation_reports_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
