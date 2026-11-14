/**
 * CitizenQueue - Prospectus Service Layer
 * 
 * Coordinates school prospectus requirements, student item purchase tracking,
 * and item photo submissions for preliminary compliance screening via AdmissionService.
 */

import { AdmissionService } from './admissionService';
import { validateUploadedFile } from '../utils/validation';

export const prospectusService = {
  /**
   * Get official school prospectus items
   */
  getProspectus: async (schoolId = 'inst-1', gender = null) => {
    return AdmissionService.getProspectus(schoolId, gender);
  },

  /**
   * Get student's purchase & photo review status for all items
   */
  getStudentProspectusStatus: async () => {
    return AdmissionService.getStudentProspectusStatus();
  },

  /**
   * Toggle purchased status for an item
   */
  toggleItemPurchased: async (itemId, currentStatus = false) => {
    return AdmissionService.toggleItemPurchased(itemId, currentStatus);
  },

  /**
   * Submit item photo with validation
   */
  submitItemPhoto: async (itemId, fileOrUrl, fileName = 'photo.jpg') => {
    if (typeof fileOrUrl === 'object' && fileOrUrl instanceof File) {
      const validation = validateUploadedFile(fileOrUrl);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }
      const localUrl = URL.createObjectURL(fileOrUrl);
      return AdmissionService.submitItemPhoto(itemId, localUrl, fileOrUrl.name);
    }
    return AdmissionService.submitItemPhoto(itemId, fileOrUrl, fileName);
  },

  /**
   * Remove a submitted photo
   */
  removeItemPhoto: async (itemId) => {
    if (typeof AdmissionService.removeItemPhoto === 'function') {
      return AdmissionService.removeItemPhoto(itemId);
    }
    return null;
  }
};

export default prospectusService;
