/**
 * CitizenQueue - Student & Guardian Portal Layout
 * 
 * Provides a dedicated, production-grade workspace for admitted candidates and parents with
 * real-time stage progress, school badge, clear pre-arrival guidelines, and seamless navigation.
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
  CheckCircle2,
  ChevronDown
} from 'lucide-react';

export default function StudentLayout() {
  const { currentUser, loginAsAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
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
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 antialiased">
      
      {/* Official Pre-Arrival Policy Notice */}
      <div className="bg-cqNavy-950 text-white text-xs py-2 px-4 border-b border-cqNavy-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-cqTeal-400 shrink-0 animate-pulse" />
            <span className="truncate">
              <strong>Official Notice:</strong> Preliminary online document and item reviews reduce registration queues. Physical reporting on campus remains mandatory.
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 shrink-0 text-[11px] text-slate-300">
            <span>GES Accreditation</span>
            <span>•</span>
            <span>Zero Queue Fees</span>
          </div>
        </div>
      </div>

      {/* Main Student Portal Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Brand Logo & Assigned School */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link to="/dashboard" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-cqNavy-950 text-white flex items-center justify-center shadow-md group-hover:bg-cqNavy-900 transition-colors">
                  <School className="w-5 h-5 text-cqTeal-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xl tracking-tight text-cqNavy-950 font-sans">
                      Citizen<span className="text-cqTeal-600">Queue</span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-cqTeal-50 text-cqTeal-800 border border-cqTeal-200 px-1.5 py-0.2 rounded hidden sm:inline-block">
                      Candidate
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-500 truncate max-w-[190px] sm:max-w-xs">
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
                <div className="text-xs text-slate-500 flex items-center justify-end gap-1.5 font-medium">
                  <span>BECE: <strong className="text-slate-700">{profile.beceIndexNumber || '101245089'}</strong></span>
                  <span>•</span>
                  <span>{profile.programme || 'General Science'}</span>
                </div>
              </div>

              {/* Progress pill */}
              <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200 shadow-xs">
                <div className="w-7 h-7 rounded-lg bg-cqTeal-600 text-white flex items-center justify-center text-xs font-bold">
                  {metrics.compositeScore}%
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Admission
                  </div>
                  <div className="text-xs font-semibold text-cqNavy-900">
                    Stage {metrics.currentStage} of 9
                  </div>
                </div>
              </div>

              {/* User Dropdown / Switch Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 pr-2 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700"
                >
                  <div className="w-6 h-6 rounded-lg bg-cqNavy-900 text-cqTeal-300 flex items-center justify-center font-bold text-[11px]">
                    {(currentUser?.name || 'C')[0]}
                  </div>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser?.email || profile.guardianPhone}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        loginAsAdmin();
                        navigate('/admin');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                    >
                      <Shield size={14} className="text-cqNavy-700" />
                      <span>Switch to School Staff Desk</span>
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
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
                    `flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all border-b-2 whitespace-nowrap ${
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
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-cqNavy-900 bg-slate-100 rounded-xl"
              >
                <Shield className="w-4 h-4" />
                Staff Administration Desk
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* Institutional Support Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                <strong>Ghana Education Service Compliant:</strong> Strict first-come queue policy. Zero fee-based priority jumping.
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
