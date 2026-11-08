/**
 * CitizenQueue - Admission & Orchestration Service Layer
 * 
 * Provides unified management for:
 * - Student bio-data & placement profile
 * - Digital prospectus requirements and item purchase status
 * - Item photograph submission & preliminary administrator review
 * - Admission document uploads, status tracking & feedback
 * - Institutional admission cohort statistics & review queues
 * - 9-stage admission progress calculation
 */

import { Storage } from './storageService';
import { AppointmentService } from './appointmentService';
import { ADMISSION_STAGES } from '../data/mockData';

export const AdmissionService = {
  // ==========================================================================
  // 1. STUDENT PROFILE & PLACEMENT MANAGEMENT
  // ==========================================================================
  
  /**
   * Retrieve active student profile
   */
  getProfile: () => {
    return Storage.getStudentProfile();
  },

  /**
   * Update student profile fields
   */
  updateProfile: (updatedFields) => {
    const current = Storage.getStudentProfile();
    const updated = {
      ...current,
      ...updatedFields,
      // Calculate completeness based on key mandatory fields
      isComplete: Boolean(
        (updatedFields.fullName ?? current.fullName)?.trim() &&
        (updatedFields.beceIndexNumber ?? current.beceIndexNumber)?.trim() &&
        (updatedFields.dateOfBirth ?? current.dateOfBirth) &&
        (updatedFields.assignedSchool ?? current.assignedSchool) &&
        (updatedFields.programme ?? current.programme) &&
        (updatedFields.guardianName ?? current.guardianName)?.trim() &&
        (updatedFields.guardianPhone ?? current.guardianPhone)?.trim()
      )
    };
    Storage.setStudentProfile(updated);

    // Sync active student in institution admitted cohort
    AdmissionService.syncStudentCohort();
    return updated;
  },

  /**
   * Register a new candidate profile and add them to the admitted cohort
   */
  registerStudent: (studentData) => {
    // 1. Create and update student profile
    const profile = AdmissionService.updateProfile({
      ...studentData,
      isComplete: true
    });

    // 2. Add to admitted students list if not present
    const students = Storage.getAdmittedStudents();
    const existingIndex = students.findIndex(
      (s) => s.indexNumber === studentData.beceIndexNumber || s.id === studentData.id
    );

    const newStudentEntry = {
      id: `std-${studentData.beceIndexNumber || Date.now()}`,
      name: studentData.fullName,
      indexNumber: studentData.beceIndexNumber,
      gender: studentData.gender || 'Male',
      programme: studentData.programme || 'General Science',
      residentialStatus: studentData.residentialStatus || 'Boarding',
      guardianName: studentData.guardianName || '',
      guardianPhone: studentData.guardianPhone || '',
      guardianEmail: studentData.guardianEmail || '',
      aggregate: studentData.aggregateScore || '10',
      readinessScore: 35,
      admissionStage: 2,
      profileComplete: true,
      documentsCount: { total: 6, accepted: 0, pending: 0, changes: 0 },
      prospectusCount: { total: 15, purchased: 0, photosPending: 0, photosAccepted: 0, photosChanges: 0 },
      appointment: null,
      registrationStatus: 'profile_pending',
      lastActive: 'Just now'
    };

    if (existingIndex !== -1) {
      students[existingIndex] = { ...students[existingIndex], ...newStudentEntry };
    } else {
      students.unshift(newStudentEntry);
    }
    Storage.setAdmittedStudents(students);

    return profile;
  },

  // ==========================================================================
  // 2. DIGITAL PROSPECTUS & ITEM PHOTO SUBMISSION
  // ==========================================================================

  /**
   * Get master school prospectus requirements
   */
  getProspectus: () => {
    return Storage.getProspectus();
  },

  /**
   * Get student's purchase and photo review status for prospectus items
   */
  getStudentProspectusStatus: () => {
    return Storage.getStudentProspectusStatus();
  },

  /**
   * Toggle purchase status for a prospectus item
   */
  toggleItemPurchased: (itemId) => {
    const statusMap = Storage.getStudentProspectusStatus();
    const currentItem = statusMap[itemId] || {
      purchased: false,
      photoStatus: 'not_submitted',
      photoName: null,
      photoUrl: null,
      submittedAt: null,
      adminFeedback: null
    };

    const updated = {
      ...statusMap,
      [itemId]: {
        ...currentItem,
        purchased: !currentItem.purchased
      }
    };
    Storage.setStudentProspectusStatus(updated);
    AdmissionService.syncStudentCohort();
    return updated;
  },

  /**
   * Mark a prospectus item as purchased or unpurchased explicitly
   */
  setItemPurchased: (itemId, isPurchased) => {
    const statusMap = Storage.getStudentProspectusStatus();
    const currentItem = statusMap[itemId] || {
      purchased: false,
      photoStatus: 'not_submitted',
      photoName: null,
      photoUrl: null,
      submittedAt: null,
      adminFeedback: null
    };

    const updated = {
      ...statusMap,
      [itemId]: {
        ...currentItem,
        purchased: Boolean(isPurchased)
      }
    };
    Storage.setStudentProspectusStatus(updated);
    AdmissionService.syncStudentCohort();
    return updated;
  },

  /**
   * Student submits an item photograph for preliminary review
   */
  submitItemPhoto: (itemId, { photoUrl, photoName }) => {
    const statusMap = Storage.getStudentProspectusStatus();
    const currentItem = statusMap[itemId] || {
      purchased: true,
      photoStatus: 'not_submitted',
      photoName: null,
      photoUrl: null,
      submittedAt: null,
      adminFeedback: null
    };

    const updated = {
      ...statusMap,
      [itemId]: {
        ...currentItem,
        purchased: true, // Auto-mark as purchased if photo uploaded
        photoStatus: 'awaiting_review',
        photoName: photoName || 'item_photo.jpg',
        photoUrl: photoUrl || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=60',
        submittedAt: new Date().toISOString(),
        adminFeedback: 'Awaiting preliminary review by school administration desk.'
      }
    };

    Storage.setStudentProspectusStatus(updated);
    AdmissionService.syncStudentCohort();
    return updated;
  },

  /**
   * Remove or replace submitted item photograph
   */
  removeItemPhoto: (itemId) => {
    const statusMap = Storage.getStudentProspectusStatus();
    const currentItem = statusMap[itemId];
    if (!currentItem) return statusMap;

    const updated = {
      ...statusMap,
      [itemId]: {
        ...currentItem,
        photoStatus: 'not_submitted',
        photoName: null,
        photoUrl: null,
        submittedAt: null,
        adminFeedback: null
      }
    };

    Storage.setStudentProspectusStatus(updated);
    AdmissionService.syncStudentCohort();
    return updated;
  },

  /**
   * Administrator reviews an item photo (Provisionally Accept or Request Changes)
   */
  adminReviewItemPhoto: (itemId, { status, adminFeedback }) => {
    // 1. Update student's local status
    const statusMap = Storage.getStudentProspectusStatus();
    const currentItem = statusMap[itemId] || {};

    const updated = {
      ...statusMap,
      [itemId]: {
        ...currentItem,
        photoStatus: status, // 'provisionally_accepted' | 'changes_required'
        adminFeedback: adminFeedback || (status === 'provisionally_accepted' ? 'Item specification provisionally accepted.' : 'Please adjust according to school requirements.')
      }
    };
    Storage.setStudentProspectusStatus(updated);

    // 2. Also record notification for student
    const notifs = Storage.getNotifications();
    const itemReq = (Storage.getProspectus() || []).find((p) => p.id === itemId);
    const itemName = itemReq?.name || 'Prospectus Item';
    const newNotif = {
      id: `notif-${Date.now()}`,
      title: status === 'provisionally_accepted' 
        ? `Item Approved: ${itemName}` 
        : `Correction Needed: ${itemName}`,
      message: adminFeedback || `Administrator updated status for ${itemName}.`,
      date: new Date().toISOString(),
      isRead: false,
      type: status === 'provisionally_accepted' ? 'info' : 'reminder'
    };
    Storage.setNotifications([newNotif, ...notifs]);

    AdmissionService.syncStudentCohort();
    return updated;
  },

  // ==========================================================================
  // 3. MASTER PROSPECTUS REQUIREMENT MANAGEMENT (ADMIN CRUD)
  // ==========================================================================

  /**
   * Add new requirement to master school prospectus
   */
  addProspectusRequirement: (requirementData) => {
    const list = Storage.getProspectus();
    const newId = `pr-${Date.now()}`;
    const newReq = {
      id: newId,
      schoolId: requirementData.schoolId || 'inst-1',
      name: requirementData.name.trim(),
      category: requirementData.category || 'Clothing and Uniforms',
      specification: requirementData.specification.trim(),
      description: requirementData.description?.trim() || '',
      quantity: requirementData.quantity?.trim() || '1 piece',
      requiresPhotoReview: Boolean(requirementData.requiresPhotoReview),
      referenceNotes: requirementData.referenceNotes?.trim() || ''
    };

    const updated = [newReq, ...list];
    Storage.setProspectus(updated);
    return newReq;
  },

  /**
   * Update existing requirement
   */
  updateProspectusRequirement: (id, fields) => {
    const list = Storage.getProspectus();
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) return null;

    list[index] = { ...list[index], ...fields };
    Storage.setProspectus(list);
    return list[index];
  },

  /**
   * Delete requirement from school prospectus
   */
  deleteProspectusRequirement: (id) => {
    const list = Storage.getProspectus();
    const filtered = list.filter((r) => r.id !== id);
    Storage.setProspectus(filtered);
    return true;
  },

  // ==========================================================================
  // 4. ADMISSION DOCUMENT CENTRE
  // ==========================================================================

  /**
   * Get student's document checklist
   */
  getDocuments: () => {
    return Storage.getStudentDocuments();
  },

  /**
   * Student uploads a document (demonstration file preview)
   */
  uploadDocument: (docId, { fileName, fileSize, fileUrl }) => {
    const docs = Storage.getStudentDocuments();
    const index = docs.findIndex((d) => d.id === docId);
    if (index === -1) return null;

    docs[index] = {
      ...docs[index],
      status: 'submitted',
      fileName: fileName || `${docs[index].name.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      fileSize: fileSize || '1.4 MB',
      uploadedAt: new Date().toISOString(),
      fileUrl: fileUrl || 'https://images.unsplash.com/photo-1568667256549-094345857637?w=600&auto=format&fit=crop&q=60',
      adminFeedback: 'Submitted for preliminary administrative desk verification.'
    };

    Storage.setStudentDocuments(docs);
    AdmissionService.syncStudentCohort();
    return docs[index];
  },

  /**
   * Remove a submitted document
   */
  removeDocument: (docId) => {
    const docs = Storage.getStudentDocuments();
    const index = docs.findIndex((d) => d.id === docId);
    if (index === -1) return null;

    docs[index] = {
      ...docs[index],
      status: 'not_submitted',
      fileName: null,
      fileSize: null,
      uploadedAt: null,
      reviewedAt: null,
      adminFeedback: null,
      fileUrl: null
    };

    Storage.setStudentDocuments(docs);
    AdmissionService.syncStudentCohort();
    return docs[index];
  },

  /**
   * Administrator reviews document (Provisionally Accept or Request Corrections)
   */
  adminReviewDocument: (docId, { status, adminFeedback }) => {
    const docs = Storage.getStudentDocuments();
    const index = docs.findIndex((d) => d.id === docId);
    if (index === -1) return null;

    docs[index] = {
      ...docs[index],
      status, // 'provisionally_accepted' | 'changes_required' | 'under_review'
      reviewedAt: new Date().toISOString(),
      adminFeedback: adminFeedback || (status === 'provisionally_accepted' ? 'Document provisionally accepted.' : 'Please re-upload a clear copy.')
    };

    Storage.setStudentDocuments(docs);

    // Notify student
    const notifs = Storage.getNotifications();
    const newNotif = {
      id: `notif-${Date.now()}`,
      title: status === 'provisionally_accepted' 
        ? `Document Accepted: ${docs[index].name}` 
        : `Correction Required: ${docs[index].name}`,
      message: adminFeedback || `Administrator reviewed ${docs[index].name}.`,
      date: new Date().toISOString(),
      isRead: false,
      type: status === 'provisionally_accepted' ? 'confirmation' : 'reminder'
    };
    Storage.setNotifications([newNotif, ...notifs]);

    AdmissionService.syncStudentCohort();
    return docs[index];
  },

  // ==========================================================================
  // 5. READINESS CALCULATIONS & 9-STAGE ADMISSION PROGRESS
  // ==========================================================================

  /**
   * Calculate real-time readiness metrics across Profile, Prospectus, Documents and Appointments
   */
  getReadinessMetrics: () => {
    const profile = Storage.getStudentProfile();
    const prospectus = Storage.getProspectus();
    const prospectusStatus = Storage.getStudentProspectusStatus();
    const documents = Storage.getStudentDocuments();
    const appointments = AppointmentService.getCitizenAppointments();

    // 1. Profile Completion (100% or based on fields)
    const profileComplete = Boolean(profile.isComplete);
    const profileScore = profileComplete ? 100 : 40;

    // 2. Prospectus Completion
    const totalProspectusItems = prospectus.length || 1;
    let purchasedCount = 0;
    let photosAwaitingCount = 0;
    let photosAcceptedCount = 0;
    let photosChangesCount = 0;

    prospectus.forEach((item) => {
      const st = prospectusStatus[item.id];
      if (st?.purchased) purchasedCount++;
      if (st?.photoStatus === 'awaiting_review') photosAwaitingCount++;
      if (st?.photoStatus === 'provisionally_accepted') photosAcceptedCount++;
      if (st?.photoStatus === 'changes_required') photosChangesCount++;
    });

    const prospectusProgress = Math.round((purchasedCount / totalProspectusItems) * 100);

    // 3. Document Completion
    const totalDocs = documents.length || 1;
    let docsAccepted = 0;
    let docsUnderReview = 0;
    let docsSubmitted = 0;
    let docsChanges = 0;
    let docsNotSubmitted = 0;

    documents.forEach((doc) => {
      if (doc.status === 'provisionally_accepted') docsAccepted++;
      else if (doc.status === 'under_review') docsUnderReview++;
      else if (doc.status === 'submitted') docsSubmitted++;
      else if (doc.status === 'changes_required') docsChanges++;
      else docsNotSubmitted++;
    });

    const docsReviewedOrUploaded = docsAccepted + docsUnderReview + docsSubmitted;
    const documentProgress = Math.round((docsReviewedOrUploaded / totalDocs) * 100);

    // 4. Appointment Status
    const activeAppointment = appointments.find((a) =>
      ['booked', 'checked_in', 'in_progress', 'completed'].includes(a.status)
    );

    // 5. Total Readiness Score (Weighted composite)
    // Profile: 25%, Documents: 35%, Prospectus: 40%
    const compositeScore = Math.round(
      (profileScore * 0.25) +
      (documentProgress * 0.35) +
      (prospectusProgress * 0.40)
    );

    // 6. Compute Current Admission Stage (1 through 9)
    let currentStage = 1; // Stage 1: Placement Received (always true in this post-placement app)

    if (profileComplete) {
      currentStage = 2; // Profile Completed
    }

    if (prospectusProgress >= 60) {
      currentStage = 3; // Prospectus Requirements Reviewed
    }

    if (docsNotSubmitted === 0 && docsChanges === 0) {
      currentStage = 4; // Documents Submitted
    }

    if (currentStage >= 4 && (docsAccepted >= 3 || photosAcceptedCount >= 2)) {
      currentStage = 5; // Preliminary Review Completed
    }

    // Ready for physical reporting if profile complete, docs submitted/reviewed, and prospectus reviewed
    const isReadyForReporting = (
      profileComplete &&
      docsChanges === 0 &&
      docsNotSubmitted <= 1 &&
      prospectusProgress >= 60
    );

    if (isReadyForReporting) {
      currentStage = Math.max(currentStage, 6); // Ready for physical reporting
    }

    if (activeAppointment) {
      if (activeAppointment.status === 'booked') {
        currentStage = Math.max(currentStage, 7); // Appointment scheduled
      } else if (activeAppointment.status === 'checked_in' || activeAppointment.status === 'in_progress') {
        currentStage = 8; // Checked in on campus
      } else if (activeAppointment.status === 'completed') {
        currentStage = 9; // Registration completed
      }
    }

    return {
      profileComplete,
      profileScore,
      totalProspectusItems,
      purchasedCount,
      photosAwaitingCount,
      photosAcceptedCount,
      photosChangesCount,
      prospectusProgress,
      totalDocs,
      docsAccepted,
      docsUnderReview,
      docsSubmitted,
      docsChanges,
      docsNotSubmitted,
      documentProgress,
      activeAppointment,
      compositeScore,
      currentStage,
      isReadyForReporting,
      stages: ADMISSION_STAGES.map((s) => ({
        ...s,
        isCompleted: s.stage < currentStage,
        isCurrent: s.stage === currentStage,
        isUpcoming: s.stage > currentStage
      }))
    };
  },

  /**
   * Generate outstanding action items for the student dashboard
   */
  getOutstandingTasks: () => {
    const metrics = AdmissionService.getReadinessMetrics();
    const profile = Storage.getStudentProfile();
    const documents = Storage.getStudentDocuments();
    const prospectusStatus = Storage.getStudentProspectusStatus();
    const prospectus = Storage.getProspectus();

    const tasks = [];

    // Profile task
    if (!profile.isComplete) {
      tasks.push({
        id: 'task-profile',
        title: 'Complete your Admission Profile',
        description: 'Provide student bio-data, guardian contacts and residential status.',
        link: '/profile',
        actionLabel: 'Complete Profile',
        priority: 'high',
        category: 'Profile'
      });
    }

    // Document tasks
    documents.forEach((doc) => {
      if (doc.status === 'changes_required') {
        tasks.push({
          id: `task-doc-fix-${doc.id}`,
          title: `Re-upload: ${doc.name}`,
          description: `Action required: ${doc.adminFeedback || 'Corrections requested by school desk.'}`,
          link: '/documents',
          actionLabel: 'Resolve Document',
          priority: 'urgent',
          category: 'Documents'
        });
      } else if (doc.status === 'not_submitted' && doc.required) {
        tasks.push({
          id: `task-doc-sub-${doc.id}`,
          title: `Upload ${doc.name}`,
          description: doc.description,
          link: '/documents',
          actionLabel: 'Upload',
          priority: 'medium',
          category: 'Documents'
        });
      }
    });

    // Prospectus supplies acquisition task
    const unpurchasedCount = prospectus.length - metrics.purchasedCount;
    if (unpurchasedCount > 0 && metrics.prospectusProgress < 100) {
      tasks.push({
        id: 'task-prospectus-items',
        title: 'Acquire Prospectus Supplies',
        description: `You have ${unpurchasedCount} prospectus item(s) left to acquire before reporting day.`,
        link: '/prospectus',
        actionLabel: 'Check Prospectus',
        priority: 'medium',
        category: 'Prospectus'
      });
    }

    // Appointment task
    if (!metrics.activeAppointment) {
      if (metrics.isReadyForReporting) {
        tasks.push({
          id: 'task-appointment-ready',
          title: 'Schedule Your Reporting Appointment',
          description: 'You have satisfied pre-arrival prerequisites. Choose your physical verification slot.',
          link: '/book/srv-101',
          actionLabel: 'Book Reporting Slot',
          priority: 'high',
          category: 'Appointment'
        });
      }
    }

    return tasks;
  },

  // ==========================================================================
  // 6. ADMITTED COHORT SYNCHRONIZATION (TWO-WAY CITIZEN <-> ADMIN DATA)
  // ==========================================================================

  /**
   * Sync active student profile & progress into institution admitted cohort
   */
  syncStudentCohort: () => {
    try {
      const profile = Storage.getStudentProfile();
      const metrics = AdmissionService.getReadinessMetrics();
      const students = Storage.getAdmittedStudents();

      const index = students.findIndex((s) => s.id === profile.id || s.indexNumber === profile.beceIndexNumber);
      if (index !== -1) {
        students[index] = {
          ...students[index],
          name: profile.fullName,
          programme: profile.programme,
          residentialStatus: profile.residentialStatus,
          guardianName: profile.guardianName,
          guardianPhone: profile.guardianPhone,
          readinessScore: metrics.compositeScore,
          admissionStage: metrics.currentStage,
          profileComplete: metrics.profileComplete,
          documentsCount: {
            total: metrics.totalDocs,
            accepted: metrics.docsAccepted,
            pending: metrics.docsUnderReview + metrics.docsSubmitted,
            changes: metrics.docsChanges
          },
          prospectusCount: {
            total: metrics.totalProspectusItems,
            purchased: metrics.purchasedCount,
            photosPending: metrics.photosAwaitingCount,
            photosAccepted: metrics.photosAcceptedCount,
            photosChanges: metrics.photosChangesCount
          },
          appointment: metrics.activeAppointment ? {
            id: metrics.activeAppointment.id,
            date: metrics.activeAppointment.appointmentDate,
            time: metrics.activeAppointment.appointmentTime,
            status: metrics.activeAppointment.status,
            referenceNumber: metrics.activeAppointment.referenceNumber
          } : null,
          lastActive: 'Just now'
        };
        Storage.setAdmittedStudents(students);
      }
    } catch (e) {
      console.warn('[CitizenQueue] Error syncing student cohort:', e);
    }
  },

  /**
   * Get all admitted students for institution portal
   */
  getAdmittedStudents: () => {
    return Storage.getAdmittedStudents();
  },

  /**
   * Find student by ID or Index Number
   */
  getStudentById: (idOrIndex) => {
    const list = Storage.getAdmittedStudents();
    return list.find((s) => s.id === idOrIndex || s.indexNumber === idOrIndex) || null;
  }
};
