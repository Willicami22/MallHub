-- CreateEnum
CREATE TYPE "BillingPaymentMethod" AS ENUM (
    'CASH',
    'BANK_TRANSFER',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'OTHER'
);

-- AlterTable
ALTER TABLE "billing_subscriptions"
ADD COLUMN "recurring_amount" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- BackfillData
UPDATE "billing_subscriptions"
SET "recurring_amount" = CASE
    WHEN "plan_code" = 'BASIC'::"BillingPlanCode" THEN 99.00
    WHEN "plan_code" = 'STANDARD'::"BillingPlanCode" THEN 199.00
    WHEN "plan_code" = 'PREMIUM'::"BillingPlanCode" THEN 399.00
    ELSE 0
END
WHERE "recurring_amount" = 0;

-- AlterTable
ALTER TABLE "billing_payments"
ADD COLUMN "payment_method" "BillingPaymentMethod" NOT NULL DEFAULT 'BANK_TRANSFER';
