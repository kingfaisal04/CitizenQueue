import mongoose from 'mongoose';
import { AcademicRecordRequest, ClearanceRecord, Student } from '../models/index.js';
import { ClearanceService } from '../services/clearanceService.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const requestRecord = asyncHandler(async (req, res) => {
  const {
    documentType,
    copiesCount,
    numberOfCopies,
    purpose,
    deliveryPreference,
    requesterDetails,
  } = req.body;
  const schoolId = req.body.schoolId || req.user?.schoolId || 'inst-1';

  const result = await ClearanceService.requestAcademicRecord({
    studentUser: req.user,
    schoolId,
    documentType,
    copiesCount: copiesCount || numberOfCopies || 1,
    purpose: purpose || 'Personal Academic Verification',
    deliveryPreference: deliveryPreference || 'physical_pickup',
    requesterDetails: requesterDetails || {},
  });

  return ApiResponse.created(res, result);
});

export const getMyRequests = asyncHandler(async (req, res) => {
  let student = null;
  if (['citizen', 'student'].includes(req.user.role)) {
    student = await Student.findOne({ user: req.user._id });
  }

  const query = student
    ? { $or: [{ student: student._id }, { indexNumber: student.beceIndexNumber }] }
    : { requesterPhone: req.user.phone };

  const requests = await AcademicRecordRequest.find(query).sort({ createdAt: -1 });
  return ApiResponse.success(res, requests);
});

export const getRequestDetails = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const isObjectId = mongoose.Types.ObjectId.isValid(requestId);

  const request = await AcademicRecordRequest.findOne(
    isObjectId ? { _id: requestId } : { requestReference: requestId }
  );

  if (!request) {
    throw ApiError.notFound('Academic record request not found');
  }

  const clearances = await ClearanceRecord.find({ academicRecordRequest: request._id });
  return ApiResponse.success(res, { request, clearances });
});

export const getClearances = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const result = await ClearanceService.getClearancesForRequest(requestId, req.user);
  return ApiResponse.success(res, result);
});

export const updateDepartmentClearance = asyncHandler(async (req, res) => {
  const { clearanceId } = req.params;
  const { status, obligationDescription, amountDue, explanation } = req.body;

  const clearance = await ClearanceService.updateDepartmentClearance({
    clearanceId,
    officerUser: req.user,
    status,
    obligationDescription,
    amountDue,
    explanation,
  });

  return ApiResponse.success(res, clearance);
});

export const raiseDispute = asyncHandler(async (req, res) => {
  const { clearanceId } = req.params;
  const { reason, studentEvidenceNote } = req.body;

  const clearance = await ClearanceService.raiseDispute(
    clearanceId,
    req.user,
    reason,
    studentEvidenceNote
  );

  return ApiResponse.success(res, clearance);
});

export const updateWorkflowStatus = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const {
    identityVerificationStatus,
    academicVerificationStatus,
    clearanceStatus,
    approvalStatus,
    collectionStatus,
    notes,
  } = req.body;

  const isObjectId = mongoose.Types.ObjectId.isValid(requestId);
  const request = await AcademicRecordRequest.findOne(
    isObjectId ? { _id: requestId } : { requestReference: requestId }
  );

  if (!request) {
    throw ApiError.notFound('Academic record request not found');
  }

  if (identityVerificationStatus) request.identityVerified = identityVerificationStatus === 'verified';
  if (academicVerificationStatus) request.academicVerified = academicVerificationStatus === 'verified';
  if (clearanceStatus) request.departmentClearanceStatus = clearanceStatus;
  if (approvalStatus) request.approvalStatus = approvalStatus;
  if (collectionStatus) request.collectionStatus = collectionStatus;

  request.history.push({
    timestamp: new Date(),
    action: 'WORKFLOW_STATUS_UPDATED',
    performedBy: req.user._id,
    performerName: req.user.name,
    notes: notes || 'Status updated by officer',
  });

  await request.save();
  return ApiResponse.success(res, request);
});
