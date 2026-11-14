import { Admission, Student } from '../models/index.js';
import { AdmissionService } from '../services/admissionService.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getProgress = asyncHandler(async (req, res) => {
  let studentId = req.query.studentId;

  if (['citizen', 'student'].includes(req.user.role)) {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      throw ApiError.notFound('Student record not found for this user account');
    }
    studentId = student._id;
  } else if (!studentId) {
    throw ApiError.badRequest('studentId query parameter is required for administrative lookup');
  }

  const progress = await AdmissionService.getAdmissionProgress(studentId);
  return ApiResponse.success(res, progress);
});

export const getStages = asyncHandler(async (req, res) => {
  let studentId = req.query.studentId;
  if (['citizen', 'student'].includes(req.user.role)) {
    const student = await Student.findOne({ user: req.user._id });
    studentId = student?._id;
  }

  const progress = await AdmissionService.getAdmissionProgress(studentId);
  return ApiResponse.success(res, progress.stages);
});

export const getTasks = asyncHandler(async (req, res) => {
  let studentId = req.query.studentId;
  if (['citizen', 'student'].includes(req.user.role)) {
    const student = await Student.findOne({ user: req.user._id });
    studentId = student?._id;
  }

  const progress = await AdmissionService.getAdmissionProgress(studentId);
  return ApiResponse.success(res, progress.tasks);
});

export const updateStage = asyncHandler(async (req, res) => {
  const { admissionId } = req.params;
  const { stageNumber, isCompleted, notes } = req.body;

  const admission = await Admission.findById(admissionId);
  if (!admission) {
    throw ApiError.notFound('Admission record not found');
  }

  const stageIndex = admission.stages.findIndex((s) => s.stage === Number(stageNumber));
  if (stageIndex !== -1) {
    admission.stages[stageIndex].isCompleted = isCompleted;
    admission.stages[stageIndex].completedAt = isCompleted ? new Date() : null;
  }

  if (notes) {
    admission.notes = notes;
  }

  await admission.save();
  const refreshed = await AdmissionService.getAdmissionProgress(admission.student);
  return ApiResponse.success(res, refreshed);
});
