import {
  User,
  School,
  Student,
  Admission,
  Document,
  Appointment,
  AppointmentSlot,
  AuditLog,
} from '../models/index.js';
import { generateInstitutionKey } from '../models/School.js';
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

/**
 * GET /api/v1/admin/staff
 * Returns institution configuration (including Institution Authorization Key),
 * pre-assigned Staff ID roster, and registered active staff accounts for the admin's school.
 */
export const getInstitutionStaffOverview = asyncHandler(async (req, res) => {
  const schoolId = req.user.schoolId;

  const school = await School.findOne({ schoolId }).select('+authorizationKey +authorizedStaffRoster');
  if (!school) {
    throw ApiError.notFound(`Institution record (${schoolId}) not found`);
  }

  // Ensure legacy seeded schools automatically receive an Institution Authorization Key
  if (!school.authorizationKey) {
    school.authorizationKey = generateInstitutionKey(school.shortName || school.name);
    school.authorizationKeyUpdatedAt = new Date();
    await school.save();
  }

  const staffUsers = await User.find({
    schoolId,
    role: { $nin: ['citizen', 'student'] },
  })
    .select('-password -refreshTokens')
    .sort({ createdAt: -1 });

  return ApiResponse.success(res, {
    school: {
      id: school._id,
      schoolId: school.schoolId,
      name: school.name,
      shortName: school.shortName,
      category: school.category,
      region: school.region,
      city: school.city,
      contactEmail: school.contactEmail,
      contactPhone: school.contactPhone,
      authorizationKey: school.authorizationKey,
      authorizationKeyUpdatedAt: school.authorizationKeyUpdatedAt,
    },
    roster: (school.authorizedStaffRoster || []).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    ),
    staff: staffUsers,
  });
});

/**
 * POST /api/v1/admin/institution/regenerate-key
 * Rotates the Institution Authorization Key for the admin's school.
 */
export const regenerateInstitutionKey = asyncHandler(async (req, res) => {
  const schoolId = req.user.schoolId;

  const school = await School.findOne({ schoolId }).select('+authorizationKey');
  if (!school) {
    throw ApiError.notFound(`Institution record (${schoolId}) not found`);
  }

  const newKey = generateInstitutionKey(school.shortName || school.name);
  school.authorizationKey = newKey;
  school.authorizationKeyUpdatedAt = new Date();
  await school.save();

  await AuditLog.create({
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    schoolId,
    action: 'INSTITUTION_KEY_ROTATED',
    targetResource: 'School',
    targetId: school._id.toString(),
    details: { schoolId },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  return ApiResponse.success(res, {
    authorizationKey: school.authorizationKey,
    authorizationKeyUpdatedAt: school.authorizationKeyUpdatedAt,
  });
});

/**
 * POST /api/v1/admin/staff/roster
 * Pre-assigns a Staff ID to a specific system Role, Designation, and Department.
 */
export const addStaffRosterEntry = asyncHandler(async (req, res) => {
  const schoolId = req.user.schoolId;
  const { staffId, fullName = '', assignedRole, designation = '', department = '' } = req.body;
  const normalizedStaffId = staffId.trim().toUpperCase();

  const school = await School.findOne({ schoolId }).select('+authorizedStaffRoster');
  if (!school) {
    throw ApiError.notFound(`Institution record (${schoolId}) not found`);
  }

  // Check if an active registered staff account already uses this Staff ID
  const existingStaff = await User.findOne({
    schoolId,
    staffId: normalizedStaffId,
    role: { $nin: ['citizen', 'student'] },
  });
  if (existingStaff) {
    throw ApiError.conflict(
      `Staff ID ${normalizedStaffId} already belongs to registered officer ${existingStaff.name}. Update their role directly in the Active Staff table.`
    );
  }

  const existingIndex = (school.authorizedStaffRoster || []).findIndex(
    (entry) => entry.staffId === normalizedStaffId
  );

  if (existingIndex >= 0) {
    const existing = school.authorizedStaffRoster[existingIndex];
    if (existing.status === 'claimed') {
      throw ApiError.conflict(`Staff ID ${normalizedStaffId} has already been claimed by a registered account.`);
    }
    // Update pending/revoked entry in place
    existing.fullName = fullName || existing.fullName;
    existing.assignedRole = assignedRole;
    existing.designation = designation;
    existing.department = department;
    existing.status = 'pending';
    existing.addedBy = req.user._id;
  } else {
    school.authorizedStaffRoster.push({
      staffId: normalizedStaffId,
      fullName,
      assignedRole,
      designation,
      department,
      status: 'pending',
      addedBy: req.user._id,
    });
  }

  await school.save();

  const savedEntry = school.authorizedStaffRoster.find(
    (entry) => entry.staffId === normalizedStaffId
  );

  await AuditLog.create({
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    schoolId,
    action: 'STAFF_ROSTER_ASSIGNED',
    targetResource: 'School',
    targetId: school._id.toString(),
    details: { staffId: normalizedStaffId, assignedRole, designation, department },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  return ApiResponse.created(res, savedEntry);
});

/**
 * DELETE /api/v1/admin/staff/roster/:staffId
 * Removes a pre-assigned Staff ID from the institution roster.
 */
export const removeStaffRosterEntry = asyncHandler(async (req, res) => {
  const schoolId = req.user.schoolId;
  const normalizedStaffId = decodeURIComponent(req.params.staffId || '').trim().toUpperCase();

  const school = await School.findOne({ schoolId }).select('+authorizedStaffRoster');
  if (!school) {
    throw ApiError.notFound(`Institution record (${schoolId}) not found`);
  }

  const initialLength = (school.authorizedStaffRoster || []).length;
  school.authorizedStaffRoster = (school.authorizedStaffRoster || []).filter(
    (entry) => entry.staffId !== normalizedStaffId
  );

  if (school.authorizedStaffRoster.length === initialLength) {
    throw ApiError.notFound(`Staff ID ${normalizedStaffId} was not found in the roster`);
  }

  await school.save();

  await AuditLog.create({
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    schoolId,
    action: 'STAFF_ROSTER_REMOVED',
    targetResource: 'School',
    targetId: school._id.toString(),
    details: { staffId: normalizedStaffId },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  return ApiResponse.success(res, { removedStaffId: normalizedStaffId });
});

/**
 * PATCH /api/v1/admin/staff/:userId
 * Updates a registered staff member's Role, Staff ID, Designation, Department, or Account Status.
 */
export const updateStaffMember = asyncHandler(async (req, res) => {
  const schoolId = req.user.schoolId;
  const { userId } = req.params;
  const { role, staffId, designation, department, accountStatus } = req.body;

  const targetUser = await User.findOne({
    _id: userId,
    schoolId,
    role: { $nin: ['citizen', 'student'] },
  }).select('-password -refreshTokens');

  if (!targetUser) {
    throw ApiError.notFound('Staff member not found in your institution');
  }

  // Prevent administrator from locking themselves out
  if (targetUser._id.toString() === req.user._id.toString()) {
    if (accountStatus === 'suspended') {
      throw ApiError.badRequest('You cannot suspend your own administrator account.');
    }
    if (role && !['admin', 'school_admin', 'super_admin'].includes(role)) {
      throw ApiError.badRequest('You cannot demote your own primary administrator role.');
    }
  }

  const previousRole = targetUser.role;
  if (role !== undefined) targetUser.role = role;
  if (staffId !== undefined) targetUser.staffId = staffId.trim().toUpperCase();
  if (designation !== undefined) targetUser.designation = designation;
  if (department !== undefined) targetUser.department = department;
  if (accountStatus !== undefined) targetUser.accountStatus = accountStatus;

  await targetUser.save();

  await AuditLog.create({
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    schoolId,
    action: 'STAFF_ROLE_UPDATED',
    targetResource: 'User',
    targetId: targetUser._id.toString(),
    details: {
      staffId: targetUser.staffId,
      previousRole,
      newRole: targetUser.role,
      accountStatus: targetUser.accountStatus,
    },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  return ApiResponse.success(res, targetUser);
});
