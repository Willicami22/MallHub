-- AlterTable
ALTER TABLE "malls" ADD COLUMN     "logo_image_url" TEXT,
ADD COLUMN     "open_hours_json" JSONB,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "social_links_json" JSONB;

-- CreateTable
CREATE TABLE "mall_gallery_images" (
    "id" TEXT NOT NULL,
    "mall_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "label" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mall_gallery_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mall_gallery_images_mall_sort_idx" ON "mall_gallery_images"("mall_id", "sort_order");

-- AddForeignKey
ALTER TABLE "mall_gallery_images" ADD CONSTRAINT "mall_gallery_images_mall_id_fkey" FOREIGN KEY ("mall_id") REFERENCES "malls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
