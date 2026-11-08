/**
 * CitizenQueue - Document Service Layer
 * 
 * Coordinates student document submissions, validation, local preview storage,
 * and review status retrieval.
 */

import { apiClient } from './api/apiClient';
import { AdmissionService } from './admissionService';
import { validateUploadedFile } from '../utils/validation';

export const documentService = {
  /**
   * Retrieve list of required admission documents with current student status
   */
  getDocuments: async () => {
    return apiClient.get('/student/documents', {
      localFallbackHandler: () => AdmissionService.getDocuments()
    });
  },

  /**
   * Upload an admission document with file validation
   */
  uploadDocument: async (docId, file) => {
    // 1. Client-side validation
    const validation = validateUploadedFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    return apiClient.post(`/student/documents/${docId}/upload`, { fileName: file.name }, {
      localFallbackHandler: () => {
        const fileUrl = URL.createObjectURL(file);
        return AdmissionService.uploadDocument(docId, {
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(0)} KB`,
          fileUrl
        });
      }
    });
  },

  /**
   * Remove a previously submitted document
   */
  removeDocument: async (docId) => {
    return apiClient.delete(`/student/documents/${docId}`, {
      localFallbackHandler: () => AdmissionService.removeDocument(docId)
    });
  }
};

