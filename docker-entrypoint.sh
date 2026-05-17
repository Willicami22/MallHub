#!/bin/sh
set -e

echo "[MallHub] Running database migrations..."
cd /app/apps/web
pnpm exec prisma migrate deploy

echo "[MallHub] Running database seed..."
pnpm exec tsx prisma/seed.ts

echo "[MallHub] Starting application..."
exec pnpm exec react-router-serve ./build/server/index.js
