/**
 * CitizenQueue - Protected Route Guard
 * 
 * Ensures the user has an active session before accessing protected pages.
 * If unauthenticated (role === 'guest'), redirects to /login.
 */

import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isGuest } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || isGuest) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}

