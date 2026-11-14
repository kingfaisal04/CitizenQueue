import express from 'express';
import {
  getDashboardMetrics,
  listStudents,
  getStudentDetails,
  listAppointments,
  listAuditLogs,
  createCapacitySlots,
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';
import { enforceSchoolAccess } from '../middleware/schoolAccessMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { bulkCreateSlotsSchema } from '../validators/appointmentValidators.js';

const router = express.Router();

router.use(authenticate, requireAdmin, enforceSchoolAccess);

router.get('/dashboard', getDashboardMetrics);
router.get('/students', listStudents);
router.get('/students/:studentId', getStudentDetails);
router.get('/appointments', listAppointments);
router.get('/audit-logs', listAuditLogs);
router.post('/slots', validate(bulkCreateSlotsSchema), createCapacitySlots);

export default router;
