/**
 * CitizenQueue - Core Constants & Configuration
 * 
 * Defines standard roles, admission stages, document statuses, file limits,
 * and API environment configurations.
 */

export const ROLES = {
  GUEST: 'guest',
  STUDENT: 'student',
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
  NOT_SUBMITTED: 'not_submitted',
  AWAITING_REVIEW: 'awaiting_review',
  PROVISIONALLY_ACCEPTED: 'provisionally_accepted',
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

const DEFAULT_PRODUCTION_API_URL = 'https://citizenqueue.onrender.com/api/v1';
const DEFAULT_LOCAL_API_URL = 'http://localhost:5000/api/v1';

const resolveApiBaseUrl = () => {
  const envUrl =
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL);

  const isLocalHost =
    typeof window !== 'undefined' &&
    ['localhost', '127.0.0.1'].includes(window.location.hostname);

  const isProdBuild =
    typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PROD;

  const fallbackUrl =
    isProdBuild && !isLocalHost ? DEFAULT_PRODUCTION_API_URL : DEFAULT_LOCAL_API_URL;

  const raw = (envUrl || fallbackUrl).trim().replace(/\/+$/, '');

  // Safeguard: never allow a deployed non-localhost frontend to silently target localhost
  if (!isLocalHost && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(raw)) {
    return DEFAULT_PRODUCTION_API_URL;
  }

  if (raw.endsWith('/api/v1')) {
    return raw;
  }
  return `${raw}/api/v1`;
};

export const API_CONFIG = {
  BASE_URL: resolveApiBaseUrl(),
  TIMEOUT_MS: 45000,
  SIMULATE_NETWORK_DELAY_MS: 0,
  USE_BACKEND: true
};
