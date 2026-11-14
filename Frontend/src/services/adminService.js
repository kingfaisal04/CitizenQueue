/**
 * CitizenQueue - Institutional Administration Service Layer
 * 
 * Provides administrative functions for school desk officers:
 * - Real-time operational dashboard metrics
 * - Student cohort registry & dossier inspection
 * - Document verification decision queue
 * - Prospectus item photographic screening desk
 * - Capacity & slot availability management
 */

import { apiClient } from './api/apiClient';

export const adminService = {
  /**
   * Retrieve institution operational metrics from backend database
   */
  getDashboardMetrics: async () => {
    const res = await apiClient.get('/admin/dashboard');
    if (res.success && res.data) {
      return {
        totalAdmitted: res.data.totalStudents ?? 0,
        pendingDocuments: res.data.pendingDocsCount ?? 0,
        enrolledCount: res.data.checkedInCount ?? 0,
        highReadinessCount: res.data.fullyReadyCount ?? 0,
        todayStats: res.data.todayStats ?? { booked: 0, checkedIn: 0, completed: 0 }
      };
    }
    return {
      totalAdmitted: 0,
      pendingDocuments: 0,
      enrolledCount: 0,
      highReadinessCount: 0,
      todayStats: { booked: 0, checkedIn: 0, completed: 0 }
    };
  },

  /**
   * Retrieve admitted student cohort with optional search/filter
   */
  getAdmittedStudents: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const endpoint = query ? `/admin/students?${query}` : '/admin/students';
    const res = await apiClient.get(endpoint);

    if (res.success && res.data) {
      const studentsList = Array.isArray(res.data.students)
        ? res.data.students
        : (Array.isArray(res.data) ? res.data : []);

      return studentsList.map((s) => ({
        ...s,
        id: s._id || s.id,
        name: s.fullName || s.name,
        indexNumber: s.beceIndexNumber || s.indexNumber,
        admissionStage: s.currentStage || 1,
        readinessScore: s.readinessScore || 0
      }));
    }
    return [];
  },

  /**
   * Retrieve full candidate dossier
   */
  getStudentDetails: async (studentId) => {
    const res = await apiClient.get(`/admin/students/${studentId}`);
    return res.success ? res.data : null;
  },

  /**
   * List all institutional appointments
   */
  getAppointments: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const endpoint = query ? `/admin/appointments?${query}` : '/admin/appointments';
    const res = await apiClient.get(endpoint);
    return res.success && Array.isArray(res.data) ? res.data : [];
  },

  /**
   * List institutional audit logs
   */
  getAuditLogs: async (limit = 50) => {
    const res = await apiClient.get(`/admin/audit-logs?limit=${limit}`);
    return res.success && Array.isArray(res.data) ? res.data : [];
  },

  /**
   * Bulk generate reporting capacity slots
   */
  createCapacitySlots: async (slotData) => {
    return await apiClient.post('/admin/slots', slotData);
  }
};

export default adminService;
