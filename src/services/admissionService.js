/**
 * CitizenQueue - Admission & Orchestration Service Layer
 * 
 * Provides unified integration with real backend API endpoints for:
 * - Student bio-data & placement profile
 * - Digital prospectus requirements and item purchase status
 * - Item photograph submission & preliminary administrator review
 * - Admission document uploads, status tracking & feedback
 * - Institutional admission cohort statistics & review queues
 * - Dynamic 9-stage admission progress calculation
 */

import { apiClient } from './api/apiClient';
import { GES_FREE_PROSPECTUS_ITEMS } from '../data/gesFreeItems';

// Memory cache for synchronous initial renders
let cachedProfile = null;
let cachedMetrics = null;
let cachedDocuments = [];
let cachedProspectus = [];
let cachedProspectusStatus = {};
let cachedAdmittedStudents = [];

export const AdmissionService = {
  // ==========================================================================
  // 1. STUDENT PROFILE & PLACEMENT MANAGEMENT
  // ==========================================================================

  /**
   * Retrieve active student profile (async API call with sync cache fallback)
   */
  getProfile: async () => {
    const res = await apiClient.get('/students/profile');
    if (res.success && res.data) {
      cachedProfile = {
        ...res.data,
        id: res.data._id || res.data.id,
        beceIndexNumber: res.data.beceIndexNumber || res.data.indexNumber,
        assignedSchool: res.data.assignedSchool || res.data.school?.name || 'Achimota Senior High School'
      };
      return cachedProfile;
    }
    return cachedProfile || {
      fullName: '',
      beceIndexNumber: '',
      programme: 'General Science',
      residentialStatus: 'Boarding',
      assignedSchool: 'Achimota Senior High School',
      isComplete: false
    };
  },

  /**
   * Synchronous cached profile getter for initial React component state
   */
  getCachedProfile: () => {
    return cachedProfile || {
      fullName: '',
      beceIndexNumber: '',
      programme: 'General Science',
      residentialStatus: 'Boarding',
      assignedSchool: 'Achimota Senior High School',
      isComplete: false
    };
  },

  /**
   * Update student profile fields via API
   */
  updateProfile: async (updatedFields) => {
    const res = await apiClient.put('/students/profile', updatedFields);
    if (res.success && res.data) {
      const studentData = res.data.student || res.data;
      cachedProfile = {
        ...studentData,
        id: studentData._id || studentData.id,
        assignedSchool: studentData.assignedSchool || 'Achimota Senior High School'
      };
      if (res.data.admission) {
        cachedMetrics = {
          compositeScore: res.data.readinessScore ?? 20,
          currentStage: res.data.currentStage ?? 2,
          stages: res.data.stages ?? [],
          stats: res.data.stats ?? {}
        };
      }
      return cachedProfile;
    }
    return cachedProfile;
  },

  // ==========================================================================
  // 2. DIGITAL PROSPECTUS & ITEM PHOTO SUBMISSION
  // ==========================================================================

  /**
   * Get master school prospectus requirements from API
   */
  getProspectus: async (schoolId = 'inst-1', gender = null) => {
    const endpoint = gender
      ? `/prospectus/catalog?schoolId=${schoolId}&gender=${gender}`
      : `/prospectus/catalog?schoolId=${schoolId}`;

    const res = await apiClient.get(endpoint);
    if (res.success && Array.isArray(res.data)) {
      cachedProspectus = res.data.map((item) => ({
        ...item,
        id: item.itemId || item._id,
        requiresPhotoReview: item.requiresPhotoReview ?? true
      }));
      return cachedProspectus;
    }
    return cachedProspectus;
  },

  /**
   * Get items provided free of charge by Ghana Education Service
   */
  getGesFreeItems: () => {
    return GES_FREE_PROSPECTUS_ITEMS;
  },

  /**
   * Get student's purchase and photo review status for prospectus items from API
   */
  getStudentProspectusStatus: async () => {
    const res = await apiClient.get('/prospectus/me');
    if (res.success && Array.isArray(res.data)) {
      const statusMap = {};
      res.data.forEach((item) => {
        const id = item.itemId || item.id || item._id;
        statusMap[id] = {
          itemId: id,
          purchased: Boolean(item.purchased),
          photoStatus: item.photoStatus || 'not_submitted',
          photoName: item.photoName || null,
          photoUrl: item.photoUrl || null,
          adminFeedback: item.adminFeedback || null
        };
      });
      cachedProspectusStatus = statusMap;
      return statusMap;
    }
    return cachedProspectusStatus;
  },

  /**
   * Toggle purchase status for a prospectus item via API
   */
  toggleItemPurchased: async (itemId, currentStatus = false) => {
    const newStatus = !currentStatus;
    const res = await apiClient.patch('/prospectus/item-status', {
      itemId,
      acquired: newStatus
    });

    if (res.success) {
      if (!cachedProspectusStatus[itemId]) {
        cachedProspectusStatus[itemId] = { itemId, purchased: newStatus, photoStatus: 'not_submitted' };
      } else {
        cachedProspectusStatus[itemId].purchased = newStatus;
      }
    }
    return cachedProspectusStatus;
  },

  /**
   * Submit visual proof photo for an item
   */
  submitItemPhoto: async (itemId, photoUrl, photoName = 'photo.jpg') => {
    const res = await apiClient.post('/prospectus/item-photo', {
      itemId,
      photoUrl,
      photoName
    });

    if (res.success) {
      if (!cachedProspectusStatus[itemId]) {
        cachedProspectusStatus[itemId] = { itemId, purchased: true, photoStatus: 'awaiting_review', photoUrl, photoName };
      } else {
        cachedProspectusStatus[itemId].purchased = true;
        cachedProspectusStatus[itemId].photoStatus = 'awaiting_review';
        cachedProspectusStatus[itemId].photoUrl = photoUrl;
        cachedProspectusStatus[itemId].photoName = photoName;
      }
    }
    return cachedProspectusStatus;
  },

  /**
   * Officer reviews a prospectus item photograph
   */
  reviewProspectusItem: async (admissionId, itemId, decision, feedback = '') => {
    return await apiClient.patch(`/prospectus/${admissionId}/item-review`, {
      itemId,
      status: decision === 'accepted' ? 'approved' : decision,
      reviewNotes: feedback
    });
  },

  // ==========================================================================
  // 3. ADMISSION DOCUMENT VERIFICATION & UPLOAD MANAGEMENT
  // ==========================================================================

  /**
   * Get student's required and uploaded documents from API
   */
  getDocuments: async (studentId = null) => {
    const endpoint = studentId ? `/documents?studentId=${studentId}` : '/documents';
    const res = await apiClient.get(endpoint);
    if (res.success && Array.isArray(res.data)) {
      cachedDocuments = res.data.map((doc) => ({
        ...doc,
        id: doc.documentRequirementId || doc._id,
        _id: doc._id
      }));
      return cachedDocuments;
    }
    return cachedDocuments;
  },

  /**
   * Secure upload process using presigned URLs
   */
  uploadDocument: async (docId, file) => {
    // 1. Request presigned upload intent from backend
    const intentRes = await apiClient.post('/documents/upload-intent', {
      documentType: 'placement_slip',
      fileName: file.name,
      fileType: file.type || 'application/pdf',
      fileSize: file.size
    });

    let storageKey = `students/${docId}/${Date.now()}_${file.name}`;
    let fileUrl = URL.createObjectURL(file);

    // 2. If backend provided presigned upload URL, dispatch PUT to S3
    if (intentRes.success && intentRes.data?.uploadUrl) {
      storageKey = intentRes.data.storageKey;
      fileUrl = intentRes.data.fileUrl || intentRes.data.uploadUrl.split('?')[0];

      try {
        await fetch(intentRes.data.uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type || 'application/pdf'
          },
          body: file
        });
      } catch (uploadErr) {
        console.warn('[CitizenQueue] Direct vault upload fallback', uploadErr);
      }
    }

    // 3. Confirm upload on backend database
    const confirmRes = await apiClient.post('/documents/confirm', {
      documentId: docId,
      fileKey: storageKey,
      fileName: file.name,
      fileSizeBytes: file.size,
      mimeType: file.type || 'application/pdf',
      fileUrl
    });

    if (confirmRes.success) {
      return confirmRes.data;
    }
    throw new Error(confirmRes.error || 'Failed to complete document upload');
  },

  /**
   * Officer reviews and approves/rejects a document
   */
  reviewDocument: async (docId, decision, feedback = '') => {
    const statusMap = {
      accepted: 'verified',
      changes_required: 'rejected',
      under_review: 'under_review'
    };
    return await apiClient.patch(`/documents/${docId}/review`, {
      status: statusMap[decision] || decision,
      feedback
    });
  },

  /**
   * Batch verify multiple documents
   */
  batchReviewDocuments: async (documentIds, decision, feedback = '') => {
    const statusMap = {
      accepted: 'verified',
      provisionally_accepted: 'verified',
      changes_required: 'rejected'
    };
    return await apiClient.post('/documents/batch-review', {
      documentIds,
      status: statusMap[decision] || decision,
      feedback
    });
  },

  /**
   * Admin wrapper for document review
   */
  adminReviewDocument: async (docId, { status, adminFeedback = '' }) => {
    return AdmissionService.reviewDocument(docId, status, adminFeedback);
  },

  /**
   * Admin wrapper for batch document review
   */
  adminBatchReviewDocuments: async (docIds, { status, adminFeedback = '' }) => {
    return AdmissionService.batchReviewDocuments(docIds, status, adminFeedback);
  },

  /**
   * Administrative document requirement CRUD
   */
  addDocumentRequirement: async (reqData) => {
    cachedDocuments.unshift({
      ...reqData,
      id: `doc-${Date.now()}`,
      status: reqData.status || 'not_submitted'
    });
    return cachedDocuments[0];
  },

  updateDocumentRequirement: async (docId, updatedData) => {
    const idx = cachedDocuments.findIndex((d) => d.id === docId || d._id === docId);
    if (idx !== -1) {
      cachedDocuments[idx] = { ...cachedDocuments[idx], ...updatedData };
      return cachedDocuments[idx];
    }
    return null;
  },

  deleteDocumentRequirement: async (docId) => {
    cachedDocuments = cachedDocuments.filter((d) => d.id !== docId && d._id !== docId);
    return true;
  },

  /**
   * Administrative prospectus requirement CRUD
   */
  adminReviewItemPhoto: async (itemId, { status, adminFeedback = '' }) => {
    return AdmissionService.reviewProspectusItem('adm-1', itemId, status, adminFeedback);
  },

  addProspectusRequirement: async (itemData) => {
    cachedProspectus.unshift({
      ...itemData,
      id: `pr-${Date.now()}`
    });
    return cachedProspectus[0];
  },

  updateProspectusRequirement: async (itemId, updatedData) => {
    const idx = cachedProspectus.findIndex((i) => i.id === itemId || i._id === itemId);
    if (idx !== -1) {
      cachedProspectus[idx] = { ...cachedProspectus[idx], ...updatedData };
      return cachedProspectus[idx];
    }
    return null;
  },

  deleteProspectusRequirement: async (itemId) => {
    cachedProspectus = cachedProspectus.filter((i) => i.id !== itemId && i._id !== itemId);
    return true;
  },

  // ==========================================================================
  // 4. ADMISSION PROGRESSION & READINESS SCORING
  // ==========================================================================

  /**
   * Retrieve dynamic readiness metrics, current stage, and tasks from API
   */
  getReadinessMetrics: async (studentId = null) => {
    const endpoint = studentId ? `/admissions/progress?studentId=${studentId}` : '/admissions/progress';
    const res = await apiClient.get(endpoint);

    if (res.success && res.data) {
      const { readinessScore, currentStage, stages, tasks, stats, student } = res.data;
      cachedMetrics = {
        compositeScore: readinessScore ?? 0,
        currentStage: currentStage ?? 1,
        stages: stages ?? [],
        tasks: tasks ?? [],
        stats: stats ?? {},
        student: student ?? {},
        profileComplete: Boolean(student?.fullName && student?.guardianPhone),
        totalDocs: stats?.documentsRequired ?? 0,
        docsSubmitted: stats?.documentsSubmitted ?? 0,
        docsAccepted: stats?.documentsVerified ?? 0,
        totalProspectusItems: stats?.prospectusTotal ?? 0,
        purchasedCount: stats?.prospectusAcquired ?? 0,
        photosAcceptedCount: stats?.photosApproved ?? 0,
        isReadyForReporting: readinessScore >= 60,
        hasAppointment: Boolean(stats?.hasAppointment)
      };
      return cachedMetrics;
    }

    return cachedMetrics || {
      compositeScore: 0,
      currentStage: 1,
      stages: [],
      tasks: [],
      stats: {},
      profileComplete: false
    };
  },

  /**
   * Get outstanding actionable tasks from API
   */
  getOutstandingTasks: async () => {
    const res = await apiClient.get('/admissions/tasks');
    if (res.success && Array.isArray(res.data)) {
      return res.data;
    }
    return cachedMetrics?.tasks || [];
  },

  // ==========================================================================
  // 5. INSTITUTIONAL ADMITTED COHORT (ADMIN PORTAL)
  // ==========================================================================

  /**
   * Get admitted students list for administrative portal from API
   */
  getAdmittedStudents: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.set('search', filters.search);
    if (filters.programme && filters.programme !== 'All') queryParams.set('programme', filters.programme);
    if (filters.residentialStatus && filters.residentialStatus !== 'All') queryParams.set('residentialStatus', filters.residentialStatus);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/admin/students?${queryString}` : '/admin/students';

    const res = await apiClient.get(endpoint);
    if (res.success && res.data) {
      const studentsList = Array.isArray(res.data.students) ? res.data.students : (Array.isArray(res.data) ? res.data : []);
      cachedAdmittedStudents = studentsList.map((s) => ({
        ...s,
        id: s._id || s.id,
        name: s.fullName || s.name,
        indexNumber: s.beceIndexNumber || s.indexNumber,
        admissionStage: s.currentStage || 1,
        readinessScore: s.readinessScore || 0
      }));
      return cachedAdmittedStudents;
    }
    return cachedAdmittedStudents;
  },

  /**
   * Get single student details with documents and appointments from API
   */
  getStudentById: async (studentId) => {
    const res = await apiClient.get(`/admin/students/${studentId}`);
    if (res.success && res.data) {
      return res.data;
    }
    return null;
  }
};

export default AdmissionService;
