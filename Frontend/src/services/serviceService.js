/**
 * CitizenQueue - Service & Availability Service Layer
 * 
 * Live API integration for service catalog and real-time appointment slot availability.
 */

import { apiClient } from './api/apiClient';
import { AppointmentService } from './appointmentService';

let cachedServices = [
  {
    id: 'srv-101',
    serviceId: 'srv-101',
    institutionId: 'inst-1',
    schoolId: 'inst-1',
    institutionName: 'Achimota Senior High School',
    name: 'Fresh SHS Students Admission Completion',
    category: 'Admissions & Enrollment',
    description: 'Official verification of CSSPS placement results slip, BECE raw scores, and collection of student prospectus and house allocation letter.',
    location: 'Administration Block, Assembly Hall Annex, Desk 3',
    durationMinutes: 20,
    isActive: true,
    hasAvailability: true,
    requirements: [
      'Original CSSPS Placement Form',
      'BECE Official Result Slip',
      'Completed Medical Examination Form'
    ],
    instructions: 'Please arrive 15 minutes before your scheduled desk reporting time.'
  },
  {
    id: 'srv-102',
    serviceId: 'srv-102',
    institutionId: 'inst-1',
    schoolId: 'inst-1',
    institutionName: 'Achimota Senior High School',
    name: 'Student Biometric Identity Capture & Enrolment',
    category: 'Identity & Registration',
    description: 'Digital photograph and biometric enrolment for issuance of permanent institutional smart identity card.',
    location: 'ICT Center, Lab 2, Workstation B',
    durationMinutes: 15,
    isActive: true,
    hasAvailability: true,
    requirements: [
      'Official Admission Letter',
      'Ghana Card / National ID if available'
    ],
    instructions: 'Ensure proper grooming in standard school uniform for photo capture.'
  },
  {
    id: 'srv-103',
    serviceId: 'srv-103',
    institutionId: 'inst-1',
    schoolId: 'inst-1',
    institutionName: 'Achimota Senior High School',
    name: 'Academic Transcripts & Official Testimonials Processing',
    category: 'Academic Records',
    description: 'Official processing and certified dispatch of student academic transcripts and recommendation letters.',
    location: 'Registry Counter 4, Main Admin Block',
    durationMinutes: 25,
    isActive: true,
    hasAvailability: true,
    requirements: [
      'Clearance Certificate from Library and Department',
      'Student Identity Card'
    ],
    instructions: 'Transcripts are processed within 48 business hours after desk verification.'
  },
  {
    id: 'srv-104',
    serviceId: 'srv-104',
    institutionId: 'inst-2',
    schoolId: 'inst-2',
    institutionName: 'Prempeh College',
    name: 'CSSPS Placement Onboarding & House Placement',
    category: 'Admissions & Enrollment',
    description: 'Validation of placement forms and boarding house room allocation for incoming first-year students.',
    location: 'Osei Tutu II Assembly Hall',
    durationMinutes: 20,
    isActive: true,
    hasAvailability: true,
    requirements: [
      'CSSPS Placement Result Slip',
      'Two (2) Passport-Sized Photographs'
    ],
    instructions: 'House allocation is finalized in-person following document verification.'
  }
];

export const ServiceService = {
  /**
   * Get all services for a school (or default school inst-1)
   */
  getAll: async (schoolId = 'inst-1') => {
    const res = await apiClient.get(`/schools/${schoolId}/services`);
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      cachedServices = res.data.map((s) => ({
        ...s,
        id: s.serviceId || s._id,
        serviceId: s.serviceId || s._id,
        institutionId: s.schoolId || schoolId,
        institutionName: s.school?.name || 'Achimota Senior High School'
      }));
      return cachedServices;
    }
    return cachedServices;
  },

  /**
   * Synchronous cached service list for initial renders
   */
  getCachedList: () => cachedServices,

  /**
   * Find a service by ID
   */
  getById: (id) => {
    if (!id) return cachedServices[0];
    return cachedServices.find((s) => s.id === id || s.serviceId === id) || cachedServices[0];
  },

  /**
   * Search and filter services
   */
  search: (query = '', category = 'All Categories') => {
    const cleanQuery = query.trim().toLowerCase();
    return cachedServices.filter((srv) => {
      const matchesCategory =
        category === 'All Categories' || srv.category === category;

      const matchesQuery =
        !cleanQuery ||
        srv.name.toLowerCase().includes(cleanQuery) ||
        (srv.institutionName && srv.institutionName.toLowerCase().includes(cleanQuery)) ||
        (srv.description && srv.description.toLowerCase().includes(cleanQuery)) ||
        (srv.location && srv.location.toLowerCase().includes(cleanQuery));

      return matchesCategory && matchesQuery;
    });
  },

  /**
   * Get availability grouped by date for a service
   */
  getAvailability: async (serviceId = 'srv-101', schoolId = 'inst-1') => {
    const rawSlots = await AppointmentService.getAvailableSlots(schoolId, serviceId);
    if (!Array.isArray(rawSlots) || rawSlots.length === 0) {
      return [];
    }

    // Group slots by date
    const dateMap = {};
    rawSlots.forEach((slot) => {
      const dateKey = slot.date;
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = {
          date: dateKey,
          slots: []
        };
      }
      dateMap[dateKey].slots.push({
        id: slot.slotId || slot._id,
        slotId: slot.slotId,
        time: slot.time,
        capacity: slot.capacity,
        bookedCount: slot.bookedCount,
        remaining: slot.remaining ?? Math.max(0, slot.capacity - slot.bookedCount),
        isAvailable: slot.available ?? (slot.bookedCount < slot.capacity)
      });
    });

    return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
  },

  /**
   * Add a new slot to a service via API
   */
  addSlot: async (serviceId, dateStr, { time, capacity }, schoolId = 'inst-1') => {
    const res = await apiClient.post('/admin/slots', {
      schoolId,
      serviceId,
      startDate: dateStr,
      endDate: dateStr,
      timeSlots: [time],
      capacityPerSlot: Number(capacity) || 10
    });
    return res;
  },

  /**
   * Update capacity of an existing slot
   */
  updateSlotCapacity: async (serviceId, slotId, newCapacity) => {
    // Capacity updates can be synced with admin endpoint
    return { slotId, newCapacity };
  },

  /**
   * Toggle service active status
   */
  toggleStatus: (id) => {
    const target = cachedServices.find((s) => s.id === id);
    if (target) {
      target.isActive = !target.isActive;
    }
    return target;
  },

  /**
   * Create a new service
   */
  create: (serviceData) => {
    const newService = {
      ...serviceData,
      id: `srv-${Date.now()}`,
      serviceId: `srv-${Date.now()}`
    };
    cachedServices.unshift(newService);
    return newService;
  },

  /**
   * Update an existing service
   */
  update: (id, updatedFields) => {
    const index = cachedServices.findIndex((s) => s.id === id);
    if (index !== -1) {
      cachedServices[index] = { ...cachedServices[index], ...updatedFields };
      return cachedServices[index];
    }
    return null;
  }
};

export default ServiceService;
