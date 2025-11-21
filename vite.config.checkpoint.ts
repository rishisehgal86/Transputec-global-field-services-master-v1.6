import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

// Minimal configuration for checkpoint builds
// Reduces memory usage by disabling non-essential features
const plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // Memory-optimized settings
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Aggressive chunking to reduce memory per chunk
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@trpc') || id.includes('@tanstack')) {
              return 'vendor-trpc';
            }
            if (id.includes('leaflet')) {
              return 'vendor-map';
            }
            // All other vendor code
            return 'vendor-other';
          }
        },
      },
      // Reduce parallelization to save memory
      maxParallelFileOps: 2,
    },
    // Reduce chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Use esbuild for faster, lower-memory minification
    minify: 'esbuild',
    // Disable source maps to save memory
    sourcemap: false,
    // Reduce Rollup memory usage
    reportCompressedSize: false,
    // Optimize for memory over speed
    target: 'es2020',
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: [],
  },
  // Reduce logging to save memory
  logLevel: 'error',
});

