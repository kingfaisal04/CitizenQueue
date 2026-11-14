import { Admission, Student, Document, Prospectus, Appointment } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';

export class AdmissionService {
  /**
   * Calculate real-time admission readiness metrics, current stage, and pending tasks
   */
  static async getAdmissionProgress(studentId) {
    const student = await Student.findById(studentId);
    if (!student) {
      throw ApiError.notFound('Student record not found');
    }

    let admission = await Admission.findOne({ student: student._id });
    if (!admission) {
      throw ApiError.notFound('Admission record not found for student');
    }

    // 1. Fetch all documents for this student
    const documents = await Document.find({ student: student._id });
    const requiredDocs = documents.filter((d) => d.required);
    const submittedRequiredDocs = requiredDocs.filter((d) =>
      ['submitted', 'under_review', 'provisionally_accepted', 'accepted'].includes(d.status)
    );
    const verifiedRequiredDocs = requiredDocs.filter((d) =>
      ['provisionally_accepted', 'accepted'].includes(d.status)
    );

    // 2. Fetch prospectus requirements for the school & student gender
    const gender = student.gender === 'Female' ? 'girl' : 'boy';
    const prospectusCatalog = await Prospectus.find({
      schoolId: student.schoolId,
      publicationStatus: 'published',
      $or: [{ targetGender: 'all' }, { targetGender: gender }],
    });

    // 3. Match against student's acquired items
    const statusMap = new Map();
    (admission.prospectusStatuses || []).forEach((item) => {
      statusMap.set(item.itemId, item);
    });

    const totalProspectusItems = prospectusCatalog.length;
    let acquiredCount = 0;
    let photoApprovedCount = 0;

    prospectusCatalog.forEach((item) => {
      const st = statusMap.get(item.itemId);
      if (st && st.purchased) acquiredCount++;
      if (st && ['provisionally_accepted', 'approved'].includes(st.photoStatus)) photoApprovedCount++;
    });

    // 4. Fetch active appointment
    const appointment = await Appointment.findOne({
      $or: [{ student: student._id }, { 'visitor.studentIndex': student.beceIndexNumber }],
      status: { $in: ['booked', 'checked_in', 'in_progress', 'completed'] },
    }).sort({ createdAt: -1 });

    // 5. Evaluate Stages (1 - 9)
    const isStage1Complete = true; // Placement accepted
    const isStage2Complete = Boolean(
      student.fullName &&
      student.guardianName &&
      student.guardianPhone &&
      student.programme &&
      student.residentialStatus
    );
    const isStage3Complete = requiredDocs.length > 0 && submittedRequiredDocs.length >= requiredDocs.length;
    const isStage4Complete = requiredDocs.length > 0 && verifiedRequiredDocs.length >= requiredDocs.length;
    const isStage5Complete = totalProspectusItems > 0 && acquiredCount >= Math.ceil(totalProspectusItems * 0.8);
    const isStage6Complete = totalProspectusItems > 0 && photoApprovedCount >= Math.ceil(totalProspectusItems * 0.5);
    const isStage7Complete = Boolean(appointment && ['booked', 'checked_in', 'in_progress', 'completed'].includes(appointment.status));
    const isStage8Complete = Boolean(appointment && ['checked_in', 'completed'].includes(appointment.status));
    const isStage9Complete = Boolean(appointment && appointment.status === 'completed');

    // Calculate dynamic readiness score
    let score = 15; // Accepted placement base
    if (isStage2Complete) score += 15;
    if (isStage3Complete) score += 15;
    if (isStage4Complete) score += 15;
    if (isStage5Complete) score += 15;
    if (isStage6Complete) score += 10;
    if (isStage7Complete) score += 10;
    if (isStage9Complete) score = 100;
    score = Math.min(100, Math.max(0, score));

    // Determine current active stage number
    let currentStage = 1;
    if (isStage1Complete) currentStage = 2;
    if (isStage2Complete) currentStage = 3;
    if (isStage3Complete) currentStage = 4;
    if (isStage4Complete) currentStage = 5;
    if (isStage5Complete) currentStage = 6;
    if (isStage6Complete) currentStage = 7;
    if (isStage7Complete) currentStage = 8;
    if (isStage8Complete) currentStage = 9;

    // Determine registration status string
    let registrationStatus = 'profile_pending';
    if (isStage9Complete) {
      registrationStatus = 'completed';
    } else if (isStage8Complete) {
      registrationStatus = 'checked_in';
    } else if (isStage7Complete) {
      registrationStatus = 'appointment_booked';
    } else if (isStage4Complete && isStage6Complete) {
      registrationStatus = 'ready_for_reporting';
    } else if (isStage3Complete && !isStage4Complete) {
      registrationStatus = 'pre_arrival_review';
    } else if (isStage2Complete && !isStage3Complete) {
      registrationStatus = 'documents_pending';
    } else if (isStage3Complete && !isStage5Complete) {
      registrationStatus = 'items_pending';
    }

    // Update admission record
    admission.readinessScore = score;
    admission.currentStage = currentStage;
    admission.registrationStatus = registrationStatus;
    if (appointment) {
      admission.appointment = appointment._id;
    }

    // Refresh stage status list
    const stages = [
      { stage: 1, title: 'CSSPS Placement Accepted', isCompleted: isStage1Complete, completedAt: admission.createdAt },
      { stage: 2, title: 'Biodata & Guardian Verification', isCompleted: isStage2Complete, completedAt: isStage2Complete ? new Date() : null },
      { stage: 3, title: 'Mandatory Document Upload', isCompleted: isStage3Complete, completedAt: isStage3Complete ? new Date() : null },
      { stage: 4, title: 'Institutional Document Review', isCompleted: isStage4Complete, completedAt: isStage4Complete ? new Date() : null },
      { stage: 5, title: 'Digital Prospectus Item Acquisition', isCompleted: isStage5Complete, completedAt: isStage5Complete ? new Date() : null },
      { stage: 6, title: 'Items Visual Inspection & Clearance', isCompleted: isStage6Complete, completedAt: isStage6Complete ? new Date() : null },
      { stage: 7, title: 'Capacity & Arrival Appointment Scheduled', isCompleted: isStage7Complete, completedAt: isStage7Complete ? new Date() : null },
      { stage: 8, title: 'Physical Desk Clearance & Enrollment', isCompleted: isStage8Complete, completedAt: isStage8Complete ? new Date() : null },
      { stage: 9, title: 'Official SHS Enrolment Confirmed', isCompleted: isStage9Complete, completedAt: isStage9Complete ? new Date() : null },
    ];
    admission.stages = stages;
    admission.lastActiveAt = new Date();
    await admission.save();

    // Construct pending tasks list for frontend UI
    const tasks = [];
    if (!isStage2Complete) {
      tasks.push({
        id: 'task-biodata',
        title: 'Complete Student & Guardian Bio-data',
        description: 'Provide your emergency contact details, parent phone, and residential preference.',
        type: 'profile',
        category: 'Action Required',
        link: '/student/profile',
      });
    }

    const unsubmittedDocs = requiredDocs.filter((d) => d.status === 'not_submitted');
    if (unsubmittedDocs.length > 0) {
      tasks.push({
        id: 'task-documents',
        title: `Upload Required Documents (${unsubmittedDocs.length} remaining)`,
        description: `Submit your ${unsubmittedDocs.map((d) => d.name).slice(0, 2).join(', ')}${unsubmittedDocs.length > 2 ? ' and others' : ''}.`,
        type: 'document',
        category: 'Documents',
        link: '/student/documents',
      });
    }

    if (totalProspectusItems > 0 && acquiredCount < totalProspectusItems) {
      tasks.push({
        id: 'task-prospectus',
        title: `Prepare Prospectus Items (${totalProspectusItems - acquiredCount} remaining)`,
        description: 'Mark purchased items and upload proof photos for visual pre-verification.',
        type: 'prospectus',
        category: 'Checklist',
        link: '/student/prospectus',
      });
    }

    if (!isStage7Complete && (isStage3Complete || isStage2Complete)) {
      tasks.push({
        id: 'task-appointment',
        title: 'Schedule Your In-Person Reporting Slot',
        description: 'Select an official reporting date and arrival window to avoid queue delays.',
        type: 'appointment',
        category: 'Capacity Scheduling',
        link: '/student/appointments',
      });
    }

    return {
      admission: admission.toObject(),
      student: student.toObject(),
      readinessScore: score,
      currentStage,
      registrationStatus,
      stages,
      tasks,
      stats: {
        documentsRequired: requiredDocs.length,
        documentsSubmitted: submittedRequiredDocs.length,
        documentsVerified: verifiedRequiredDocs.length,
        prospectusTotal: totalProspectusItems,
        prospectusAcquired: acquiredCount,
        photosApproved: photoApprovedCount,
        hasAppointment: Boolean(appointment),
        appointmentStatus: appointment?.status || null,
      },
    };
  }

  /**
   * Update student biodata and sync completion
   */
  static async updateStudentProfile(studentId, updateData) {
    const student = await Student.findById(studentId);
    if (!student) {
      throw ApiError.notFound('Student record not found');
    }

    // Update allowed fields
    const allowedFields = [
      'gender',
      'dateOfBirth',
      'programme',
      'residentialStatus',
      'juniorHighSchool',
      'homeTown',
      'guardianName',
      'guardianPhone',
      'guardianEmail',
      'guardianRelation',
      'notes',
    ];

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        student[field] = updateData[field];
      }
    });

    student.isComplete = Boolean(
      student.fullName &&
      student.guardianName &&
      student.guardianPhone &&
      student.programme &&
      student.residentialStatus
    );

    await student.save();
    return await this.getAdmissionProgress(student._id);
  }
}
