import express from 'express';
import {
  getStudentProfile,
  updateStudentProfile,
  getStudentAdmissions,
  getStudentDocuments,
  getStudentAppointments,
} from '../controllers/studentController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { updateStudentProfileSchema } from '../validators/admissionValidators.js';

const router = express.Router();

router.use(authenticate);

router.get('/profile', getStudentProfile);
router.put('/profile', validate(updateStudentProfileSchema), updateStudentProfile);
router.get('/admissions', getStudentAdmissions);
router.get('/documents', getStudentDocuments);
router.get('/appointments', getStudentAppointments);
router.get('/:studentId', getStudentProfile);

export default router;
