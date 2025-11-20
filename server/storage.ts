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

