import mongoose from 'mongoose';
import { Document, Student, Admission, AuditLog } from '../models/index.js';
import { StorageService } from '../services/storageService.js';
import { AdmissionService } from '../services/admissionService.js';
import { EmailService } from '../services/emailService.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDocuments = asyncHandler(async (req, res) => {
  let studentId = req.query.studentId;

  if (['citizen', 'student'].includes(req.user.role)) {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      throw ApiError.notFound('Student record not found');
    }
    studentId = student._id;
  }

  const query = studentId ? { student: studentId } : { schoolId: req.user.schoolId };
  const documents = await Document.find(query).sort({ required: -1, name: 1 });
  return ApiResponse.success(res, documents);
});

export const createUploadIntent = asyncHandler(async (req, res) => {
  const { documentType, fileName, fileType, fileSize, studentId } = req.body;

  let targetStudentId = studentId;
  if (['citizen', 'student'].includes(req.user.role)) {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      throw ApiError.notFound('Student record not found');
    }
    targetStudentId = student._id.toString();
  }

  const intent = await StorageService.createUploadIntent({
    studentId: targetStudentId,
    documentType,
    fileName,
    fileType,
    fileSize,
  });

  return ApiResponse.success(res, intent);
});

export const confirmUpload = asyncHandler(async (req, res) => {
  const { documentId, fileKey, fileName, fileSizeBytes, mimeType, fileUrl } = req.body;
  const isObjectId = mongoose.Types.ObjectId.isValid(documentId);

  let doc = await Document.findOne(
    isObjectId ? { _id: documentId } : { documentRequirementId: documentId }
  );

  let student;
  if (['citizen', 'student'].includes(req.user.role)) {
    student = await Student.findOne({ user: req.user._id });
    if (!student) throw ApiError.notFound('Student profile not found');
  }

  // If document record didn't exist yet, create or find matching
  if (!doc) {
    doc = new Document({
      student: student?._id,
      schoolId: student?.schoolId || req.user.schoolId || 'inst-1',
      documentRequirementId: documentId,
      name: fileName || 'Uploaded Document',
      category: 'Placement & Enrollment',
      required: true,
    });
  }

  doc.status = 'submitted';
  doc.fileName = fileName || doc.fileName || 'document.pdf';
  doc.fileSizeBytes = fileSizeBytes || doc.fileSizeBytes || 1024 * 100;
  doc.fileSize = fileSizeBytes ? `${(fileSizeBytes / 1024).toFixed(1)} KB` : '100 KB';
  doc.mimeType = mimeType || 'application/pdf';
  doc.storageKey = fileKey || doc.storageKey;
  doc.fileUrl = fileUrl || doc.fileUrl;
  doc.uploadedAt = new Date();

  doc.history.push({
    status: 'submitted',
    reviewedBy: req.user._id,
    reviewerName: req.user.name,
    adminFeedback: 'Initial submission uploaded by student',
    timestamp: new Date(),
  });

  await doc.save();

  // If placement slip, flag student record
  if (doc.documentRequirementId === 'doc-1' || doc.name.toLowerCase().includes('placement')) {
    await Student.findByIdAndUpdate(doc.student, {
      placementSlipUploaded: true,
      placementSlipFileName: doc.fileName,
    });
  }

  // Recalculate admission progress
  await AdmissionService.getAdmissionProgress(doc.student);

  return ApiResponse.success(res, doc);
});

export const getDownloadUrl = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const isObjectId = mongoose.Types.ObjectId.isValid(documentId);

  const doc = await Document.findOne(
    isObjectId ? { _id: documentId } : { documentRequirementId: documentId }
  );

  if (!doc) {
    throw ApiError.notFound('Document record not found');
  }

  // Verify access: Student can only access their own document
  if (['citizen', 'student'].includes(req.user.role)) {
    const student = await Student.findOne({ user: req.user._id });
    if (!student || doc.student.toString() !== student._id.toString()) {
      throw ApiError.forbidden('You are not authorized to view this document');
    }
  }

  const downloadUrl = await StorageService.getDownloadUrl(doc.storageKey || `mock/${doc.documentRequirementId}`);
  return ApiResponse.success(res, {
    downloadUrl,
    documentId: doc._id,
    name: doc.name,
    fileName: doc.fileName,
  });
});

export const reviewDocument = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const { status, feedback } = req.body;
  const isObjectId = mongoose.Types.ObjectId.isValid(documentId);

  const doc = await Document.findOne(
    isObjectId ? { _id: documentId } : { documentRequirementId: documentId }
  );

  if (!doc) {
    throw ApiError.notFound('Document record not found');
  }

  const mappedStatus =
    status === 'verified'
      ? 'accepted'
      : status === 'rejected'
      ? 'changes_required'
      : status;

  doc.status = mappedStatus;
  doc.reviewedAt = new Date();
  doc.reviewedBy = req.user._id;
  doc.adminFeedback = feedback || null;

  doc.history.push({
    status: mappedStatus,
    reviewedBy: req.user._id,
    reviewerName: req.user.name,
    adminFeedback: feedback || '',
    timestamp: new Date(),
  });

  await doc.save();

  // Audit log
  await AuditLog.create({
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    schoolId: req.user.schoolId,
    action: 'DOCUMENT_REVIEWED',
    targetResource: 'Document',
    targetId: doc._id.toString(),
    details: { status: mappedStatus, documentName: doc.name, feedback },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  // Recalculate student admission readiness
  await AdmissionService.getAdmissionProgress(doc.student);

  // Send email alert asynchronously
  const student = await Student.findById(doc.student);
  if (student?.guardianEmail) {
    EmailService.sendDocumentFeedback(student.guardianEmail, doc, mappedStatus, feedback).catch(console.error);
  }

  return ApiResponse.success(res, doc);
});

export const batchReviewDocuments = asyncHandler(async (req, res) => {
  const { documentIds, status, feedback } = req.body;
  const mappedStatus = status === 'verified' ? 'accepted' : status === 'rejected' ? 'changes_required' : status;

  const result = await Document.updateMany(
    { _id: { $in: documentIds } },
    {
      $set: {
        status: mappedStatus,
        reviewedAt: new Date(),
        reviewedBy: req.user._id,
        adminFeedback: feedback || null,
      },
    }
  );

  return ApiResponse.success(res, { updatedCount: result.modifiedCount });
});
