import { storagePut } from "./storage";
import { randomBytes } from "crypto";

export interface MediaFile {
  url: string;
  type: 'image' | 'video';
  filename: string;
  size: number;
  mimeType: string;
}

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];

// Max file sizes (in bytes)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

/**
 * Validate file type and size
 */
export function validateMediaFile(mimeType: string, size: number): { valid: boolean; error?: string } {
  const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType);
  
  if (!isImage && !isVideo) {
    return {
      valid: false,
      error: 'Invalid file type. Allowed: JPG, PNG, GIF, WEBP, MP4, MOV, AVI, WEBM'
    };
  }
  
  if (isImage && size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `Image file too large. Maximum size: ${MAX_IMAGE_SIZE / 1024 / 1024}MB`
    };
  }
  
  if (isVideo && size > MAX_VIDEO_SIZE) {
    return {
      valid: false,
      error: `Video file too large. Maximum size: ${MAX_VIDEO_SIZE / 1024 / 1024}MB`
    };
  }
  
  return { valid: true };
}

/**
 * Upload media file to S3
 */
export async function uploadMediaFile(
  fileBuffer: Buffer,
  filename: string,
  mimeType: string,
  jobId: number
): Promise<MediaFile> {
  // Validate file
  const validation = validateMediaFile(mimeType, fileBuffer.length);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  // Generate unique filename with random suffix to prevent enumeration
  const ext = filename.split('.').pop() || 'bin';
  const randomSuffix = randomBytes(8).toString('hex');
  const fileKey = `job-${jobId}/comments/${randomSuffix}.${ext}`;
  
  // Upload to S3
  const { url } = await storagePut(fileKey, fileBuffer, mimeType);
  
  // Determine file type
  const type = ALLOWED_IMAGE_TYPES.includes(mimeType) ? 'image' : 'video';
  
  return {
    url,
    type,
    filename,
    size: fileBuffer.length,
    mimeType,
  };
}

/**
 * Parse attachments JSON string to array
 */
export function parseAttachments(attachmentsJson: string | null): MediaFile[] {
  if (!attachmentsJson) return [];
  
  try {
    const parsed = JSON.parse(attachmentsJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('[Media] Failed to parse attachments JSON:', error);
    return [];
  }
}

/**
 * Serialize attachments array to JSON string
 */
export function serializeAttachments(attachments: MediaFile[]): string {
  return JSON.stringify(attachments);
}

