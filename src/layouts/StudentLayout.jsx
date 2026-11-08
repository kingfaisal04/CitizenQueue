/**
 * CitizenQueue - Student & Guardian Portal Layout
 * 
 * Provides a dedicated workspace for admitted candidates and parents with
 * real-time stage progress, school badge, clear reporting notices, and seamless navigation.
 */

import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdmissionService } from '../services/admissionService';
import {
  School,
  LayoutDashboard,
  User,
  ShoppingBag,
  FileText,
  TrendingUp,
  Calendar,
  LogOut,
  Shield,
  Menu,
  X,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import DemoBanner from '../components/common/DemoBanner';

export default function StudentLayout() {
  const { currentUser, loginAsAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Retrieve student profile & readiness
  const profile = AdmissionService.getProfile();
  const metrics = AdmissionService.getReadinessMetrics();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Admission Profile', path: '/profile', icon: User },
    { name: 'Digital Prospectus', path: '/prospectus', icon: ShoppingBag },
    { name: 'Document Centre', path: '/documents', icon: FileText },
    { name: 'Progress Tracker', path: '/progress', icon: TrendingUp },
    { name: 'Reporting Booking', path: '/book', icon: Calendar }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      {/* Demo storage indicator */}
      <DemoBanner />

      {/* Mandatory Physical Verification Notice Banner */}
      <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Pre-Arrival Notice:</strong> Online document screening accelerates registration. Physical verification and identity inspection remain mandatory upon reporting at school.
            </span>
          </div>
          <span className="hidden md:inline-block text-[11px] font-semibold uppercase tracking-wider bg-amber-200/70 text-amber-800 px-2 py-0.5 rounded">
            GES Policy
          </span>
        </div>
      </div>

      {/* Main Student Portal Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo & School Pill */}
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cqNavy-950 text-white flex items-center justify-center shadow-md">
                  <School className="w-5 h-5 text-cqTeal-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xl tracking-tight text-cqNavy-950">
                      Citizen<span className="text-cqTeal-600">Queue</span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-cqTeal-50 text-cqTeal-800 border border-cqTeal-200 px-1.5 py-0.2 rounded">
                      Student
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 truncate max-w-[200px] sm:max-w-none">
                    {profile.assignedSchool || 'Senior High School Portal'}
                  </p>
                </div>
              </Link>
            </div>

            {/* Candidate Summary & Readiness Badge */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-bold text-slate-900">
                  {currentUser?.name || profile.fullName || 'Candidate'}
                </div>
                <div className="text-xs text-slate-500 flex items-center justify-end gap-1.5">
                  <span>Index: <strong>{profile.beceIndexNumber || '101245089'}</strong></span>
                  <span>•</span>
                  <span>{profile.programme || 'Gen. Science'}</span>
                </div>
              </div>

              {/* Progress pill */}
              <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200">
                <div className="w-7 h-7 rounded-lg bg-cqTeal-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {metrics.compositeScore}%
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Readiness
                  </div>
                  <div className="text-xs font-semibold text-cqNavy-900">
                    Stage {metrics.currentStage} of 9
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions (Switch to Admin / Logout / Mobile Toggle) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  loginAsAdmin();
                  navigate('/admin');
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cqNavy-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                title="Switch persona to Institutional School Admin"
              >
                <Shield className="w-3.5 h-3.5 text-cqNavy-700" />
                <span>Admin Desk</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Sign Out"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Mobile menu button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 -mb-px overflow-x-auto py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all border-b-2 whitespace-nowrap ${
                      isActive
                        ? 'border-cqTeal-600 text-cqTeal-700 bg-cqTeal-50/50'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
            <div className="p-3 bg-slate-50 rounded-xl mb-3 flex items-center justify-between border border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-900">{profile.fullName || 'Candidate'}</p>
                <p className="text-[11px] text-slate-500">{profile.assignedSchool}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-cqTeal-700">{metrics.compositeScore}% Ready</span>
                <p className="text-[10px] text-slate-500">Stage {metrics.currentStage}/9</p>
              </div>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                      isActive
                        ? 'bg-cqTeal-50 text-cqTeal-800 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-cqTeal-600" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  loginAsAdmin();
                  navigate('/admin');
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-cqNavy-900 bg-slate-100 rounded-lg"
              >
                <Shield className="w-4 h-4" />
                Switch to School Administrator Desk
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* Dedicated Student Portal Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                <strong>Fairness Commitment:</strong> Strict first-come queue policy. Zero fee-based priority jumping.
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>School Desk Support: (+233) 30 200 1122</span>
              <span>•</span>
              <Link to="/prospectus" className="text-cqTeal-600 hover:underline">
                View Requirements
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
