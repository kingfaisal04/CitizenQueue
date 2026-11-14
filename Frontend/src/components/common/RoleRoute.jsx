/**
 * CitizenQueue - Role-Based Route Guard
 * 
 * Enforces role authorization (e.g. 'admin' or 'student'/'citizen').
 * If user lacks required role, renders an informative access-restricted screen
 * with quick actions to switch demo roles or navigate home.
 */

import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, UserCheck } from 'lucide-react';

export default function RoleRoute({ allowedRoles = [], children }) {
  const { currentUser, loginAsCitizen, loginAsAdmin } = useAuth();
  const currentRole = currentUser?.role || 'guest';

  // Check if role is authorized (allow 'student' or 'citizen' interchangeably)
  const isAuthorized = allowedRoles.some((role) => {
    if (role === 'student' || role === 'citizen') {
      return currentRole === 'student' || currentRole === 'citizen';
    }
    return currentRole === role;
  });

  if (!isAuthorized) {
    const requiredRoleName = allowedRoles.includes('admin')
      ? 'Institutional Administrator'
      : 'Admitted Student or Guardian';

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-amber-200">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Access Restricted to {requiredRoleName}
          </h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Your current active session is signed in as{' '}
            <strong className="text-slate-900 capitalize">{currentRole}</strong> (
            {currentUser?.name || 'Visitor'}). This section requires authorization as a{' '}
            <strong>{requiredRoleName}</strong>.
          </p>

          <div className="flex flex-col gap-3">
            {allowedRoles.includes('admin') && (
              <button
                type="button"
                onClick={() => loginAsAdmin()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cqNavy-900 text-white rounded-xl text-sm font-semibold hover:bg-cqNavy-950 transition-colors shadow-sm"
              >
                <UserCheck className="w-4 h-4 text-cqTeal-400" />
                Switch Session to School Administrator Desk
              </button>
            )}

            {(allowedRoles.includes('student') || allowedRoles.includes('citizen')) && (
              <button
                type="button"
                onClick={() => loginAsCitizen()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cqTeal-600 text-white rounded-xl text-sm font-semibold hover:bg-cqTeal-700 transition-colors shadow-sm"
              >
                <UserCheck className="w-4 h-4" />
                Switch Session to Admitted Student
              </button>
            )}

            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Public Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children ? children : <Outlet />;
}

