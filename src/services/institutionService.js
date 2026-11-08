/**
 * CitizenQueue - Institution Service Layer
 * 
 * Centralized access to educational institutions in the demonstration.
 */

import { Storage } from './storageService';

export const InstitutionService = {
  /**
   * Get all institutions
   */
  getAll: () => {
    return Storage.getInstitutions();
  },

  /**
   * Find an institution by its unique ID
   */
  getById: (id) => {
    const list = Storage.getInstitutions();
    return list.find((inst) => inst.id === id) || null;
  }
};
