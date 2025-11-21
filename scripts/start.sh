#!/bin/bash
set -e

echo "🚀 Starting application..."

# Create database tables
echo "📊 Creating database tables..."
node scripts/create-tables.mjs

# Run migrations to add any missing columns
echo "🔄 Running database migrations..."
node scripts/add-createdby-column.mjs

# Start the server
echo "🌐 Starting server..."
exec pnpm start

