import mongoose from 'mongoose';
import { Appointment } from '../models/index.js';
import { AppointmentService } from '../services/appointmentService.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAvailableSlots = asyncHandler(async (req, res) => {
  const { schoolId, serviceId, date } = req.query;
  const targetSchoolId = schoolId || req.user?.schoolId || 'inst-1';

  const slots = await AppointmentService.getAvailableSlots(targetSchoolId, serviceId, date);
  return ApiResponse.success(res, slots);
});

export const bookAppointment = asyncHandler(async (req, res) => {
  const { slotId, serviceId, appointmentDate, timeSlot, purpose, notes, visitorDetails } = req.body;
  const schoolId = req.body.schoolId || req.user?.schoolId || 'inst-1';

  const appointment = await AppointmentService.bookAppointment({
    studentUser: req.user,
    schoolId,
    serviceId,
    slotId,
    appointmentDate,
    timeSlot,
    purpose,
    visitorDetails: visitorDetails || { notes },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  return ApiResponse.created(res, appointment);
});

export const getMyAppointments = asyncHandler(async (req, res) => {
  const query = {
    $or: [
      { 'visitor.contactPhone': req.user.phone },
      { 'visitor.contactEmail': req.user.email },
      req.user.studentId ? { student: req.user.studentId } : null,
    ].filter(Boolean),
  };

  const appointments = await Appointment.find(query).sort({ appointmentDate: -1, appointmentTime: -1 });
  return ApiResponse.success(res, appointments);
});

export const getAppointmentDetails = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const isObjectId = mongoose.Types.ObjectId.isValid(appointmentId);

  const appointment = await Appointment.findOne(
    isObjectId ? { _id: appointmentId } : { referenceNumber: appointmentId }
  )
    .populate('student')
    .populate('service');

  if (!appointment) {
    throw ApiError.notFound('Appointment record not found');
  }

  return ApiResponse.success(res, appointment);
});

export const cancelAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const { cancellationReason } = req.body;

  const appointment = await AppointmentService.cancelAppointment(
    appointmentId,
    req.user,
    cancellationReason
  );

  return ApiResponse.success(res, appointment);
});

export const updateDeskStatus = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const { deskStatus, officerNotes } = req.body;

  const appointment = await AppointmentService.updateDeskStatus(
    appointmentId,
    req.user,
    deskStatus,
    officerNotes
  );

  return ApiResponse.success(res, appointment);
});

export const toggleChecklist = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const { itemKey, verified } = req.body;

  const appointment = await AppointmentService.toggleChecklistItem(
    appointmentId,
    req.user,
    itemKey,
    verified
  );

  return ApiResponse.success(res, appointment);
});
