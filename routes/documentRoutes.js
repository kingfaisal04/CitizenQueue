import express from 'express';
import {
  getDocuments,
  createUploadIntent,
  confirmUpload,
  getDownloadUrl,
  reviewDocument,
  batchReviewDocuments,
} from '../controllers/documentController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';
import { enforceSchoolAccess } from '../middleware/schoolAccessMiddleware.js';
import { uploadLimiter } from '../middleware/rateLimitMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import {
  uploadIntentSchema,
  confirmUploadSchema,
  reviewDocumentSchema,
  batchReviewSchema,
} from '../validators/documentValidators.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getDocuments);
router.post('/upload-intent', uploadLimiter, validate(uploadIntentSchema), createUploadIntent);
router.post('/confirm', validate(confirmUploadSchema), confirmUpload);
router.get('/:documentId/download', getDownloadUrl);

// Administrative review routes
router.patch(
  '/:documentId/review',
  requireAdmin,
  enforceSchoolAccess,
  validate(reviewDocumentSchema),
  reviewDocument
);
router.post(
  '/batch-review',
  requireAdmin,
  enforceSchoolAccess,
  validate(batchReviewSchema),
  batchReviewDocuments
);

export default router;
