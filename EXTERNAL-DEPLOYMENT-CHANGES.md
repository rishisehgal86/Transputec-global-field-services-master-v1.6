# Code Changes for External Hosting

This document lists all files that need to be added or modified to enable local filesystem storage on your externally hosted server.

## Files to Add (New Files)

### 1. `server/storage-local.ts`
**Purpose:** Local filesystem storage implementation

**Location:** `/var/www/html/fieldpulsego/server/storage-local.ts`

**Code:**
```typescript
/**
 * Local Filesystem Storage Implementation
 * 
 * For self-hosted deployments without S3.
 * Stores files in /uploads directory within application root.
 */

import fs from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';

// Base upload directory (relative to application root)
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Subdirectories for different file types
const MEDIA_DIR = path.join(UPLOAD_DIR, 'media');
const COMMENTS_DIR = path.join(UPLOAD_DIR, 'comments');
const TEMP_DIR = path.join(UPLOAD_DIR, 'temp');

/**
 * Initialize upload directories
 * Creates directories if they don't exist
 */
export async function initializeUploadDirectories() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.mkdir(MEDIA_DIR, { recursive: true });
    await fs.mkdir(COMMENTS_DIR, { recursive: true });
    await fs.mkdir(TEMP_DIR, { recursive: true });
    console.log('[Storage] Local upload directories initialized');
  } catch (error) {
    console.error('[Storage] Failed to initialize upload directories:', error);
    throw error;
  }
}

/**
 * Generate a unique filename to prevent collisions
 */
function generateUniqueFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const basename = path.basename(originalName, ext);
  const timestamp = Date.now();
  const random = randomBytes(8).toString('hex');
  return `${basename}-${timestamp}-${random}${ext}`;
}

/**
 * Determine subdirectory based on file type
 */
function getSubdirectory(relKey: string): string {
  if (relKey.includes('comment') || relKey.includes('attachment')) {
    return COMMENTS_DIR;
  }
  if (relKey.includes('temp')) {
    return TEMP_DIR;
  }
  return MEDIA_DIR;
}

/**
 * Upload file to local filesystem
 * 
 * @param relKey - Relative key/path for the file
 * @param data - File data (Buffer, Uint8Array, or string)
 * @param contentType - MIME type of the file
 * @returns Object with key and public URL
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType?: string
): Promise<{ key: string; url: string }> {
  try {
    // Determine subdirectory
    const subdir = getSubdirectory(relKey);
    
    // Generate unique filename
    const filename = generateUniqueFilename(relKey);
    const filePath = path.join(subdir, filename);
    
    // Convert data to Buffer if needed
    const buffer = Buffer.isBuffer(data) 
      ? data 
      : data instanceof Uint8Array 
        ? Buffer.from(data) 
        : Buffer.from(data, 'utf-8');
    
    // Write file to disk
    await fs.writeFile(filePath, buffer);
    
    // Construct public URL
    // Files will be served from /uploads/* via Express static middleware
    const relativePath = path.relative(UPLOAD_DIR, filePath);
    const url = `/uploads/${relativePath.replace(/\\/g, '/')}`;
    
    console.log('[Storage] File saved locally:', filename);
    
    return {
      key: filename,
      url,
    };
  } catch (error) {
    console.error('[Storage] Failed to save file locally:', error);
    throw new Error('Failed to upload file');
  }
}

/**
 * Get file URL (for local storage, files are already publicly accessible)
 * 
 * @param relKey - Relative key/path for the file
 * @param expiresIn - Not used for local storage (files are always accessible)
 * @returns Object with key and public URL
 */
export async function storageGet(
  relKey: string,
  expiresIn?: number
): Promise<{ key: string; url: string }> {
  // For local storage, construct the URL directly
  const url = `/uploads/${relKey}`;
  
  return {
    key: relKey,
    url,
  };
}

/**
 * Delete file from local filesystem
 * 
 * @param relKey - Relative key/path for the file
 */
export async function storageDelete(relKey: string): Promise<void> {
  try {
    const subdir = getSubdirectory(relKey);
    const filePath = path.join(subdir, relKey);
    
    await fs.unlink(filePath);
    console.log('[Storage] File deleted:', relKey);
  } catch (error) {
    console.error('[Storage] Failed to delete file:', error);
    // Don't throw - file might already be deleted
  }
}

/**
 * Check if file exists
 * 
 * @param relKey - Relative key/path for the file
 */
export async function storageExists(relKey: string): Promise<boolean> {
  try {
    const subdir = getSubdirectory(relKey);
    const filePath = path.join(subdir, relKey);
    
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
```

---

## Files to Modify (Existing Files)

### 2. `server/storage.ts`
**Purpose:** Add feature flag to switch between S3 and local storage

**Location:** `/var/www/html/fieldpulsego/server/storage.ts`

**Changes:** Replace entire file with:

```typescript
/**
 * Storage abstraction layer
 * 
 * Supports two storage backends:
 * 1. Manus Forge API (S3) - For Manus-hosted deployments
 * 2. Local Filesystem - For self-hosted deployments
 * 
 * Set USE_LOCAL_STORAGE=true in .env to use local filesystem storage
 */

import { ENV } from './_core/env';

// Check which storage backend to use
const USE_LOCAL_STORAGE = process.env.USE_LOCAL_STORAGE === 'true';

// Import appropriate storage implementation
let storageImpl: {
  storagePut: (relKey: string, data: Buffer | Uint8Array | string, contentType?: string) => Promise<{ key: string; url: string }>;
  storageGet: (relKey: string, expiresIn?: number) => Promise<{ key: string; url: string }>;
};

if (USE_LOCAL_STORAGE) {
  console.log('[Storage] Using LOCAL FILESYSTEM storage');
  storageImpl = require('./storage-local');
} else {
  console.log('[Storage] Using MANUS FORGE API (S3) storage');
  storageImpl = {
    storagePut: storagePutS3,
    storageGet: storageGetS3,
  };
}

// Export unified interface
export const storagePut = storageImpl.storagePut;
export const storageGet = storageImpl.storageGet;

// ============================================================================
// S3 / Manus Forge API Implementation
// ============================================================================

type StorageConfig = { baseUrl: string; apiKey: string };

function getStorageConfig(): StorageConfig {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

function buildUploadUrl(baseUrl: string, relKey: string): URL {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}

async function buildDownloadUrl(
  baseUrl: string,
  relKey: string,
  apiKey: string
): Promise<string> {
  const downloadApiUrl = new URL(
    "v1/storage/downloadUrl",
    ensureTrailingSlash(baseUrl)
  );
  downloadApiUrl.searchParams.set("path", normalizeKey(relKey));
  const response = await fetch(downloadApiUrl, {
    method: "GET",
    headers: buildAuthHeaders(apiKey),
  });
  return (await response.json()).url;
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function toFormData(
  data: Buffer | Uint8Array | string,
  contentType: string,
  fileName: string
): FormData {
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: contentType })
      : new Blob([data as any], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}

function buildAuthHeaders(apiKey: string): HeadersInit {
  return { Authorization: `Bearer ${apiKey}` };
}

async function storagePutS3(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}

async function storageGetS3(relKey: string): Promise<{ key: string; url: string; }> {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  return {
    key,
    url: await buildDownloadUrl(baseUrl, key, apiKey),
  };
}
```

### 3. `server/_core/index.ts`
**Purpose:** Initialize upload directories and serve static files

**Location:** `/var/www/html/fieldpulsego/server/_core/index.ts`

**Changes:**

1. Add `path` import at the top:
```typescript
import path from 'path';
```

2. Add this code BEFORE the `registerOAuthRoutes(app);` line (around line 48):
```typescript
  // Initialize local storage directories if using local storage
  if (process.env.USE_LOCAL_STORAGE === 'true') {
    const { initializeUploadDirectories } = await import('../storage-local');
    await initializeUploadDirectories();
    
    // Serve uploaded files as static assets
    const uploadsPath = path.join(process.cwd(), 'uploads');
    app.use('/uploads', express.static(uploadsPath));
    console.log('[Storage] Serving uploads from:', uploadsPath);
  }
```

**Complete section should look like:**
```typescript
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
```

---

## Summary of Changes

**New Files (1):**
- `server/storage-local.ts` - Local filesystem storage implementation

**Modified Files (2):**
- `server/storage.ts` - Added feature flag and dual backend support
- `server/_core/index.ts` - Added path import, directory initialization, and static file serving

**Total Lines Changed:** ~300 lines added, ~20 lines modified

