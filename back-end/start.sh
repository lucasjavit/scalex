#!/bin/sh
set -e

echo "🔄 Running database migrations..."
npm run migration:run || echo "⚠️ Migration failed or no migrations to run"

echo "🚀 Starting application..."
exec node dist/src/main.js
