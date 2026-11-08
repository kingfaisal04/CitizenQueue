/**
 * CitizenQueue - Demonstration & Production Authentication Context
 * 
 * Provides frictionless role switching, session persistence, and role-based access control
 * for Students/Guardians (Citizen Platform) and School Administrators (Institution Desk).
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdmissionService } from '../services/admissionService';
import { authService } from '../services/authService';
import { ROLES } from '../utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [token, setToken] = useState(() => authService.getToken());

  // Keep local storage in sync
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('cq_demo_user', JSON.stringify(currentUser));
      }
    } catch (e) {
      console.warn('Could not save demo user state', e);
    }
  }, [currentUser]);

  const loginAsCitizen = (userDataOrName) => {
    let user;
    if (typeof userDataOrName === 'object' && userDataOrName !== null) {
      user = {
        role: ROLES.STUDENT,
        name: userDataOrName.name || userDataOrName.fullName || 'Emmanuel Mensah',
        guardianName: userDataOrName.guardianName || 'Kwame Mensah',
        email: userDataOrName.email || userDataOrName.guardianEmail || 'kwame.mensah@example.com',
        phone: userDataOrName.phone || userDataOrName.guardianPhone || '+233 24 411 2233',
        school: userDataOrName.school || userDataOrName.assignedSchool || 'Achimota Senior High School',
        indexNumber: userDataOrName.indexNumber || userDataOrName.beceIndexNumber || '101245089',
        programme: userDataOrName.programme || 'General Science',
        residentialStatus: userDataOrName.residentialStatus || 'Boarding'
      };
    } else {
      user = {
        role: ROLES.STUDENT,
        name: userDataOrName || 'Emmanuel Mensah',
        guardianName: 'Kwame Mensah',
        email: 'kwame.mensah@example.com',
        phone: '+233 24 411 2233',
        school: 'Achimota Senior High School',
        indexNumber: '101245089',
        programme: 'General Science',
        residentialStatus: 'Boarding'
      };
    }
    const mockToken = `demo_jwt_student_${Date.now()}`;
    authService.setToken(mockToken);
    setToken(mockToken);
    setCurrentUser(user);
  };

  const loginAsAdmin = (officerDataOrInstName) => {
    let user;
    if (typeof officerDataOrInstName === 'object' && officerDataOrInstName !== null) {
      user = {
        role: ROLES.ADMIN,
        name: officerDataOrInstName.name || 'Admissions Officer Addo',
        email: officerDataOrInstName.email || 'admissions-desk@achimota.edu.gh',
        institutionId: officerDataOrInstName.institutionId || 'inst-1',
        institutionName: officerDataOrInstName.institutionName || 'Achimota Senior High School'
      };
    } else {
      user = {
        role: ROLES.ADMIN,
        name: 'Admissions Officer Addo',
        email: 'admissions-desk@achimota.edu.gh',
        institutionId: 'inst-1',
        institutionName: officerDataOrInstName || 'Achimota Senior High School'
      };
    }
    const mockToken = `demo_jwt_admin_${Date.now()}`;
    authService.setToken(mockToken);
    setToken(mockToken);
    setCurrentUser(user);
  };

  const registerCandidate = (candidateData) => {
    // 1. Update admission service store
    const registeredProfile = AdmissionService.registerStudent(candidateData);

    // 2. Set current auth session to this student
    loginAsCitizen(registeredProfile);
    return registeredProfile;
  };

  const logout = () => {
    authService.setToken(null);
    setToken(null);
    setCurrentUser({
      role: ROLES.GUEST,
      name: 'Guest Visitor',
      email: '',
      phone: ''
    });
  };

  const hasRole = (role) => {
    if (!currentUser) return false;
    if (role === 'student' || role === 'citizen') {
      return currentUser.role === ROLES.STUDENT;
    }
    return currentUser.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        loginAsCitizen,
        loginAsAdmin,
        registerCandidate,
        logout,
        hasRole,
        isStudent: currentUser?.role === ROLES.STUDENT,
        isCitizen: currentUser?.role === ROLES.STUDENT,
        isAdmin: currentUser?.role === ROLES.ADMIN,
        isGuest: currentUser?.role === ROLES.GUEST,
        isAuthenticated: currentUser?.role === ROLES.STUDENT || currentUser?.role === ROLES.ADMIN
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
