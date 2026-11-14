import mongoose from 'mongoose';
import {
  AcademicRecordRequest,
  ClearanceRecord,
  Student,
  School,
  AuditLog,
} from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';

const DEPARTMENTS = ['finance', 'library', 'stores', 'academic_office', 'administration'];

export class ClearanceService {
  /**
   * Submit a new academic transcript or certificate request and initialize clearance workflows
   */
  static async requestAcademicRecord({
    studentUser,
    schoolId,
    documentType,
    copiesCount = 1,
    purpose,
    deliveryPreference = 'in_person_collection',
    requesterDetails = {},
  }) {
    let student = null;
    if (studentUser) {
      student = await Student.findOne({ user: studentUser._id });
    }

    const school = await School.findOne({ schoolId: schoolId || student?.schoolId });
    const targetSchoolId = school?.schoolId || schoolId || student?.schoolId || 'inst-1';

    const requesterName = requesterDetails.fullName || student?.fullName || studentUser?.name || 'Alumnus';
    const requesterPhone = requesterDetails.phone || studentUser?.phone || student?.guardianPhone || '0240000000';
    const requesterEmail = requesterDetails.email || studentUser?.email || '';
    const indexNumber = requesterDetails.indexNumber || student?.beceIndexNumber || `WAS-${Date.now().toString().slice(-6)}`;
    const completionYear = requesterDetails.completionYear || 2025;

    const requestReference = `AR-${documentType.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;

    // Create AcademicRecordRequest
    const recordRequest = new AcademicRecordRequest({
      requestReference,
      student: student?._id || null,
      school: school?._id || null,
      schoolId: targetSchoolId,
      requesterName,
      requesterPhone,
      requesterEmail,
      indexNumber,
      completionYear,
      documentType,
      copiesCount,
      purpose,
      deliveryPreference,
      identityVerified: false,
      academicVerified: false,
      departmentClearanceStatus: 'pending',
      approvalStatus: 'pending',
      collectionStatus: 'pending_preparation',
      history: [
        {
          timestamp: new Date(),
          action: 'REQUEST_SUBMITTED',
          performedBy: studentUser?._id || null,
          performerName: requesterName,
          notes: `Requested ${copiesCount} copies of ${documentType}`,
        },
      ],
    });

    await recordRequest.save();

    // Initialize 5 departmental clearance records
    const clearances = [];
    for (const dept of DEPARTMENTS) {
      const clearance = new ClearanceRecord({
        student: student?._id || null,
        school: school?._id || null,
        schoolId: targetSchoolId,
        academicRecordRequest: recordRequest._id,
        department: dept,
        status: 'cleared', // Default clean status unless flagged
        obligationDescription: '',
        amountDue: 0,
        currency: 'GHS',
        disputeStatus: 'none',
      });
      await clearance.save();
      clearances.push(clearance);
    }

    return {
      request: recordRequest.toObject(),
      clearances: clearances.map((c) => c.toObject()),
    };
  }

  /**
   * Fetch all departmental clearance statuses for a request
   */
  static async getClearancesForRequest(requestId, user) {
    const isObjectId = mongoose.Types.ObjectId.isValid(requestId);
    const recordRequest = await AcademicRecordRequest.findOne(
      isObjectId ? { _id: requestId } : { requestReference: requestId }
    );

    if (!recordRequest) {
      throw ApiError.notFound('Academic record request not found');
    }

    const clearances = await ClearanceRecord.find({ academicRecordRequest: recordRequest._id });
    return {
      request: recordRequest.toObject(),
      clearances: clearances.map((c) => c.toObject()),
    };
  }

  /**
   * Authorised officer clears, updates, or flags an obligation
   */
  static async updateDepartmentClearance({
    clearanceId,
    officerUser,
    status,
    obligationDescription = '',
    amountDue = 0,
    explanation = '',
  }) {
    const clearance = await ClearanceRecord.findById(clearanceId);
    if (!clearance) {
      throw ApiError.notFound('Clearance record not found');
    }

    clearance.status = status;
    clearance.obligationDescription = obligationDescription;
    clearance.amountDue = amountDue;
    clearance.officerResponsible = officerUser._id;
    clearance.officerName = officerUser.name;
    clearance.confirmedAt = new Date();

    clearance.history.push({
      timestamp: new Date(),
      status,
      officer: officerUser._id,
      officerName: officerUser.name,
      note: explanation || `Status updated to ${status}`,
    });

    await clearance.save();

    // Check aggregate clearance state across all departments for this request
    const allClearances = await ClearanceRecord.find({
      academicRecordRequest: clearance.academicRecordRequest,
    });

    const hasBlocked = allClearances.some((c) => c.status === 'outstanding_obligation');
    const hasDisputed = allClearances.some((c) => c.status === 'disputed');
    const allCleared = allClearances.every((c) => ['cleared', 'waived'].includes(c.status));

    let aggregateStatus = 'pending';
    if (hasBlocked) aggregateStatus = 'held_for_obligations';
    else if (hasDisputed) aggregateStatus = 'disputed';
    else if (allCleared) aggregateStatus = 'cleared';

    await AcademicRecordRequest.findByIdAndUpdate(clearance.academicRecordRequest, {
      departmentClearanceStatus: aggregateStatus,
      ...(allCleared ? { approvalStatus: 'approved' } : {}),
    });

    return clearance.toObject();
  }

  /**
   * Student raises a formal dispute over an alleged institutional debt or unreturned item
   */
  static async raiseDispute(clearanceId, studentUser, reason, studentEvidenceNote = '') {
    const clearance = await ClearanceRecord.findById(clearanceId);
    if (!clearance) {
      throw ApiError.notFound('Clearance record not found');
    }

    clearance.status = 'disputed';
    clearance.disputeStatus = 'under_investigation';
    clearance.disputeReason = reason;
    clearance.disputeRaisedAt = new Date();

    clearance.history.push({
      timestamp: new Date(),
      status: 'disputed',
      officer: studentUser._id,
      officerName: studentUser.name,
      note: `Student dispute raised: ${reason}. Evidence notes: ${studentEvidenceNote}`,
    });

    await clearance.save();

    await AcademicRecordRequest.findByIdAndUpdate(clearance.academicRecordRequest, {
      departmentClearanceStatus: 'disputed',
    });

    return clearance.toObject();
  }
}
