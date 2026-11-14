/**
 * CitizenQueue - Production Authentication Context
 * 
 * Provides real API session persistence, live JWT token handling,
 * role-based access control, and seamless authentication state across
 * Student (Candidate) and Institutional Administrator portals.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { ROLES } from '../utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [token, setToken] = useState(() => authService.getToken());
  const [studentProfile, setStudentProfile] = useState(null);
  const [admissionData, setAdmissionData] = useState(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Restore authenticated session from backend on initial mount
  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const activeToken = authService.getToken();
      if (activeToken) {
        try {
          const res = await authService.getMe();
          if (isMounted && res.success && res.data) {
            setCurrentUser(res.data.user);
            if (res.data.student) setStudentProfile(res.data.student);
            if (res.data.admission) setAdmissionData(res.data.admission);
          }
        } catch (err) {
          if (isMounted) {
            setCurrentUser(null);
            setToken(null);
          }
        }
      }
      if (isMounted) {
        setIsLoadingSession(false);
      }
    }

    restoreSession();

    // Listen for 401 session expiration from apiClient
    const handleSessionExpired = () => {
      setCurrentUser(null);
      setToken(null);
      setStudentProfile(null);
      setAdmissionData(null);
    };

    window.addEventListener('cq:session_expired', handleSessionExpired);
    return () => {
      isMounted = false;
      window.removeEventListener('cq:session_expired', handleSessionExpired);
    };
  }, []);

  /**
   * Authenticate student/citizen with index number or email and password
   */
  const loginAsCitizen = async (credentials) => {
    // If called with specific credentials or fallback to demo account
    const identifier =
      credentials?.beceIndexNumber ||
      credentials?.indexNumber ||
      credentials?.email ||
      credentials?.identifier ||
      '101245089';

    const password = credentials?.password || credentials?.pin || 'Password123!';

    const res = await authService.login({ identifier, password });
    if (res.success) {
      setCurrentUser(res.user);
      setToken(res.token);
      if (res.student) setStudentProfile(res.student);
      if (res.admission) setAdmissionData(res.admission);
    }
    return res;
  };

  /**
   * Authenticate institutional administrator with official email and password
   */
  const loginAsAdmin = async (credentials) => {
    const identifier =
      credentials?.email ||
      credentials?.identifier ||
      'admin@achimota.edu.gh';

    const password = credentials?.password || 'Password123!';

    const res = await authService.login({ identifier, password });
    if (res.success) {
      setCurrentUser(res.user);
      setToken(res.token);
    }
    return res;
  };

  /**
   * Register a new candidate
   */
  const registerCandidate = async (candidateData) => {
    const res = await authService.register(candidateData);
    if (res.success) {
      setCurrentUser(res.user);
      setToken(res.token);
      if (res.student) setStudentProfile(res.student);
      if (res.admission) setAdmissionData(res.admission);
    }
    return res;
  };

  /**
   * Register a new institutional administrator / staff member
   */
  const registerStaff = async (staffData) => {
    const res = await authService.registerAdmin(staffData);
    if (res.success) {
      setCurrentUser(res.user);
      setToken(res.token);
    }
    return res;
  };

  /**
   * Terminate active session
   */
  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setToken(null);
    setStudentProfile(null);
    setAdmissionData(null);
  };

  const hasRole = useCallback(
    (role) => {
      if (!currentUser) return false;
      if (role === 'student' || role === 'citizen') {
        return currentUser.role === 'student' || currentUser.role === 'citizen';
      }
      if (role === 'admin') {
        return [
          'admin',
          'school_admin',
          'academic_officer',
          'finance_officer',
          'library_officer',
          'collection_officer',
          'super_admin'
        ].includes(currentUser.role);
      }
      return currentUser.role === role;
    },
    [currentUser]
  );

  const isStudent = Boolean(
    currentUser && (currentUser.role === 'student' || currentUser.role === 'citizen')
  );

  const isAdmin = Boolean(
    currentUser &&
      [
        'admin',
        'school_admin',
        'academic_officer',
        'finance_officer',
        'library_officer',
        'collection_officer',
        'super_admin'
      ].includes(currentUser.role)
  );

  const isAuthenticated = Boolean(currentUser && currentUser.role !== 'guest');

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        studentProfile,
        admissionData,
        isLoadingSession,
        loginAsCitizen,
        loginAsAdmin,
        registerCandidate,
        registerStaff,
        logout,
        hasRole,
        isStudent,
        isCitizen: isStudent,
        isAdmin,
        isGuest: !isAuthenticated,
        isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
