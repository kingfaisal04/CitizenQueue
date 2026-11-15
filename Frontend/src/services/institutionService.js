/**
 * CitizenQueue - Institution Service Layer
 * 
 * Provides live integration with backend School API endpoints:
 * - GET /schools
 * - GET /schools/:schoolId
 */

import { apiClient } from './api/apiClient';

let cachedSchools = [];

export const InstitutionService = {
  /**
   * Get all institutions from API
   */
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/schools?${query}` : '/schools';
    const res = await apiClient.get(endpoint);
    if (res.success && Array.isArray(res.data)) {
      cachedSchools = res.data.map((school) => ({
        ...school,
        id: school.schoolId || school._id
      }));
      return cachedSchools;
    }
    return cachedSchools;
  },

  /**
   * Synchronous cached getter for backward compatibility
   */
  getCachedList: () => cachedSchools,

  /**
   * Find an institution by its unique ID
   */
  getById: async (id) => {
    if (!id) return null;
    const cached = cachedSchools.find((inst) => inst.schoolId === id || inst.id === id || inst._id === id);
    if (cached) return cached;

    const res = await apiClient.get(`/schools/${id}`);
    if (res.success && res.data) {
      const school = {
        ...res.data,
        id: res.data.schoolId || res.data._id
      };
      return school;
    }
    return null;
  },

  /**
   * Fetch live system-wide analytics and performance metrics calculated dynamically
   */
  getPublicAnalytics: async () => {
    const res = await apiClient.get('/schools/analytics/public');
    if (res.success && res.data) {
      return res.data;
    }
    return null;
  }
};

export default InstitutionService;
