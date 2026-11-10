/**
 * CitizenQueue - Main Application Component & Router Configuration
 * 
 * Sets up React Router DOM navigation for:
 * 1. Public Portal (Landing, Authentication, Service Discovery, Booking)
 * 2. Student & Guardian Portal (Protected, StudentLayout)
 * 3. Institutional Administrator Portal (Protected, AdminLayout)
 * 
 * Includes global toast feedback provider (AppProvider) and auth state (AuthProvider).
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { initializeStorage } from './services/storageService';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';

// Route Guards
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRoute from './components/common/RoleRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import ScrollToTop from './components/common/ScrollToTop';

// Public & Citizen Pages
import LandingPage from './pages/citizen/LandingPage';
import BookingPage from './pages/citizen/BookingPage';
import BookingConfirmationPage from './pages/citizen/BookingConfirmationPage';
import AppointmentDetailsPage from './pages/citizen/AppointmentDetailsPage';
import SignInPage from './pages/citizen/SignInPage';
import RegisterPage from './pages/citizen/RegisterPage';

// Student Dedicated Portal Pages
import CitizenDashboardPage from './pages/citizen/CitizenDashboardPage';
import AdmissionProfilePage from './pages/citizen/AdmissionProfilePage';
import DigitalProspectusPage from './pages/citizen/DigitalProspectusPage';
import DocumentCentrePage from './pages/citizen/DocumentCentrePage';
import AdmissionProgressPage from './pages/citizen/AdmissionProgressPage';

// Institution / School Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';
import AdminDocumentReviewPage from './pages/admin/AdminDocumentReviewPage';
import AdminProspectusPage from './pages/admin/AdminProspectusPage';
import AdminAppointmentsPage from './pages/admin/AdminAppointmentsPage';
import AdminAvailabilityPage from './pages/admin/AdminAvailabilityPage';
import AdminServicesPage from './pages/admin/AdminServicesPage';

// Fallback Page
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  // Ensure local storage has demonstration dataset seeded on startup
  useEffect(() => {
    initializeStorage();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
            {/* 1. Public Portal Pages */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/services" element={<Navigate to="/" replace />} />
              <Route path="/services/:serviceId" element={<Navigate to="/" replace />} />
              <Route path="/book" element={<BookingPage />} />
              <Route path="/book/:serviceId" element={<BookingPage />} />
              <Route path="/booking-confirmation/:appointmentId" element={<BookingConfirmationPage />} />
              <Route path="/appointments/:appointmentId" element={<AppointmentDetailsPage />} />
              <Route path="/login" element={<SignInPage />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/signup" element={<RegisterPage />} />
            </Route>

            {/* 2. Admitted Student & Guardian Portal (Protected by Auth & Student Role) */}
            <Route
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['student', 'citizen']}>
                    <StudentLayout />
                  </RoleRoute>
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<CitizenDashboardPage />} />
              <Route path="/profile" element={<AdmissionProfilePage />} />
              <Route path="/prospectus" element={<DigitalProspectusPage />} />
              <Route path="/documents" element={<DocumentCentrePage />} />
              <Route path="/progress" element={<AdmissionProgressPage />} />
            </Route>

            {/* 3. Institutional Administrator Portal (Protected by Auth & Admin Role) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['admin']}>
                    <AdminLayout />
                  </RoleRoute>
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="students" element={<AdminStudentsPage />} />
              <Route path="documents" element={<AdminDocumentReviewPage />} />
              <Route path="prospectus" element={<AdminProspectusPage />} />
              <Route path="appointments" element={<AdminAppointmentsPage />} />
              <Route path="availability" element={<AdminAvailabilityPage />} />
              <Route path="services" element={<AdminServicesPage />} />
            </Route>

            {/* 4. Global 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  </ErrorBoundary>
  );
}
