-- AlterTable
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "local_number" TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "open_hours_json" JSONB;
