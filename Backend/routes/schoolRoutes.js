import express from 'express';
import {
  listSchools,
  getSchoolDetails,
  getSchoolServices,
  getSchoolProspectus,
} from '../controllers/schoolController.js';

const router = express.Router();

router.get('/', listSchools);
router.get('/:schoolId', getSchoolDetails);
router.get('/:schoolId/services', getSchoolServices);
router.get('/:schoolId/prospectus', getSchoolProspectus);

export default router;
