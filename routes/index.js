import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import schoolRoutes from './schoolRoutes.js';
import studentRoutes from './studentRoutes.js';
import admissionRoutes from './admissionRoutes.js';
import prospectusRoutes from './prospectusRoutes.js';
import documentRoutes from './documentRoutes.js';
import appointmentRoutes from './appointmentRoutes.js';
import adminRoutes from './adminRoutes.js';
import academicRecordRoutes from './academicRecordRoutes.js';
import notificationRoutes from './notificationRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/schools', schoolRoutes);
router.use('/students', studentRoutes);
router.use('/admissions', admissionRoutes);
router.use('/prospectus', prospectusRoutes);
router.use('/documents', documentRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/admin', adminRoutes);
router.use('/academic-records', academicRecordRoutes);
router.use('/notifications', notificationRoutes);

export default router;
