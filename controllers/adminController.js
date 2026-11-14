import {
  Student,
  Admission,
  Document,
  Appointment,
  AppointmentSlot,
  AuditLog,
} from '../models/index.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboardMetrics = asyncHandler(async (req, res) => {
  const schoolId = req.user.schoolId;

  // 1. Total placed candidates for this institution
  const totalStudents = await Student.countDocuments({ schoolId });

  // 2. Admission readiness breakdown
  const admissions = await Admission.find({ schoolId });
  let fullyReadyCount = 0;
  let preArrivalCount = 0;
  let documentsPendingCount = 0;
  let checkedInCount = 0;

  admissions.forEach((a) => {
    if (a.readinessScore >= 85) fullyReadyCount++;
    if (a.registrationStatus === 'pre_arrival_review') preArrivalCount++;
    if (a.registrationStatus === 'documents_pending') documentsPendingCount++;
    if (a.registrationStatus === 'checked_in') checkedInCount++;
  });

  // 3. Pending documents awaiting review
  const pendingDocsCount = await Document.countDocuments({
    schoolId,
    status: { $in: ['submitted', 'under_review'] },
  });

  // 4. Appointments metrics (today's load)
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = await Appointment.find({
    schoolId,
    appointmentDate: today,
  });

  const bookedToday = todayAppointments.length;
  const checkedInToday = todayAppointments.filter((a) => a.status === 'checked_in').length;
  const completedToday = todayAppointments.filter((a) => a.status === 'completed').length;

  return ApiResponse.success(res, {
    totalStudents,
    fullyReadyCount,
    preArrivalCount,
    documentsPendingCount,
    checkedInCount,
    pendingDocsCount,
    todayStats: {
      date: today,
      booked: bookedToday,
      checkedIn: checkedInToday,
      completed: completedToday,
    },
  });
});

export const listStudents = asyncHandler(async (req, res) => {
  const schoolId = req.user.schoolId;
  const { programme, residentialStatus, search, page = 1, limit = 20 } = req.query;

  const query = { schoolId };
  if (programme) query.programme = programme;
  if (residentialStatus) query.residentialStatus = residentialStatus;
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { beceIndexNumber: { $regex: search, $options: 'i' } },
      { guardianPhone: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Student.countDocuments(query);
  const students = await Student.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  // Populate admission statuses for these students
  const studentIds = students.map((s) => s._id);
  const admissions = await Admission.find({ student: { $in: studentIds } });
  const admissionMap = new Map();
  admissions.forEach((a) => admissionMap.set(a.student.toString(), a));

  const enriched = students.map((s) => {
    const admission = admissionMap.get(s._id.toString());
    return {
      ...s.toObject(),
      readinessScore: admission?.readinessScore || 0,
      currentStage: admission?.currentStage || 1,
      registrationStatus: admission?.registrationStatus || 'profile_pending',
    };
  });

  return ApiResponse.success(res, {
    students: enriched,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

export const getStudentDetails = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const student = await Student.findOne({ _id: studentId, schoolId: req.user.schoolId });

  if (!student) {
    throw ApiError.notFound('Student record not found in this institution');
  }

  const admission = await Admission.findOne({ student: student._id }).populate('appointment');
  const documents = await Document.find({ student: student._id });
  const appointments = await Appointment.find({ student: student._id });

  return ApiResponse.success(res, {
    student,
    admission,
    documents,
    appointments,
  });
});

export const listAppointments = asyncHandler(async (req, res) => {
  const schoolId = req.user.schoolId;
  const { date, status, serviceId } = req.query;

  const query = { schoolId };
  if (date) query.appointmentDate = date;
  if (status) query.status = status;
  if (serviceId) query.serviceId = serviceId;

  const appointments = await Appointment.find(query).sort({
    appointmentDate: 1,
    appointmentTime: 1,
  });

  return ApiResponse.success(res, appointments);
});

export const listAuditLogs = asyncHandler(async (req, res) => {
  const schoolId = req.user.schoolId;
  const { limit = 50 } = req.query;

  const logs = await AuditLog.find({ schoolId })
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  return ApiResponse.success(res, logs);
});

export const createCapacitySlots = asyncHandler(async (req, res) => {
  const { serviceId, dates, times, capacity = 25 } = req.body;
  const schoolId = req.user.schoolId;

  const createdSlots = [];
  for (const date of dates) {
    for (const time of times) {
      const slotId = `slot-${serviceId}-${date}-${time.replace(/[^a-zA-Z0-9]/g, '')}`;
      const slot = await AppointmentSlot.findOneAndUpdate(
        { serviceId, date, time },
        {
          $setOnInsert: {
            schoolId,
            serviceId,
            slotId,
            date,
            time,
            capacity,
            bookedCount: 0,
            isActive: true,
          },
        },
        { upsert: true, new: true }
      );
      createdSlots.push(slot);
    }
  }

  return ApiResponse.created(res, { createdCount: createdSlots.length, slots: createdSlots });
});
