#!/bin/bash
# Memory-Optimized Sequential Build Script
# Forces sequential execution and memory cleanup between steps

set -e  # Exit on error

echo "=========================================="
echo "Memory-Optimized Sequential Build"
echo "=========================================="
echo ""

# Function to show memory usage
show_memory() {
    echo "Memory: $(free -h | awk 'NR==2{printf "Used: %s / %s (%.0f%%)", $3, $2, $3*100/$2}')"
}

# Function to force garbage collection (Node.js)
cleanup_memory() {
    echo "Forcing garbage collection..."
    sleep 2
    sync
    echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true
}

echo "Starting build process..."
show_memory
echo ""

# Step 1: Clean previous build
echo "Step 1/3: Cleaning previous build..."
rm -rf dist/
rm -rf node_modules/.vite/
echo "✓ Clean complete"
show_memory
echo ""

# Step 2: Build client with Vite (most memory-intensive)
echo "Step 2/3: Building client (Vite)..."
NODE_OPTIONS="--max-old-space-size=768" vite build --config vite.config.checkpoint.ts
echo "✓ Client build complete"
show_memory
cleanup_memory
echo ""

# Step 3: Bundle server with esbuild (lighter)
echo "Step 3/3: Bundling server (esbuild)..."
esbuild server/_core/index.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outdir=dist
echo "✓ Server bundle complete"
show_memory
echo ""

echo "=========================================="
echo "✓ Build completed successfully!"
echo "=========================================="
show_memory

