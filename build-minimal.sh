#!/bin/bash
# Ultra-Minimal Build Script for Checkpoint Creation
# Skips type checking to reduce memory usage
# Type checking should be done separately in development

set -e  # Exit on error

echo "=========================================="
echo "Minimal Build (No Type Checking)"
echo "=========================================="
echo ""

# Function to show memory usage
show_memory() {
    echo "Memory: $(free -h | awk 'NR==2{printf "Used: %s / %s (%.0f%%)", $3, $2, $3*100/$2}')"
}

echo "Starting minimal build process..."
show_memory
echo ""

# Step 1: Clean previous build
echo "Step 1/3: Cleaning..."
rm -rf dist/
rm -rf node_modules/.vite/
echo "✓ Clean complete"
echo ""

# Step 2: Build client with memory limits
echo "Step 2/3: Building client (Vite)..."
NODE_OPTIONS="--max-old-space-size=512 --no-warnings" \
  vite build --config vite.config.checkpoint.ts --mode production
echo "✓ Client build complete"
show_memory
echo ""

# Small delay to allow memory cleanup
sleep 1

# Step 3: Bundle server
echo "Step 3/3: Bundling server (esbuild)..."
esbuild server/_core/index.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outdir=dist \
  --log-level=warning
echo "✓ Server bundle complete"
show_memory
echo ""

echo "=========================================="
echo "✓ Build completed successfully!"
echo "=========================================="
echo ""
echo "Note: Type checking skipped for memory optimization."
echo "Run 'npm run check' separately to verify types."

