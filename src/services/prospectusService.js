/**
 * CitizenQueue - Prospectus Service Layer
 * 
 * Coordinates school prospectus requirements, student item purchase tracking,
 * and item photo submissions for preliminary compliance screening.
 */

import { apiClient } from './api/apiClient';
import { AdmissionService } from './admissionService';
import { validateUploadedFile } from '../utils/validation';
import { FILE_LIMITS } from '../utils/constants';

export const prospectusService = {
  /**
   * Get official school prospectus items
   */
  getProspectus: async () => {
    return apiClient.get('/prospectus', {
      localFallbackHandler: () => AdmissionService.getProspectus()
    });
  },

  /**
   * Get student's purchase & photo review status for all items
   */
  getStudentProspectusStatus: async () => {
    return apiClient.get('/student/prospectus-status', {
      localFallbackHandler: () => AdmissionService.getStudentProspectusStatus()
    });
  },

  /**
   * Toggle purchased status for an item
   */
  toggleItemPurchased: async (itemId) => {
    return apiClient.patch(`/student/prospectus-status/${itemId}/toggle`, {}, {
      localFallbackHandler: () => AdmissionService.toggleItemPurchased(itemId)
    });
  },

  /**
   * Set specific purchased state
   */
  setItemPurchased: async (itemId, isPurchased) => {
    return apiClient.patch(`/student/prospectus-status/${itemId}/purchased`, { isPurchased }, {
      localFallbackHandler: () => AdmissionService.setItemPurchased(itemId, isPurchased)
    });
  },

  /**
   * Submit item photo for preliminary screening
   */
  submitItemPhoto: async (itemId, file) => {
    // Validate image format and size
    const validation = validateUploadedFile(file, {
      allowedTypes: FILE_LIMITS.ACCEPTED_IMAGE_TYPES
    });
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    return apiClient.post(`/student/prospectus-status/${itemId}/photo`, { photoName: file.name }, {
      localFallbackHandler: () => {
        const photoUrl = URL.createObjectURL(file);
        return AdmissionService.submitItemPhoto(itemId, {
          photoUrl,
          photoName: file.name
        });
      }
    });
  },

  /**
   * Remove submitted item photo
   */
  removeItemPhoto: async (itemId) => {
    return apiClient.delete(`/student/prospectus-status/${itemId}/photo`, {
      localFallbackHandler: () => AdmissionService.removeItemPhoto(itemId)
    });
  }
};

