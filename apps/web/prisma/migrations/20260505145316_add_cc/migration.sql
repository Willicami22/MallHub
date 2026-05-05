-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED');

-- AlterTable
ALTER TABLE "malls" ADD COLUMN     "config_map_svg" TEXT;

-- CreateTable
CREATE TABLE "mall_events" (
    "id" TEXT NOT NULL,
    "mall_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mall_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mall_events_mall_status_idx" ON "mall_events"("mall_id", "status");

-- CreateIndex
CREATE INDEX "mall_events_dates_idx" ON "mall_events"("start_date", "end_date");

-- AddForeignKey
ALTER TABLE "mall_events" ADD CONSTRAINT "mall_events_mall_id_fkey" FOREIGN KEY ("mall_id") REFERENCES "malls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
