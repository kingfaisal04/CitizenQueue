/**
 * CitizenQueue - Student & Guardian Portal Layout
 * 
 * Provides a dedicated workspace for admitted candidates and parents with
 * real-time stage progress, school badge, clear pre-arrival guidelines,
 * elevated segmented pill navigation, and responsive controls.
 */

import React, { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
  Phone,
  ArrowLeft
} from 'lucide-react';

export default function StudentLayout() {
  const { currentUser, loginAsAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Retrieve student profile & readiness
  const profile = AdmissionService.getProfile();
  const metrics = AdmissionService.getReadinessMetrics();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { name: 'Command Centre', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Admission Profile', path: '/profile', icon: User },
    { name: 'Digital Prospectus', path: '/prospectus', icon: ShoppingBag },
    { name: 'Document Centre', path: '/documents', icon: FileText },
    { name: 'Journey Timeline', path: '/progress', icon: TrendingUp },
    { name: 'Reporting Booking', path: '/book', icon: Calendar }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 antialiased">
      
      {/* 1. Official Pre-Arrival Policy Top Notice */}
      <div className="bg-gradient-to-r from-cqNavy-950 via-cqNavy-900 to-cqNavy-950 text-white text-[11px] py-1.5 px-4 border-b border-cqNavy-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 truncate">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="truncate text-slate-300">
              <strong className="text-white font-semibold">Republic of Ghana</strong> • Senior High School Pre-Arrival Admission Orchestration
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 shrink-0 text-slate-300 text-[11px]">
            <span className="flex items-center gap-1 text-cqTeal-300">
              <CheckCircle2 size={12} className="text-emerald-400" />
              <span>Zero Intermediary Fees</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Phone size={11} className="text-cqTeal-400" />
              <span>GES Desk: 030 274 0000</span>
            </span>
            <span className="text-slate-600">|</span>
            <Link
              to="/admin"
              onClick={loginAsAdmin}
              className="text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1 transition-colors"
            >
              <Shield size={12} className="text-cqTeal-400" />
              <span>Staff Desk</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Student Portal Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Row: Brand & Candidate Identity */}
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Brand Logo & Placed School Label */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link to="/dashboard" className="flex items-center gap-3.5 group shrink-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-cqNavy-950 to-cqNavy-900 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-all ring-1 ring-cqNavy-800/20">
                  <School className="w-5 h-5 sm:w-6 sm:h-6 text-cqTeal-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xl sm:text-2xl tracking-tight text-cqNavy-950 font-sans">
                      Citizen<span className="text-cqTeal-600">Queue</span>
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-cqTeal-50 text-cqTeal-800 border border-cqTeal-200/80 px-2 py-0.5 rounded-md hidden sm:inline-block">
                      Candidate Portal
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-500 truncate max-w-[200px] sm:max-w-sm -mt-0.5">
                    {profile.assignedSchool || 'Senior High School Portal'}
                  </p>
                </div>
              </Link>
            </div>

            {/* Candidate Summary & Readiness Badge */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs sm:text-sm font-bold text-slate-900">
                  {currentUser?.name || profile.fullName || 'Candidate'}
                </div>
                <div className="text-xs text-slate-500 flex items-center justify-end gap-1.5 font-medium">
                  <span>BECE: <strong className="text-slate-700 font-mono">{profile.beceIndexNumber || '101245089'}</strong></span>
                  <span>•</span>
                  <span>{profile.programme || 'General Science'}</span>
                </div>
              </div>

              {/* Progress Stage Pill */}
              <Link
                to="/progress"
                className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 shadow-2xs transition-all"
                title="View full admission journey timeline"
              >
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-cqTeal-600 to-cqTeal-700 text-white flex items-center justify-center text-xs font-black shadow-xs">
                  {metrics.compositeScore}%
                </div>
                <div className="text-left pr-1">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Admission
                  </div>
                  <div className="text-xs font-bold text-cqNavy-950">
                    Stage {metrics.currentStage} of 9
                  </div>
                </div>
              </Link>

              {/* User Dropdown / Switch Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-3 pr-2.5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-xs font-semibold text-slate-700 shadow-2xs"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-cqNavy-950 to-cqNavy-900 text-cqTeal-300 flex items-center justify-center font-black text-xs shadow-xs">
                    {(currentUser?.name || profile?.fullName || 'C')[0]}
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-200 ${
                      userDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in divide-y divide-slate-100">
                    <div className="px-4 py-3 space-y-1">
                      <p className="text-xs font-black text-slate-900 truncate">
                        {currentUser?.name || profile.fullName || 'Candidate'}
                      </p>
                      <p className="text-[11px] text-cqTeal-700 font-medium truncate">
                        {profile.assignedSchool}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        BECE: {profile.beceIndexNumber}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                      >
                        <ArrowLeft size={14} className="text-slate-400" />
                        <span>Public Home Overview</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          loginAsAdmin();
                          navigate('/admin');
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                      >
                        <Shield size={14} className="text-cqTeal-600" />
                        <span>Switch to School Staff Desk</span>
                      </button>
                    </div>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Hamburger Actions */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-2xl text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200/80"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Bottom Row: Segmented Navigation Control Strip (Desktop) */}
          <div className="hidden md:block pb-3 pt-0">
            <nav className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/70 overflow-x-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-white text-cqNavy-950 font-bold shadow-xs border border-slate-200/80'
                          : 'text-slate-600 hover:text-cqNavy-950 hover:bg-white/60'
                      }`
                    }
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

        </div>

        {/* 3. Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white/98 backdrop-blur-md px-4 pt-3 pb-6 space-y-4 animate-fade-in shadow-xl">
            
            {/* Candidate Card */}
            <div className="p-3.5 bg-gradient-to-r from-cqNavy-950 to-cqNavy-900 text-white rounded-2xl flex items-center justify-between border border-cqNavy-800 shadow-sm">
              <div className="space-y-0.5">
                <p className="text-xs font-black text-white">{profile.fullName || 'Candidate'}</p>
                <p className="text-[11px] text-cqTeal-300 font-medium truncate max-w-[200px]">{profile.assignedSchool}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-cqTeal-300">{metrics.compositeScore}% Ready</span>
                <p className="text-[10px] text-slate-300">Stage {metrics.currentStage} of 9</p>
              </div>
            </div>

            {/* Nav links */}
            <div className="grid grid-cols-1 gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-cqNavy-950 text-white font-bold shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 text-cqTeal-400" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>

            {/* Mobile Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  loginAsAdmin();
                  navigate('/admin');
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-cqNavy-950 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
              >
                <Shield className="w-4 h-4 text-cqTeal-600" />
                <span>Switch to Staff Desk</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
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
