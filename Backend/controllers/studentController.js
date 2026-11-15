import { Student, Admission, Document, Appointment } from '../models/index.js';
import { AdmissionService } from '../services/admissionService.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getStudentProfile = asyncHandler(async (req, res) => {
  let student;
  if (['citizen', 'student'].includes(req.user.role)) {
    student = await Student.findOne({ user: req.user._id }).populate('school').populate('user', 'email phone name');
  } else if (req.params.studentId) {
    student = await Student.findById(req.params.studentId).populate('school').populate('user', 'email phone name');
  }

  if (!student) {
    throw ApiError.notFound('Student profile not found');
  }

  const studentObj = student.toObject();
  if (!studentObj.phone && student.user?.phone) {
    studentObj.phone = student.user.phone;
  }
  if (!studentObj.email && student.user?.email && !student.user.email.endsWith('@citizenqueue.gov.gh')) {
    studentObj.email = student.user.email;
  }

  return ApiResponse.success(res, studentObj);
});

export const updateStudentProfile = asyncHandler(async (req, res) => {
  let student;
  if (['citizen', 'student'].includes(req.user.role)) {
    student = await Student.findOne({ user: req.user._id });
  } else if (req.params.studentId) {
    student = await Student.findById(req.params.studentId);
  }

  if (!student) {
    throw ApiError.notFound('Student profile not found');
  }

  const result = await AdmissionService.updateStudentProfile(student._id, req.body);
  return ApiResponse.success(res, result);
});

export const getStudentAdmissions = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) {
    throw ApiError.notFound('Student record not found for this account');
  }

  const admission = await Admission.findOne({ student: student._id })
    .populate('school')
    .populate('appointment');

  return ApiResponse.success(res, admission);
});

export const getStudentDocuments = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) {
    throw ApiError.notFound('Student record not found');
  }

  const documents = await Document.find({ student: student._id }).sort({ required: -1, name: 1 });
  return ApiResponse.success(res, documents);
});

export const getStudentAppointments = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  const query = student
    ? { $or: [{ student: student._id }, { 'visitor.studentIndex': student.beceIndexNumber }] }
    : { 'visitor.contactPhone': req.user.phone };

  const appointments = await Appointment.find(query).sort({ appointmentDate: -1, appointmentTime: -1 });
  return ApiResponse.success(res, appointments);
});
