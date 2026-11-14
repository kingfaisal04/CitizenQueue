import express from 'express';
import {
  getProgress,
  getStages,
  getTasks,
  updateStage,
} from '../controllers/admissionController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';
import { enforceSchoolAccess } from '../middleware/schoolAccessMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/progress', getProgress);
router.get('/stages', getStages);
router.get('/tasks', getTasks);
router.put('/:admissionId/stage', requireAdmin, enforceSchoolAccess, updateStage);

export default router;
