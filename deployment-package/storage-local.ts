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

