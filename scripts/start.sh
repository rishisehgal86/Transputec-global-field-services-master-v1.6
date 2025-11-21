#!/bin/bash
set -e

echo "🚀 Starting application..."

# Create database tables
echo "📊 Creating database tables..."
node scripts/create-tables.mjs

# Start the server
echo "🌐 Starting server..."
exec pnpm start

