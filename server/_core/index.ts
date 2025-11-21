import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  // Initialize super admin if no users exist
  const { initializeSuperAdmin } = await import('../auth');
  await initializeSuperAdmin();
  
  const app = express();
  const server = createServer(app);
  
  // Register Stripe webhook endpoint BEFORE JSON body parser
  // Webhooks need raw body for signature verification
  const { registerWebhookEndpoint } = await import('./webhook-middleware');
  registerWebhookEndpoint(app);
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // Initialize local storage directories if using local storage
  if (process.env.USE_LOCAL_STORAGE === 'true') {
    const { initializeUploadDirectories } = await import('../storage-local');
    await initializeUploadDirectories();
    
    // Serve uploaded files as static assets
    const uploadsPath = path.join(process.cwd(), 'uploads');
    app.use('/uploads', express.static(uploadsPath));
    console.log('[Storage] Serving uploads from:', uploadsPath);
  }
  
  // Register test subscription endpoint (development only)
  const { registerTestSubscriptionEndpoint } = await import('../test-subscription-update');
  registerTestSubscriptionEndpoint(app);
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "3000");

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
