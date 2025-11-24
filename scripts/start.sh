#!/bin/bash
set -e

echo "🚀 Starting application..."

# Run safe migrations (only adds missing columns, never drops data)
if [ -f "scripts/migrate-safe.mjs" ]; then
  echo "🔧 Running safe database migrations..."
  node scripts/migrate-safe.mjs || {
    echo "⚠️  Migration failed, but continuing startup..."
    echo "   Check logs and run migrations manually if needed"
  }
else
  echo "ℹ️  No migration script found, skipping..."
fi

# Start the server
echo "🌐 Starting server..."
exec pnpm start

