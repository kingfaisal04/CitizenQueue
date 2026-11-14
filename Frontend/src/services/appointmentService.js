/**
 * CitizenQueue - Appointment Service Layer
 * 
 * Coordinates capacity scheduling, atomic slot reservation, booking retrieval,
 * desk arrival status updates, and physical reporting checklist verification
 * using the real backend API.
 */

import { apiClient } from './api/apiClient';

export const APPOINTMENT_STATUSES = {
  BOOKED: 'booked',
  CHECKED_IN: 'checked_in',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
};

let cachedAppointments = [];

export const AppointmentService = {
  /**
   * Retrieve all appointments for the active user or institution
   */
  getAll: async (params = {}) => {
    // Try admin endpoint first if staff, otherwise fallback to my appointments
    const query = new URLSearchParams(params).toString();
    const adminRes = await apiClient.get(query ? `/admin/appointments?${query}` : '/admin/appointments');
    if (adminRes.success && Array.isArray(adminRes.data)) {
      cachedAppointments = adminRes.data;
      return cachedAppointments;
    }

    const myRes = await apiClient.get('/appointments/my');
    if (myRes.success && Array.isArray(myRes.data)) {
      cachedAppointments = myRes.data;
      return cachedAppointments;
    }

    return cachedAppointments;
  },

  /**
   * Find an appointment by ID or reference number
   */
  getById: async (idOrRef) => {
    const res = await apiClient.get(`/appointments/${idOrRef}`);
    if (res.success && res.data) {
      return res.data;
    }
    return cachedAppointments.find((a) => a._id === idOrRef || a.referenceNumber === idOrRef || a.id === idOrRef) || null;
  },

  /**
   * Filter appointments for active citizen
   */
  getCitizenAppointments: async () => {
    const res = await apiClient.get('/appointments/my');
    if (res.success && Array.isArray(res.data)) {
      cachedAppointments = res.data.map((apt) => ({
        ...apt,
        id: apt._id || apt.id
      }));
      return cachedAppointments;
    }
    return cachedAppointments;
  },

  /**
   * Query real-time available capacity slots from backend database
   */
  getAvailableSlots: async (schoolId = 'inst-1', serviceId = 'srv-101', date = null) => {
    const params = new URLSearchParams({ schoolId, serviceId });
    if (date) params.set('date', date);

    const res = await apiClient.get(`/appointments/slots?${params.toString()}`);
    if (res.success && Array.isArray(res.data)) {
      return res.data.map((s) => ({
        ...s,
        id: s.slotId || s._id,
        available: s.isAvailable,
        remainingCapacity: s.remaining
      }));
    }
    return [];
  },

  /**
   * Concurrency-safe atomic appointment booking
   */
  createAppointment: async ({
    service,
    date,
    slot,
    visitor,
    purpose = 'CSSPS Admission Reporting & Desk Verification'
  }) => {
    const payload = {
      slotId: slot.slotId || slot.id || slot._id,
      serviceId: service.serviceId || service.id || 'srv-101',
      appointmentDate: date,
      timeSlot: slot.time,
      purpose,
      visitorDetails: {
        parentName: visitor.parentName,
        contactPhone: visitor.contactPhone,
        contactEmail: visitor.contactEmail || '',
        studentName: visitor.studentName || '',
        studentIndex: visitor.studentIndex || '',
        notes: visitor.notes || ''
      }
    };

    const res = await apiClient.post('/appointments/book', payload);
    if (res.success && res.data) {
      const created = {
        ...res.data,
        id: res.data._id || res.data.id
      };
      cachedAppointments.unshift(created);
      return { success: true, appointment: created };
    }

    return { success: false, error: res.error || 'Failed to book reporting appointment.' };
  },

  /**
   * Cancel an appointment and restore capacity
   */
  cancelAppointment: async (appointmentId, cancellationReason = 'Cancelled by applicant') => {
    const res = await apiClient.post(`/appointments/${appointmentId}/cancel`, {
      cancellationReason
    });

    if (res.success && res.data) {
      cachedAppointments = cachedAppointments.map((a) =>
        (a._id === appointmentId || a.id === appointmentId) ? { ...a, status: 'cancelled' } : a
      );
      return { success: true, appointment: res.data };
    }
    return { success: false, error: res.error || 'Failed to cancel appointment.' };
  },

  /**
   * Update appointment desk arrival status
   */
  updateStatus: async (appointmentId, newStatus, note = '') => {
    const res = await apiClient.patch(`/appointments/${appointmentId}/desk-status`, {
      deskStatus: newStatus,
      officerNotes: note
    });

    if (res.success && res.data) {
      return { success: true, appointment: res.data };
    }
    return { success: false, error: res.error || 'Failed to update desk status.' };
  },

  /**
   * Toggle physical arrival checklist items verified at the desk
   */
  toggleChecklistItem: async (appointmentId, checklistId, verified = true) => {
    const res = await apiClient.patch(`/appointments/${appointmentId}/checklist`, {
      itemKey: checklistId,
      verified
    });

    if (res.success && res.data) {
      return res.data;
    }
    return null;
  }
};

export default AppointmentService;
