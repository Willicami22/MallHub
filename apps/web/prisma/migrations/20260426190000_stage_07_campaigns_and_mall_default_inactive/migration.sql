-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CampaignBannerType" AS ENUM ('IMAGE', 'NATIVE_CARD');

-- AlterTable
ALTER TABLE "malls" ALTER COLUMN "status" SET DEFAULT 'INACTIVE';

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "advertiser_name" TEXT NOT NULL,
    "banner_type" "CampaignBannerType" NOT NULL,
    "image_url" TEXT NOT NULL,
    "destination_url" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "activated_at" TIMESTAMP(3),
    "paused_at" TIMESTAMP(3),
    "expired_at" TIMESTAMP(3),
    "created_by_user_id" TEXT,
    "updated_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_target_malls" (
    "campaign_id" TEXT NOT NULL,
    "mall_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_target_malls_pkey" PRIMARY KEY ("campaign_id","mall_id")
);

-- CreateTable
CREATE TABLE "campaign_daily_metrics" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "metric_date" DATE NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_daily_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "campaigns_status_schedule_idx" ON "campaigns"("status", "starts_at", "ends_at");

-- CreateIndex
CREATE INDEX "campaigns_advertiser_name_idx" ON "campaigns"("advertiser_name");

-- CreateIndex
CREATE INDEX "campaigns_created_at_idx" ON "campaigns"("created_at");

-- CreateIndex
CREATE INDEX "campaign_target_malls_mall_id_idx" ON "campaign_target_malls"("mall_id");

-- CreateIndex
CREATE INDEX "campaign_daily_metrics_metric_date_idx" ON "campaign_daily_metrics"("metric_date");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_daily_metrics_campaign_date_key" ON "campaign_daily_metrics"("campaign_id", "metric_date");

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_target_malls" ADD CONSTRAINT "campaign_target_malls_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_target_malls" ADD CONSTRAINT "campaign_target_malls_mall_id_fkey" FOREIGN KEY ("mall_id") REFERENCES "malls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_daily_metrics" ADD CONSTRAINT "campaign_daily_metrics_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
