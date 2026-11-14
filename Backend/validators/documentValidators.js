import { z } from 'zod';

export const uploadIntentSchema = z.object({
  documentType: z.enum([
    'placement_slip',
    'bece_result_slip',
    'birth_certificate',
    'medical_report',
    'passport_photo',
    'prospectus_receipt',
    'other',
  ]),
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().min(1, 'MIME type is required'),
  fileSize: z.number().max(15 * 1024 * 1024, 'File size exceeds maximum limit of 15MB'),
  studentId: z.string().optional(),
});

export const confirmUploadSchema = z.object({
  documentId: z.string().min(1, 'Document ID is required'),
  fileKey: z.string().min(1, 'Storage fileKey is required'),
  fileName: z.string().optional(),
  fileSizeBytes: z.number().optional(),
  fileSize: z.string().optional(),
  mimeType: z.string().optional(),
  fileUrl: z.string().optional(),
});

export const reviewDocumentSchema = z.object({
  status: z.enum(['verified', 'rejected', 'under_review', 'pending']),
  feedback: z.string().optional(),
});

export const batchReviewSchema = z.object({
  documentIds: z.array(z.string()).min(1),
  status: z.enum(['verified', 'rejected', 'under_review']),
  feedback: z.string().optional(),
});
