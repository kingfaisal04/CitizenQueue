import express from 'express';
import {
  listSchools,
  getSchoolDetails,
  getSchoolServices,
  getSchoolProspectus,
  getPublicSystemAnalytics,
} from '../controllers/schoolController.js';

const router = express.Router();

router.get('/', listSchools);
router.get('/analytics/public', getPublicSystemAnalytics);
router.get('/:schoolId', getSchoolDetails);
router.get('/:schoolId/services', getSchoolServices);
router.get('/:schoolId/prospectus', getSchoolProspectus);

export default router;
