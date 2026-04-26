-- CreateEnum
CREATE TYPE "BillingTargetType" AS ENUM ('MALL', 'STORE');

-- CreateEnum
CREATE TYPE "BillingPlanCode" AS ENUM ('BASIC', 'STANDARD', 'PREMIUM');

-- CreateEnum
CREATE TYPE "BillingSubscriptionStatus" AS ENUM ('ACTIVE', 'OVERDUE', 'SUSPENDED');

-- CreateTable
CREATE TABLE "billing_subscriptions" (
    "id" TEXT NOT NULL,
    "target_type" "BillingTargetType" NOT NULL,
    "mall_id" TEXT,
    "store_id" TEXT,
    "plan_code" "BillingPlanCode" NOT NULL,
    "status" "BillingSubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3),
    "next_payment_due_at" TIMESTAMP(3),
    "last_payment_at" TIMESTAMP(3),
    "created_by_user_id" TEXT,
    "updated_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_subscriptions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "billing_subscriptions_target_entity_check" CHECK (
        ("target_type" = 'MALL' AND "mall_id" IS NOT NULL AND "store_id" IS NULL)
        OR
        ("target_type" = 'STORE' AND "store_id" IS NOT NULL AND "mall_id" IS NULL)
    )
);

-- CreateTable
CREATE TABLE "billing_payments" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paid_at" TIMESTAMP(3) NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "registered_by_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_collection_alerts" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "reason" TEXT,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_collection_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "billing_subscriptions_mall_id_key" ON "billing_subscriptions"("mall_id");

-- CreateIndex
CREATE UNIQUE INDEX "billing_subscriptions_store_id_key" ON "billing_subscriptions"("store_id");

-- CreateIndex
CREATE INDEX "billing_subscriptions_target_status_due_idx" ON "billing_subscriptions"("target_type", "status", "next_payment_due_at");

-- CreateIndex
CREATE INDEX "billing_subscriptions_plan_code_idx" ON "billing_subscriptions"("plan_code");

-- CreateIndex
CREATE INDEX "billing_payments_subscription_paid_at_idx" ON "billing_payments"("subscription_id", "paid_at");

-- CreateIndex
CREATE INDEX "billing_payments_registered_by_user_id_idx" ON "billing_payments"("registered_by_user_id");

-- CreateIndex
CREATE INDEX "billing_collection_alerts_subscription_sent_at_idx" ON "billing_collection_alerts"("subscription_id", "sent_at");

-- CreateIndex
CREATE INDEX "billing_collection_alerts_created_by_user_id_idx" ON "billing_collection_alerts"("created_by_user_id");

-- BackfillData
INSERT INTO "billing_subscriptions" (
    "id",
    "target_type",
    "mall_id",
    "plan_code",
    "status",
    "current_period_start",
    "current_period_end",
    "next_payment_due_at",
    "created_at",
    "updated_at"
)
SELECT
    concat('bsub_mall_', md5(random()::text || clock_timestamp()::text || m."id")) AS "id",
    'MALL'::"BillingTargetType" AS "target_type",
    m."id" AS "mall_id",
    'BASIC'::"BillingPlanCode" AS "plan_code",
    'ACTIVE'::"BillingSubscriptionStatus" AS "status",
    CURRENT_TIMESTAMP AS "current_period_start",
    CURRENT_TIMESTAMP + interval '30 day' AS "current_period_end",
    CURRENT_TIMESTAMP + interval '30 day' AS "next_payment_due_at",
    CURRENT_TIMESTAMP AS "created_at",
    CURRENT_TIMESTAMP AS "updated_at"
FROM "malls" m
LEFT JOIN "billing_subscriptions" bs ON bs."mall_id" = m."id"
WHERE bs."id" IS NULL;

-- BackfillData
INSERT INTO "billing_subscriptions" (
    "id",
    "target_type",
    "store_id",
    "plan_code",
    "status",
    "current_period_start",
    "current_period_end",
    "next_payment_due_at",
    "created_at",
    "updated_at"
)
SELECT
    concat('bsub_store_', md5(random()::text || clock_timestamp()::text || s."id")) AS "id",
    'STORE'::"BillingTargetType" AS "target_type",
    s."id" AS "store_id",
    'BASIC'::"BillingPlanCode" AS "plan_code",
    'ACTIVE'::"BillingSubscriptionStatus" AS "status",
    CURRENT_TIMESTAMP AS "current_period_start",
    CURRENT_TIMESTAMP + interval '30 day' AS "current_period_end",
    CURRENT_TIMESTAMP + interval '30 day' AS "next_payment_due_at",
    CURRENT_TIMESTAMP AS "created_at",
    CURRENT_TIMESTAMP AS "updated_at"
FROM "stores" s
LEFT JOIN "billing_subscriptions" bs ON bs."store_id" = s."id"
WHERE bs."id" IS NULL;

-- AddForeignKey
ALTER TABLE "billing_subscriptions" ADD CONSTRAINT "billing_subscriptions_mall_id_fkey" FOREIGN KEY ("mall_id") REFERENCES "malls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_subscriptions" ADD CONSTRAINT "billing_subscriptions_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_subscriptions" ADD CONSTRAINT "billing_subscriptions_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_subscriptions" ADD CONSTRAINT "billing_subscriptions_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_payments" ADD CONSTRAINT "billing_payments_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "billing_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_payments" ADD CONSTRAINT "billing_payments_registered_by_user_id_fkey" FOREIGN KEY ("registered_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_collection_alerts" ADD CONSTRAINT "billing_collection_alerts_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "billing_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_collection_alerts" ADD CONSTRAINT "billing_collection_alerts_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
