import {
  generatePresignedUploadUrl,
  generatePresignedDownloadUrl,
  storageConfig,
} from '../config/storage.js';
import { ApiError } from '../utils/ApiError.js';

export class StorageService {
  /**
   * Validate file parameters and return short-lived presigned upload URL
   */
  static async createUploadIntent({ studentId, documentType, fileName, fileType, fileSize }) {
    if (!storageConfig.allowedMimeTypes.includes(fileType)) {
      throw ApiError.badRequest(
        `Unsupported file type: ${fileType}. Allowed formats: PDF, JPEG, PNG, WEBP`
      );
    }

    if (fileSize > storageConfig.maxFileSizeBytes) {
      throw ApiError.badRequest(
        `File size (${(fileSize / (1024 * 1024)).toFixed(1)}MB) exceeds maximum allowed limit of ${(storageConfig.maxFileSizeBytes / (1024 * 1024)).toFixed(0)}MB`
      );
    }

    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageKey = `students/${studentId}/${documentType}/${Date.now()}_${sanitizedFileName}`;

    const { uploadUrl } = await generatePresignedUploadUrl(storageKey, fileType);

    return {
      uploadUrl,
      storageKey,
      fileUrl: uploadUrl.split('?')[0],
      expiresIn: storageConfig.expirySeconds,
    };
  }

  /**
   * Get secure download URL for authorized viewer
   */
  static async getDownloadUrl(storageKey) {
    if (!storageKey) {
      throw ApiError.badRequest('Storage key is required to generate download URL');
    }
    return await generatePresignedDownloadUrl(storageKey);
  }
}
