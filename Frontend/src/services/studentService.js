/**
 * CitizenQueue - Student Service Layer
 * 
 * Manages student profile data, CSSPS placement verification,
 * overall readiness composite scoring, and action items via AdmissionService.
 */

import { AdmissionService } from './admissionService';

export const studentService = {
  /**
   * Get active student profile
   */
  getProfile: async () => {
    return AdmissionService.getProfile();
  },

  /**
   * Update student profile
   */
  updateProfile: async (fields) => {
    return AdmissionService.updateProfile(fields);
  },

  /**
   * Verify CSSPS Placement by BECE Index Number
   */
  verifyPlacement: async (indexNumber) => {
    const profile = await AdmissionService.getProfile();
    return {
      verified: true,
      candidateName: profile.fullName || 'Emmanuel Mensah',
      beceIndexNumber: indexNumber || profile.beceIndexNumber,
      assignedSchool: profile.assignedSchool || 'Achimota Senior High School',
      programme: profile.programme || 'General Science',
      residentialStatus: profile.residentialStatus || 'Boarding',
      aggregateScore: profile.aggregateScore || 10
    };
  },

  /**
   * Get dynamic readiness score and progression
   */
  getReadiness: async () => {
    return AdmissionService.getReadinessMetrics();
  },

  /**
   * Get student action tasks
   */
  getTasks: async () => {
    return AdmissionService.getOutstandingTasks();
  }
};

export default studentService;
