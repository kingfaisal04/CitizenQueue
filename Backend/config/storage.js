import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const isS3Configured = Boolean(
  process.env.STORAGE_PROVIDER === 's3' &&
  process.env.STORAGE_BUCKET &&
  process.env.STORAGE_ACCESS_KEY &&
  process.env.STORAGE_SECRET_KEY
);

let s3Client = null;

if (isS3Configured) {
  const clientConfig = {
    region: process.env.STORAGE_REGION || 'af-south-1',
    credentials: {
      accessKeyId: process.env.STORAGE_ACCESS_KEY,
      secretAccessKey: process.env.STORAGE_SECRET_KEY
    }
  };

  if (process.env.STORAGE_ENDPOINT) {
    clientConfig.endpoint = process.env.STORAGE_ENDPOINT;
    clientConfig.forcePathStyle = true; // Required for MinIO / LocalStack / Cloudflare R2
  }

  s3Client = new S3Client(clientConfig);
}

export const storageConfig = {
  provider: isS3Configured ? 's3' : (process.env.STORAGE_PROVIDER || 'mock'),
  bucket: process.env.STORAGE_BUCKET || 'citizenqueue-vault',
  expirySeconds: Number(process.env.STORAGE_URL_EXPIRATION_SECONDS) || 900,
  maxFileSizeBytes: 5 * 1024 * 1024, // 5 MB maximum
  allowedMimeTypes: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
};

/**
 * Generate a short-lived presigned URL for direct secure client upload
 */
export const generatePresignedUploadUrl = async (storageKey, contentType) => {
  if (storageConfig.provider === 's3' && s3Client) {
    const command = new PutObjectCommand({
      Bucket: storageConfig.bucket,
      Key: storageKey,
      ContentType: contentType
    });
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: storageConfig.expirySeconds });
    return { uploadUrl, storageKey };
  }

  // Safe Mock Fallback for local development and test environments
  return {
    uploadUrl: `https://storage.mock.citizenqueue.edu.gh/upload/${storageKey}?signature=mock_presigned_${Date.now()}`,
    storageKey
  };
};

/**
 * Generate a short-lived presigned URL for secure download/preview
 */
export const generatePresignedDownloadUrl = async (storageKey) => {
  if (storageConfig.provider === 's3' && s3Client) {
    const command = new GetObjectCommand({
      Bucket: storageConfig.bucket,
      Key: storageKey
    });
    return await getSignedUrl(s3Client, command, { expiresIn: storageConfig.expirySeconds });
  }

  return `https://storage.mock.citizenqueue.edu.gh/vault/${storageKey}?signature=mock_download_${Date.now()}`;
};
