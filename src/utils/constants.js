/**
 * CitizenQueue - Core Constants & Configuration
 * 
 * Defines standard roles, admission stages, document statuses, file limits,
 * and API environment configurations.
 */

export const ROLES = {
  GUEST: 'guest',
  STUDENT: 'citizen',
  ADMIN: 'admin'
};

export const ADMISSION_STAGES = [
  { id: 1, name: 'CSSPS Placement Verified', code: 'PLACEMENT_VERIFIED' },
  { id: 2, name: 'Admission Profile Created', code: 'PROFILE_CREATED' },
  { id: 3, name: 'Requirements & Prospectus Reviewed', code: 'PROSPECTUS_REVIEWED' },
  { id: 4, name: 'Mandatory Documents Uploaded', code: 'DOCS_UPLOADED' },
  { id: 5, name: 'Document Verification Complete', code: 'DOCS_VERIFIED' },
  { id: 6, name: 'Item Photos Preliminarily Screened', code: 'ITEMS_SCREENED' },
  { id: 7, name: 'Reporting Appointment Scheduled', code: 'APPOINTMENT_SCHEDULED' },
  { id: 8, name: 'Reporting Day Check-In & Physical Inspection', code: 'CHECKED_IN' },
  { id: 9, name: 'Final Institutional Enrollment', code: 'ENROLLED' }
];

export const DOCUMENT_STATUSES = {
  NOT_SUBMITTED: 'not_submitted',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  ACCEPTED: 'accepted',
  CHANGES_REQUIRED: 'changes_required'
};

export const PHOTO_STATUSES = {
  NONE: 'none',
  AWAITING_REVIEW: 'awaiting_review',
  ACCEPTED: 'accepted',
  CHANGES_REQUIRED: 'changes_required'
};

export const APPOINTMENT_STATUSES = {
  BOOKED: 'booked',
  CHECKED_IN: 'checked_in',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
};

export const FILE_LIMITS = {
  MAX_SIZE_MB: 5,
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  ACCEPTED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp']
};

export const GHANA_SHS_PROGRAMMES = [
  'General Science',
  'General Arts',
  'Business',
  'Visual Arts',
  'Home Economics',
  'Agricultural Science',
  'Technical / Pre-Engineering'
];

export const RESIDENTIAL_STATUSES = ['Boarding', 'Day'];

export const API_CONFIG = {
  BASE_URL: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || '/api/v1',
  TIMEOUT_MS: 10000,
  SIMULATE_NETWORK_DELAY_MS: 200,
  USE_BACKEND: false // When set to true in production, apiClient calls live REST endpoints
};

