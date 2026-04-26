-- CreateEnum
CREATE TYPE "PlatformServiceKey" AS ENUM (
    'DATABASE',
    'BETTER_AUTH',
    'NOTIFICATIONS',
    'METRICS_PIPELINE'
);

-- CreateEnum
CREATE TYPE "PlatformServiceStatus" AS ENUM (
    'OPERATIONAL',
    'DEGRADED',
    'INCIDENT'
);

-- CreateEnum
CREATE TYPE "PlatformHealthIncidentStatus" AS ENUM ('OPEN', 'RESOLVED');

-- CreateTable
CREATE TABLE "platform_service_snapshots" (
    "id" TEXT NOT NULL,
    "service_key" "PlatformServiceKey" NOT NULL,
    "status" "PlatformServiceStatus" NOT NULL,
    "summary_code" TEXT NOT NULL,
    "summary_params_json" JSONB,
    "metadata_json" JSONB,
    "observed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_service_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_health_incidents" (
    "id" TEXT NOT NULL,
    "service_key" "PlatformServiceKey" NOT NULL,
    "status" "PlatformHealthIncidentStatus" NOT NULL DEFAULT 'OPEN',
    "summary_code" TEXT NOT NULL,
    "summary_params_json" JSONB,
    "metadata_json" JSONB,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_health_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "platform_service_snapshots_service_key_key" ON "platform_service_snapshots"("service_key");

-- CreateIndex
CREATE INDEX "platform_service_snapshots_status_observed_at_idx" ON "platform_service_snapshots"("status", "observed_at");

-- CreateIndex
CREATE INDEX "platform_health_incidents_service_status_started_at_idx" ON "platform_health_incidents"("service_key", "status", "started_at");

-- CreateIndex
CREATE INDEX "platform_health_incidents_status_started_at_idx" ON "platform_health_incidents"("status", "started_at");
