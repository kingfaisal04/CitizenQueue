/**
 * CitizenQueue - Institutional Administration Service Layer
 * 
 * Provides administrative functions for school desk officers:
 * - Student cohort registry & dossier inspection
 * - Document verification decision queue
 * - Prospectus item photographic screening desk
 * - Prospectus requirements CRUD
 * - Capacity & slot availability management
 */

import { apiClient } from './api/apiClient';
import { AdmissionService } from './admissionService';
import { Storage } from './storageService';
import { AppointmentService } from './appointmentService';

export const adminService = {
  /**
   * Retrieve institution operational metrics (cohort count, pending reviews, capacity)
   */
  getDashboardMetrics: async () => {
    return apiClient.get('/admin/metrics', {
      localFallbackHandler: () => {
        const students = AdmissionService.getAdmittedStudents();
        const docs = AdmissionService.getDocuments();
        const prospectus = AdmissionService.getProspectus();
        const pStatus = AdmissionService.getStudentProspectusStatus();
        const appointments = AppointmentService.getAll();

        const pendingDocs = docs.filter(
          (d) => d.status === 'submitted' || d.status === 'under_review'
        ).length;

        const pendingItems = Object.values(pStatus).filter(
          (s) => s.photoStatus === 'awaiting_review'
        ).length;

        const totalEnrolled = students.filter(
          (s) => s.admissionStage >= 8 || s.registrationStatus === 'enrolled'
        ).length;

        const highReadiness = students.filter((s) => s.readinessScore >= 80).length;

        return {
          totalAdmitted: students.length,
          pendingDocuments: pendingDocs,
          pendingItemPhotos: pendingItems,
          enrolledCount: totalEnrolled,
          highReadinessCount: highReadiness,
          totalAppointments: appointments.length,
          prospectusItemsTotal: prospectus.length
        };
      }
    });
  },

  /**
   * Retrieve admitted student cohort with optional search/filter
   */
  getAdmittedStudents: async (filters = {}) => {
    return apiClient.get('/admin/students', {
      localFallbackHandler: () => {
        let list = AdmissionService.getAdmittedStudents();

        if (filters.search) {
          const q = filters.search.toLowerCase();
          list = list.filter(
            (s) =>
              s.name.toLowerCase().includes(q) ||
              s.indexNumber.includes(q) ||
              s.programme.toLowerCase().includes(q)
          );
        }

        if (filters.programme && filters.programme !== 'all') {
          list = list.filter((s) => s.programme === filters.programme);
        }

        if (filters.residentialStatus && filters.residentialStatus !== 'all') {
          list = list.filter((s) => s.residentialStatus === filters.residentialStatus);
        }

        if (filters.stage && filters.stage !== 'all') {
          list = list.filter((s) => s.admissionStage === Number(filters.stage));
        }

        return list;
      }
    });
  },

  /**
   * Retrieve individual student comprehensive dossier
   */
  getStudentDossier: async (studentIdOrIndex) => {
    return apiClient.get(`/admin/students/${studentIdOrIndex}`, {
      localFallbackHandler: () => {
        return AdmissionService.getStudentById(studentIdOrIndex);
      }
    });
  },

  /**
   * Review submitted document: approve or request changes with specific feedback
   */
  reviewDocument: async (docId, { status, adminFeedback }) => {
    return apiClient.patch(`/admin/documents/${docId}/review`, { status, adminFeedback }, {
      localFallbackHandler: () => {
        return AdmissionService.adminReviewDocument(docId, { status, adminFeedback });
      }
    });
  },

  /**
   * Review submitted item photo: approve or request corrections
   */
  reviewItemPhoto: async (itemId, { status, adminFeedback }) => {
    return apiClient.patch(`/admin/items/${itemId}/review`, { status, adminFeedback }, {
      localFallbackHandler: () => {
        return AdmissionService.adminReviewItemPhoto(itemId, { status, adminFeedback });
      }
    });
  },

  /**
   * Add a new requirement to the school digital prospectus
   */
  addProspectusRequirement: async (requirementData) => {
    return apiClient.post('/admin/prospectus', requirementData, {
      localFallbackHandler: () => {
        return AdmissionService.addProspectusRequirement(requirementData);
      }
    });
  },

  /**
   * Update an existing prospectus requirement
   */
  updateProspectusRequirement: async (itemId, fields) => {
    return apiClient.put(`/admin/prospectus/${itemId}`, fields, {
      localFallbackHandler: () => {
        return AdmissionService.updateProspectusRequirement(itemId, fields);
      }
    });
  },

  /**
   * Delete a prospectus requirement
   */
  deleteProspectusRequirement: async (itemId) => {
    return apiClient.delete(`/admin/prospectus/${itemId}`, {
      localFallbackHandler: () => {
        return AdmissionService.deleteProspectusRequirement(itemId);
      }
    });
  },

  /**
   * Retrieve reporting capacity slots
   */
  getCapacitySchedule: async () => {
    return apiClient.get('/admin/capacity', {
      localFallbackHandler: () => {
        return Storage.getAvailability();
      }
    });
  },

  /**
   * Update capacity limits for a specific date slot
   */
  updateSlotCapacity: async (serviceId, date, slotId, newCapacity) => {
    return apiClient.patch('/admin/capacity', { serviceId, date, slotId, newCapacity }, {
      localFallbackHandler: () => {
        const availability = Storage.getAvailability();
        const serviceDates = availability[serviceId] || [];
        const dateEntry = serviceDates.find((d) => d.date === date);
        if (dateEntry) {
          const slot = dateEntry.slots.find((s) => s.id === slotId);
          if (slot) {
            slot.capacity = Number(newCapacity);
            Storage.setAvailability(availability);
            return slot;
          }
        }
        throw new Error('Slot not found');
      }
    });
  }
};

