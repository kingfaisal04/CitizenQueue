/**
 * CitizenQueue - Authentication Service Layer
 * 
 * Manages user credentials, session persistence, role validation, and token storage.
 * Designed to cleanly switch between client-side simulation and production REST auth endpoints.
 */

import { apiClient } from './api/apiClient';
import { AdmissionService } from './admissionService';
import { ROLES } from '../utils/constants';

const TOKEN_KEY = 'cq_auth_token';
const USER_KEY = 'cq_demo_user';

export const authService = {
  /**
   * Retrieve active session token
   */
  getToken: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  /**
   * Set active session token
   */
  setToken: (token) => {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (e) {
      console.warn('Storage error saving token', e);
    }
  },

  /**
   * Retrieve current user from storage
   */
  getCurrentUser: () => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Storage error reading user', e);
    }
    return {
      role: ROLES.STUDENT,
      name: 'Emmanuel Mensah',
      guardianName: 'Kwame Mensah',
      email: 'kwame.mensah@example.com',
      phone: '+233 24 411 2233',
      school: 'Achimota Senior High School',
      indexNumber: '101245089',
      programme: 'General Science',
      residentialStatus: 'Boarding'
    };
  },

  /**
   * Log in user with credentials (supports role-based demo personas)
   */
  login: async ({ identifier, password, role = ROLES.STUDENT }) => {
    return apiClient.post('/auth/login', { identifier, password, role }, {
      requiresAuth: false,
      localFallbackHandler: () => {
        let user;
        if (role === ROLES.ADMIN) {
          user = {
            role: ROLES.ADMIN,
            name: 'Admissions Officer Addo',
            email: identifier || 'admissions-desk@achimota.edu.gh',
            institutionId: 'inst-1',
            institutionName: 'Achimota Senior High School'
          };
        } else {
          const profile = AdmissionService.getProfile();
          user = {
            role: ROLES.STUDENT,
            name: profile.fullName || 'Emmanuel Mensah',
            guardianName: profile.guardianName || 'Kwame Mensah',
            email: profile.guardianEmail || 'kwame.mensah@example.com',
            phone: profile.guardianPhone || '+233 24 411 2233',
            school: profile.assignedSchool || 'Achimota Senior High School',
            indexNumber: identifier || profile.beceIndexNumber || '101245089',
            programme: profile.programme || 'General Science',
            residentialStatus: profile.residentialStatus || 'Boarding'
          };
        }

        const mockToken = `demo_jwt_token_${Date.now()}`;
        authService.setToken(mockToken);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return { user, token: mockToken };
      }
    });
  },

  /**
   * Register a new candidate profile
   */
  register: async (candidateData) => {
    return apiClient.post('/auth/register', candidateData, {
      requiresAuth: false,
      localFallbackHandler: () => {
        // Register through AdmissionService store
        const registeredProfile = AdmissionService.registerStudent(candidateData);

        const user = {
          role: ROLES.STUDENT,
          name: registeredProfile.fullName,
          guardianName: registeredProfile.guardianName,
          email: registeredProfile.guardianEmail,
          phone: registeredProfile.guardianPhone,
          school: registeredProfile.assignedSchool,
          indexNumber: registeredProfile.beceIndexNumber,
          programme: registeredProfile.programme,
          residentialStatus: registeredProfile.residentialStatus
        };

        const mockToken = `demo_jwt_token_${Date.now()}`;
        authService.setToken(mockToken);
        localStorage.setItem(USER_KEY, JSON.stringify(user));

        return { user, token: mockToken, profile: registeredProfile };
      }
    });
  },

  /**
   * Terminate current session
   */
  logout: async () => {
    return apiClient.post('/auth/logout', {}, {
      requiresAuth: true,
      localFallbackHandler: () => {
        authService.setToken(null);
        const guestUser = {
          role: ROLES.GUEST,
          name: 'Guest Visitor',
          email: '',
          phone: ''
        };
        localStorage.setItem(USER_KEY, JSON.stringify(guestUser));
        return { message: 'Logged out successfully' };
      }
    });
  }
};
