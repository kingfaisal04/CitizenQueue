/**
 * CitizenQueue - Student Service Layer
 * 
 * Manages student profile data, CSSPS placement verification,
 * overall readiness composite scoring, and action items.
 */

import { apiClient } from './api/apiClient';
import { AdmissionService } from './admissionService';

export const studentService = {
  /**
   * Get active student profile
   */
  getProfile: async () => {
    return apiClient.get('/student/profile', {
      localFallbackHandler: () => AdmissionService.getProfile()
    });
  },

  /**
   * Update student profile
   */
  updateProfile: async (fields) => {
    return apiClient.put('/student/profile', fields, {
      localFallbackHandler: () => AdmissionService.updateProfile(fields)
    });
  },

  /**
   * Verify CSSPS Placement by BECE Index Number
   */
  verifyPlacement: async (indexNumber) => {
    return apiClient.post('/student/verify-placement', { indexNumber }, {
      localFallbackHandler: () => {
        const profile = AdmissionService.getProfile();
        return {
          verified: true,
          candidateName: profile.fullName || 'Emmanuel Mensah',
          beceIndexNumber: indexNumber,
          assignedSchool: profile.assignedSchool || 'Achimota Senior High School',
          programme: profile.programme || 'General Science',
          residentialStatus: profile.residentialStatus || 'Boarding',
          aggregateScore: profile.aggregateScore || 10
        };
      }
    });
  },

  /**
   * Calculate student admission readiness metrics
   */
  getReadinessMetrics: async () => {
    return apiClient.get('/student/readiness', {
      localFallbackHandler: () => AdmissionService.getReadinessMetrics()
    });
  },

  /**
   * Get list of pending actionable tasks for the student dashboard
   */
  getOutstandingTasks: async () => {
    return apiClient.get('/student/tasks', {
      localFallbackHandler: () => AdmissionService.getOutstandingTasks()
    });
  }
};

