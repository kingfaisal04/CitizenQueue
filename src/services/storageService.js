/**
 * CitizenQueue - Local Storage Service
 * 
 * Provides safe abstraction over browser localStorage with error handling,
 * initial fallback data seeding, and prototype reset capabilities for both
 * General Public Services and SHS Admission Orchestration workflows.
 */

import {
  INITIAL_INSTITUTIONS,
  INITIAL_SERVICES,
  INITIAL_AVAILABILITY,
  INITIAL_APPOINTMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_STUDENT_PROFILE,
  INITIAL_PROSPECTUS,
  INITIAL_STUDENT_PROSPECTUS_STATUS,
  INITIAL_STUDENT_DOCUMENTS,
  INITIAL_ADMITTED_STUDENTS
} from '../data/mockData';

const KEYS = {
  INSTITUTIONS: 'citizenqueue_institutions',
  SERVICES: 'citizenqueue_services',
  AVAILABILITY: 'citizenqueue_availability',
  APPOINTMENTS: 'citizenqueue_appointments',
  NOTIFICATIONS: 'citizenqueue_notifications',
  STUDENT_PROFILE: 'citizenqueue_student_profile',
  PROSPECTUS: 'citizenqueue_prospectus',
  STUDENT_PROSPECTUS_STATUS: 'citizenqueue_student_prospectus_status',
  STUDENT_DOCUMENTS: 'citizenqueue_student_documents',
  ADMITTED_STUDENTS: 'citizenqueue_admitted_students',
  INITIALIZED: 'citizenqueue_initialized_v2_1'
};

/**
 * Safely parse JSON from localStorage, returning fallback on failure
 */
function safeGetItem(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (error) {
    console.warn(`[CitizenQueue Storage] Error parsing key "${key}", using fallback:`, error);
    return fallback;
  }
}

/**
 * Safely stringify and store JSON in localStorage
 */
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`[CitizenQueue Storage] Error saving key "${key}":`, error);
  }
}

/**
 * Seeds local storage with initial demonstration mock data if not already present
 */
export function initializeStorage() {
  const isInitialized = localStorage.getItem(KEYS.INITIALIZED);
  
  // Seed if brand new or if any newly introduced admission keys are absent
  if (!isInitialized || !localStorage.getItem(KEYS.STUDENT_PROFILE)) {
    console.log('[CitizenQueue] Initializing admission orchestration demonstration storage...');
    safeSetItem(KEYS.INSTITUTIONS, INITIAL_INSTITUTIONS);
    safeSetItem(KEYS.SERVICES, INITIAL_SERVICES);
    safeSetItem(KEYS.AVAILABILITY, INITIAL_AVAILABILITY);
    safeSetItem(KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    safeSetItem(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    safeSetItem(KEYS.STUDENT_PROFILE, INITIAL_STUDENT_PROFILE);
    safeSetItem(KEYS.PROSPECTUS, INITIAL_PROSPECTUS);
    safeSetItem(KEYS.STUDENT_PROSPECTUS_STATUS, INITIAL_STUDENT_PROSPECTUS_STATUS);
    safeSetItem(KEYS.STUDENT_DOCUMENTS, INITIAL_STUDENT_DOCUMENTS);
    safeSetItem(KEYS.ADMITTED_STUDENTS, INITIAL_ADMITTED_STUDENTS);
    localStorage.setItem(KEYS.INITIALIZED, 'true');
  } else {
    // Ensure newly defined prospectus items are merged if master list was expanded
    try {
      const stored = safeGetItem(KEYS.PROSPECTUS, []);
      if (Array.isArray(stored) && stored.length < INITIAL_PROSPECTUS.length) {
        const existingIds = new Set(stored.map((p) => p.id));
        const merged = [...stored];
        INITIAL_PROSPECTUS.forEach((item) => {
          if (!existingIds.has(item.id)) {
            merged.push(item);
          }
        });
        safeSetItem(KEYS.PROSPECTUS, merged);
      }
    } catch {
      // Ignore sync error
    }
  }
}

/**
 * Reset all storage back to default demonstration datasets
 */
export function resetPrototypeStorage() {
  try {
    safeSetItem(KEYS.INSTITUTIONS, INITIAL_INSTITUTIONS);
    safeSetItem(KEYS.SERVICES, INITIAL_SERVICES);
    safeSetItem(KEYS.AVAILABILITY, INITIAL_AVAILABILITY);
    safeSetItem(KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    safeSetItem(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    safeSetItem(KEYS.STUDENT_PROFILE, INITIAL_STUDENT_PROFILE);
    safeSetItem(KEYS.PROSPECTUS, INITIAL_PROSPECTUS);
    safeSetItem(KEYS.STUDENT_PROSPECTUS_STATUS, INITIAL_STUDENT_PROSPECTUS_STATUS);
    safeSetItem(KEYS.STUDENT_DOCUMENTS, INITIAL_STUDENT_DOCUMENTS);
    safeSetItem(KEYS.ADMITTED_STUDENTS, INITIAL_ADMITTED_STUDENTS);
    localStorage.setItem(KEYS.INITIALIZED, 'true');
    return { success: true };
  } catch (error) {
    console.error('[CitizenQueue Storage] Failed to reset storage:', error);
    return { success: false, error: error.message };
  }
}

export const Storage = {
  getInstitutions: () => safeGetItem(KEYS.INSTITUTIONS, INITIAL_INSTITUTIONS),
  setInstitutions: (data) => safeSetItem(KEYS.INSTITUTIONS, data),

  getServices: () => safeGetItem(KEYS.SERVICES, INITIAL_SERVICES),
  setServices: (data) => safeSetItem(KEYS.SERVICES, data),

  getAvailability: () => safeGetItem(KEYS.AVAILABILITY, INITIAL_AVAILABILITY),
  setAvailability: (data) => safeSetItem(KEYS.AVAILABILITY, data),

  getAppointments: () => safeGetItem(KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS),
  setAppointments: (data) => safeSetItem(KEYS.APPOINTMENTS, data),

  getNotifications: () => safeGetItem(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS),
  setNotifications: (data) => safeSetItem(KEYS.NOTIFICATIONS, data),

  // SHS Admission & Orchestration Storage Hooks
  getStudentProfile: () => safeGetItem(KEYS.STUDENT_PROFILE, INITIAL_STUDENT_PROFILE),
  setStudentProfile: (data) => safeSetItem(KEYS.STUDENT_PROFILE, data),

  getProspectus: () => safeGetItem(KEYS.PROSPECTUS, INITIAL_PROSPECTUS),
  setProspectus: (data) => safeSetItem(KEYS.PROSPECTUS, data),

  getStudentProspectusStatus: () => safeGetItem(KEYS.STUDENT_PROSPECTUS_STATUS, INITIAL_STUDENT_PROSPECTUS_STATUS),
  setStudentProspectusStatus: (data) => safeSetItem(KEYS.STUDENT_PROSPECTUS_STATUS, data),

  getStudentDocuments: () => safeGetItem(KEYS.STUDENT_DOCUMENTS, INITIAL_STUDENT_DOCUMENTS),
  setStudentDocuments: (data) => safeSetItem(KEYS.STUDENT_DOCUMENTS, data),

  getAdmittedStudents: () => safeGetItem(KEYS.ADMITTED_STUDENTS, INITIAL_ADMITTED_STUDENTS),
  setAdmittedStudents: (data) => safeSetItem(KEYS.ADMITTED_STUDENTS, data)
};
