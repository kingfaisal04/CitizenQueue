import express from 'express';
import {
  getAvailableSlots,
  bookAppointment,
  getMyAppointments,
  getAppointmentDetails,
  cancelAppointment,
  updateDeskStatus,
  toggleChecklist,
} from '../controllers/appointmentController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';
import { enforceSchoolAccess } from '../middleware/schoolAccessMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import {
  bookAppointmentSchema,
  updateDeskStatusSchema,
  toggleChecklistSchema,
} from '../validators/appointmentValidators.js';

const router = express.Router();

// Publicly visible availability slots
router.get('/slots', getAvailableSlots);

// Authentication required for booking and managing appointments
router.use(authenticate);

router.post('/book', validate(bookAppointmentSchema), bookAppointment);
router.get('/my', getMyAppointments);
router.get('/:appointmentId', getAppointmentDetails);
router.post('/:appointmentId/cancel', cancelAppointment);

// Administrative desk operations
router.patch(
  '/:appointmentId/desk-status',
  requireAdmin,
  enforceSchoolAccess,
  validate(updateDeskStatusSchema),
  updateDeskStatus
);
router.patch(
  '/:appointmentId/checklist',
  requireAdmin,
  enforceSchoolAccess,
  validate(toggleChecklistSchema),
  toggleChecklist
);

export default router;
