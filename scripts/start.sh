#!/bin/bash
set -e

echo "🚀 Starting application..."

# Backup existing data
echo "💾 Backing up database..."
node scripts/backup-database.mjs

# Drop all tables for clean slate
echo "🗑️  Dropping existing tables..."
node scripts/reset-schema.mjs

# Create fresh schema using Drizzle
echo "📊 Creating tables with Drizzle..."
pnpm drizzle-kit push --force

# Start the server
echo "🌐 Starting server..."
exec pnpm start

