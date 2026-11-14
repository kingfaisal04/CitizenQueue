import express from 'express';
import {
  requestRecord,
  getMyRequests,
  getRequestDetails,
  getClearances,
  updateDepartmentClearance,
  raiseDispute,
  updateWorkflowStatus,
} from '../controllers/academicRecordController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';
import { enforceSchoolAccess } from '../middleware/schoolAccessMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import {
  requestRecordSchema,
  clearanceActionSchema,
  raiseDisputeSchema,
  updateRequestWorkflowSchema,
} from '../validators/academicRecordValidators.js';

const router = express.Router();

router.use(authenticate);

router.post('/request', validate(requestRecordSchema), requestRecord);
router.post('/requests', validate(requestRecordSchema), requestRecord);
router.get('/requests', getMyRequests);
router.get('/my', getMyRequests);
router.get('/:requestId', getRequestDetails);
router.get('/:requestId/clearance', getClearances);

// Student dispute submission
router.post(
  '/clearance/:clearanceId/dispute',
  validate(raiseDisputeSchema),
  raiseDispute
);

// Officer clearance decision
router.patch(
  '/clearance/:clearanceId',
  requireAdmin,
  enforceSchoolAccess,
  validate(clearanceActionSchema),
  updateDepartmentClearance
);

// Administrative workflow status update
router.patch(
  '/:requestId/status',
  requireAdmin,
  enforceSchoolAccess,
  validate(updateRequestWorkflowSchema),
  updateWorkflowStatus
);

export default router;
