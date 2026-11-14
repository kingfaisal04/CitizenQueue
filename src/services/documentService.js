/**
 * CitizenQueue - Document Service Layer
 * 
 * Coordinates student document submissions, validation, presigned S3 upload,
 * and review status retrieval via AdmissionService and real backend API.
 */

import { AdmissionService } from './admissionService';
import { validateUploadedFile } from '../utils/validation';

export const documentService = {
  /**
   * Retrieve list of required admission documents with current student status
   */
  getDocuments: async (studentId = null) => {
    return AdmissionService.getDocuments(studentId);
  },

  /**
   * Upload an admission document with file validation and presigned upload
   */
  uploadDocument: async (docId, file) => {
    const validation = validateUploadedFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    return AdmissionService.uploadDocument(docId, file);
  },

  /**
   * Remove a previously submitted document
   */
  removeDocument: async (docId) => {
    if (typeof AdmissionService.removeDocument === 'function') {
      return AdmissionService.removeDocument(docId);
    }
    return null;
  }
};

export default documentService;
