import express from 'express';
import {
  getDashboardMetrics,
  listStudents,
  getStudentDetails,
  listAppointments,
  listAuditLogs,
  createCapacitySlots,
  getInstitutionStaffOverview,
  regenerateInstitutionKey,
  addStaffRosterEntry,
  removeStaffRosterEntry,
  updateStaffMember,
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireAdmin, requireSchoolManager } from '../middleware/roleMiddleware.js';
import { enforceSchoolAccess } from '../middleware/schoolAccessMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { bulkCreateSlotsSchema } from '../validators/appointmentValidators.js';
import { staffRosterEntrySchema, updateStaffMemberSchema } from '../validators/authValidators.js';

const router = express.Router();

router.use(authenticate, requireAdmin, enforceSchoolAccess);

router.get('/dashboard', getDashboardMetrics);
router.get('/students', listStudents);
router.get('/students/:studentId', getStudentDetails);
router.get('/appointments', listAppointments);
router.get('/audit-logs', listAuditLogs);
router.post('/slots', validate(bulkCreateSlotsSchema), createCapacitySlots);

// Institution Key & Staff Role Management (strictly restricted to School Administrators)
router.get('/staff', requireSchoolManager, getInstitutionStaffOverview);
router.post('/institution/regenerate-key', requireSchoolManager, regenerateInstitutionKey);
router.post('/staff/roster', requireSchoolManager, validate(staffRosterEntrySchema), addStaffRosterEntry);
router.delete('/staff/roster/:staffId', requireSchoolManager, removeStaffRosterEntry);
router.patch('/staff/:userId', requireSchoolManager, validate(updateStaffMemberSchema), updateStaffMember);

export default router;
