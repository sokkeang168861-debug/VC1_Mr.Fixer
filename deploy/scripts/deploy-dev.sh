#!/usr/bin/env bash

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/mrfixer}"
BRANCH="${BRANCH:-dev}"

echo "[deploy] app dir: ${APP_DIR}"
echo "[deploy] branch: ${BRANCH}"

cd "${APP_DIR}"

echo "[deploy] updating source"
git fetch origin "${BRANCH}"
git checkout "${BRANCH}"
git pull --ff-only origin "${BRANCH}"

echo "[deploy] backend install"
cd backend
npm ci

echo "[deploy] database migrations"
npx knex migrate:latest --env production --knexfile knexfile.js

echo "[deploy] frontend install/build"
cd ../frontend
npm ci
npm run build

echo "[deploy] restart backend with pm2"
cd ..
pm2 startOrReload deploy/pm2/ecosystem.config.cjs --env production --update-env
pm2 save

echo "[deploy] complete"
