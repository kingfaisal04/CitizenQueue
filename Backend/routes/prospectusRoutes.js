import express from 'express';
import {
  getProspectusCatalog,
  getStudentProspectus,
  toggleItemStatus,
  uploadItemPhoto,
  reviewItemPhoto,
  createProspectusItem,
} from '../controllers/prospectusController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';
import { enforceSchoolAccess } from '../middleware/schoolAccessMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import {
  toggleItemStatusSchema,
  uploadItemPhotoSchema,
  reviewProspectusItemSchema,
  createProspectusItemSchema,
} from '../validators/prospectusValidators.js';

const router = express.Router();

router.get('/catalog', getProspectusCatalog);

router.use(authenticate);

router.get('/me', getStudentProspectus);
router.patch('/item-status', validate(toggleItemStatusSchema), toggleItemStatus);
router.post('/item-photo', validate(uploadItemPhotoSchema), uploadItemPhoto);

// Administrative routes
router.patch(
  '/:admissionId/item-review',
  requireAdmin,
  enforceSchoolAccess,
  validate(reviewProspectusItemSchema),
  reviewItemPhoto
);
router.post(
  '/item',
  requireAdmin,
  enforceSchoolAccess,
  validate(createProspectusItemSchema),
  createProspectusItem
);

export default router;
