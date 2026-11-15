/**
 * CitizenQueue - Authentication Service Layer
 * 
 * Manages user credentials, session persistence, role validation,
 * and communicates directly with the live REST API auth endpoints.
 */

import { apiClient, setClientToken, getClientToken } from './api/apiClient';
import { ROLES } from '../utils/constants';

export const authService = {
  /**
   * Retrieve active session token
   */
  getToken: () => {
    return getClientToken();
  },

  /**
   * Set active session token
   */
  setToken: (token) => {
    setClientToken(token);
  },

  /**
   * Retrieve current user profile from active session or local cache
   */
  getCurrentUser: () => {
    try {
      const stored = sessionStorage.getItem('cq_user');
      if (stored) return JSON.parse(stored);
    } catch {
      // Fallback
    }
    return null;
  },

  /**
   * Store current user in local session
   */
  setCurrentUser: (user) => {
    try {
      if (user) {
        sessionStorage.setItem('cq_user', JSON.stringify(user));
      } else {
        sessionStorage.removeItem('cq_user');
      }
    } catch {
      // Ignore
    }
  },

  /**
   * Log in user with credentials (supports student index number, email, or phone)
   */
  login: async ({ identifier, password }) => {
    const res = await apiClient.post(
      '/auth/login',
      { identifier, password },
      { requiresAuth: false }
    );

    if (res.success && res.data) {
      const { user, accessToken, student, admission } = res.data;
      if (accessToken) {
        setClientToken(accessToken);
      }
      authService.setCurrentUser(user);
      return { success: true, user, token: accessToken, student, admission };
    }

    return res;
  },

  /**
   * Register a new student candidate profile
   */
  register: async (candidateData) => {
    const payload = {
      fullName: candidateData.fullName,
      email: candidateData.email || candidateData.guardianEmail,
      password: candidateData.password || candidateData.pin || 'Password123!',
      phoneNumber: candidateData.phoneNumber || candidateData.phone || candidateData.guardianPhone,
      indexNumber: candidateData.beceIndexNumber || candidateData.indexNumber,
      schoolId: candidateData.schoolId || candidateData.assignedSchoolId || 'inst-1',
      programme: candidateData.programme || 'General Science',
      residentialStatus: candidateData.residentialStatus || 'Boarding'
    };

    const res = await apiClient.post('/auth/register', payload, { requiresAuth: false });

    if (res.success && res.data) {
      const { user, accessToken, student, admission } = res.data;
      if (accessToken) {
        setClientToken(accessToken);
      }
      authService.setCurrentUser(user);
      return { success: true, user, token: accessToken, student, admission };
    }

    return res;
  },

  /**
   * Register a new institutional administrator or staff officer
   */
  registerAdmin: async (staffData) => {
    const payload = {
      fullName: staffData.fullName || staffData.name,
      email: staffData.email,
      password: staffData.password || 'Password123!',
      phoneNumber: staffData.phone || staffData.phoneNumber,
      schoolId: staffData.schoolId || staffData.institutionId || 'inst-1',
      role: staffData.role || 'school_admin',
      staffId: staffData.staffId
    };

    const res = await apiClient.post('/auth/register-admin', payload, { requiresAuth: false });

    if (res.success && res.data) {
      const { user, accessToken } = res.data;
      if (accessToken) {
        setClientToken(accessToken);
      }
      authService.setCurrentUser(user);
      return { success: true, user, token: accessToken };
    }

    return res;
  },

  /**
   * Fetch active authenticated user context and student/admission data
   */
  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    if (res.success && res.data) {
      authService.setCurrentUser(res.data.user);
    }
    return res;
  },

  /**
   * Terminate active session
   */
  logout: async () => {
    try {
      await apiClient.post('/auth/logout', {});
    } catch {
      // Clear client state even if network fails
    }
    setClientToken(null);
    authService.setCurrentUser(null);
    return { success: true, message: 'Logged out successfully' };
  },

  /**
   * Request password reset OTP via email or phone
   */
  forgotPassword: async ({ identifier, channel = 'email' }) => {
    return await apiClient.post(
      '/auth/forgot-password',
      { identifier, channel },
      { requiresAuth: false }
    );
  },

  /**
   * Verify password reset OTP
   */
  verifyResetOtp: async ({ identifier, otp }) => {
    return await apiClient.post(
      '/auth/verify-reset-otp',
      { identifier, otp },
      { requiresAuth: false }
    );
  },

  /**
   * Complete password reset with OTP and new password
   */
  resetPassword: async ({ identifier, otp, newPassword }) => {
    return await apiClient.post(
      '/auth/reset-password',
      { identifier, otp, newPassword },
      { requiresAuth: false }
    );
  }
};

export default authService;
