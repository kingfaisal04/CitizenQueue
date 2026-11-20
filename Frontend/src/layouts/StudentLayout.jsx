/**
 * CitizenQueue - Student & Guardian Portal Layout
 * 
 * Provides a dedicated workspace for admitted candidates and parents with
 * real-time stage progress, school badge, clear pre-arrival guidelines,
 * elevated segmented pill navigation, and responsive controls across all viewports.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
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
  const { currentUser, studentProfile, admissionData, loginAsAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [profile, setProfile] = useState(studentProfile || {});
  const [metrics, setMetrics] = useState({
    compositeScore: admissionData?.readinessScore ?? 0,
    currentStage: admissionData?.currentStage ?? 1
  });

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll-aware frosted glass header elevation
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Resolve real student profile & readiness metrics asynchronously
  useEffect(() => {
    let isMounted = true;

    if (studentProfile) {
      setProfile(studentProfile);
    }
    if (admissionData) {
      setMetrics({
        compositeScore: admissionData.readinessScore ?? 0,
        currentStage: admissionData.currentStage ?? 1
      });
    }

    const loadStudentHeader = async () => {
      try {
        const [p, m] = await Promise.all([
          AdmissionService.getProfile(),
          AdmissionService.getReadinessMetrics()
        ]);
        if (isMounted) {
          if (p) setProfile(p);
          if (m) {
            setMetrics({
              compositeScore: m.compositeScore ?? 0,
              currentStage: m.currentStage ?? 1
            });
          }
        }
      } catch {
        // Retain context data if network fetch fails
      }
    };
    loadStudentHeader();
    return () => {
      isMounted = false;
    };
  }, [studentProfile, admissionData]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Close menus on Escape key
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setUserDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close drawers/dropdowns on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: 'Command Centre', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Admission Profile', path: '/profile', icon: User },
    { name: 'Digital Prospectus', path: '/prospectus', icon: ShoppingBag },
    { name: 'Document Centre', path: '/documents', icon: FileText },
    { name: 'Journey Timeline', path: '/progress', icon: TrendingUp },
    { name: 'Reporting Booking', path: '/book', icon: Calendar }
  ];

  const displayName = currentUser?.name || profile?.fullName || 'Candidate';
  const displaySchool = profile?.assignedSchool || 'Senior High School Portal';
  const displayIndex = profile?.beceIndexNumber || '';
  const displayProgramme = profile?.programme || 'General Science';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 antialiased">
      
      {/* 1. Official Pre-Arrival Policy Top Notice (Hidden on mobile devices) */}
      <div className="hidden sm:block bg-gradient-to-r from-cqNavy-950 via-cqNavy-900 to-cqNavy-950 text-white text-[11px] py-1.5 px-4 border-b border-cqNavy-800/90">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="truncate text-slate-300">
              <strong className="text-white font-semibold">Republic of Ghana</strong> • Senior High School Pre-Arrival Admission Orchestration
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 md:gap-4 shrink-0 text-slate-300 text-[11px]">
            <span className="flex items-center gap-1 text-cqTeal-300 whitespace-nowrap">
              <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
              <span>Zero Intermediary Fees</span>
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:flex items-center gap-1 text-slate-300 whitespace-nowrap">
              <Phone size={11} className="text-cqTeal-400 shrink-0" />
              <span>GES Desk: 030 274 0000</span>
            </span>
            <span className="text-slate-600">|</span>
            <Link
              to="/admin"
              onClick={loginAsAdmin}
              className="text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1 transition-colors whitespace-nowrap"
            >
              <Shield size={12} className="text-cqTeal-400 shrink-0" />
              <span>Staff Desk</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Student Portal Header */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-all duration-300 ${
          isScrolled
            ? 'bg-white/92 border-slate-200/90 shadow-[0_8px_30px_rgb(15,23,42,0.06)]'
            : 'bg-white/88 border-slate-200/75 shadow-2xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Row: Brand & Candidate Identity */}
          <div className="flex items-center justify-between gap-3 h-16 sm:h-[74px]">
            
            {/* Brand Logo & Placed School Label */}
            <div className="flex items-center gap-3 min-w-0">
              <Link
                to="/dashboard"
                className="flex items-center gap-2.5 sm:gap-3.5 group min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-cqTeal-500/40 rounded-2xl"
              >
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-cqNavy-900 via-cqNavy-950 to-cqNavy-950 text-white flex items-center justify-center shadow-[0_6px_16px_-4px_rgba(15,23,42,0.35)] ring-1 ring-inset ring-white/10 group-hover:-translate-y-0.5 group-hover:shadow-[0_10px_22px_-6px_rgba(15,23,42,0.45)] transition-all duration-200 shrink-0">
                  <School className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-cqTeal-400 group-hover:scale-105 transition-transform duration-200" />
                </div>
                <div className="min-w-0 leading-tight">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg sm:text-[22px] tracking-[-0.025em] text-cqNavy-950 font-sans truncate">
                      Citizen<span className="text-cqTeal-600">Queue</span>
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-cqTeal-50 text-cqTeal-800 border border-cqTeal-200/80 px-2 py-0.5 rounded-md hidden sm:inline-block shrink-0">
                      Candidate Portal
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-500 truncate max-w-[175px] sm:max-w-xs md:max-w-sm mt-0.5">
                    {displaySchool}
                  </p>
                </div>
              </Link>
            </div>

            {/* Candidate Summary & Readiness Badge (Desktop lg+) */}
            <div className="hidden lg:flex items-center gap-3.5 shrink-0">
              <div className="text-right">
                <div className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[180px]">
                  {displayName}
                </div>
                <div className="text-xs text-slate-500 flex items-center justify-end gap-1.5 font-medium">
                  {displayIndex && (
                    <>
                      <span>BECE: <strong className="text-slate-700 font-mono">{displayIndex}</strong></span>
                      <span>•</span>
                    </>
                  )}
                  <span className="truncate max-w-[120px]">{displayProgramme}</span>
                </div>
              </div>

              {/* Progress Stage Pill */}
              <Link
                to="/progress"
                className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50/90 hover:bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all duration-200"
                title="View full admission journey timeline"
              >
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-cqTeal-600 to-cqTeal-700 text-white flex items-center justify-center text-[11px] font-black shadow-xs ring-1 ring-inset ring-white/15">
                  {metrics.compositeScore}%
                </div>
                <div className="text-left pr-1">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Admission
                  </div>
                  <div className="text-xs font-bold text-cqNavy-950 whitespace-nowrap">
                    Stage {metrics.currentStage} of 9
                  </div>
                </div>
              </Link>

              {/* User Dropdown / Switch Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-2 p-1.5 pl-2 pr-2.5 rounded-2xl border transition-all duration-200 text-xs font-semibold text-slate-700 active:scale-[0.98] ${
                    userDropdownOpen
                      ? 'bg-slate-50 border-slate-300 shadow-xs ring-2 ring-cqTeal-500/15'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
                  }`}
                  aria-expanded={userDropdownOpen}
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cqNavy-900 to-cqNavy-950 text-cqTeal-300 flex items-center justify-center font-black text-xs shadow-xs ring-1 ring-inset ring-white/10">
                    {displayName[0]}
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-200 ${
                      userDropdownOpen ? 'rotate-180 text-cqNavy-950' : ''
                    }`}
                  />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_-12px_rgba(15,23,42,0.18)] border border-slate-200/80 ring-1 ring-slate-900/5 p-1.5 z-50 animate-fade-in">
                    <div className="px-3 py-2.5 mb-1 rounded-xl bg-slate-50/80 border border-slate-100 space-y-0.5">
                      <p className="text-xs font-black text-slate-900 truncate">
                        {displayName}
                      </p>
                      <p className="text-[11px] text-cqTeal-700 font-semibold truncate">
                        {displaySchool}
                      </p>
                      {displayIndex && (
                        <p className="text-[10px] text-slate-500 font-mono pt-0.5">
                          BECE: {displayIndex}
                        </p>
                      )}
                    </div>

                    <div className="py-1 space-y-0.5 border-b border-slate-100">
                      <Link
                        to="/"
                        onClick={() => setUserDropdownOpen(false)}
                        className="group w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100/80 hover:text-cqNavy-950 flex items-center gap-2.5 transition-colors"
                      >
                        <ArrowLeft size={14} className="text-slate-400 group-hover:text-cqTeal-600 transition-colors" />
                        <span>Public Home Overview</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          loginAsAdmin();
                          navigate('/admin');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100/80 hover:text-cqNavy-950 flex items-center gap-2.5 transition-colors"
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
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile & Tablet Hamburger Actions (< lg) */}
            <div className="flex lg:hidden items-center gap-2 shrink-0">
              <Link
                to="/progress"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs font-bold text-cqNavy-950"
              >
                <span className="w-2 h-2 rounded-full bg-cqTeal-500" />
                <span>Stage {metrics.currentStage}/9</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200 active:scale-95 ${
                  mobileMenuOpen
                    ? 'bg-slate-100 text-cqNavy-950 border-slate-300 shadow-inner'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200/90 shadow-2xs'
                }`}
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Bottom Row: Segmented Navigation Control Strip (Responsive on all screen sizes) */}
          <div className="pb-2.5 sm:pb-3 pt-0 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            <nav
              aria-label="Student portal navigation"
              className="flex items-center gap-1 p-1 bg-slate-100/85 rounded-2xl border border-slate-200/70 shadow-[inset_0_1px_2px_rgba(15,23,42,0.03)] min-w-max lg:min-w-0"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs rounded-xl transition-all duration-200 whitespace-nowrap shrink-0 ${
                        isActive
                          ? 'bg-white text-cqNavy-950 font-bold shadow-[0_1px_3px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/80'
                          : 'text-slate-600 font-medium hover:text-cqNavy-950 hover:bg-white/60'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                            isActive ? 'text-cqTeal-600' : 'text-slate-400 group-hover:text-cqTeal-600'
                          }`}
                        />
                        <span>{item.name}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

        </div>

        {/* 3. Mobile & Tablet Navigation Drawer (matches lg:hidden toggle!) */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-xl px-4 pt-3.5 pb-6 space-y-4 animate-fade-in shadow-[0_20px_50px_-12px_rgba(15,23,42,0.16)]">
            
            {/* Candidate Card */}
            <div className="p-3.5 bg-gradient-to-r from-cqNavy-950 to-cqNavy-900 text-white rounded-2xl flex items-center justify-between gap-3 border border-cqNavy-800 ring-1 ring-inset ring-white/10 shadow-sm">
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs font-black text-white truncate">{displayName}</p>
                <p className="text-[11px] text-cqTeal-300 font-medium truncate">{displaySchool}</p>
                {displayIndex && (
                  <p className="text-[10px] font-mono text-slate-400">BECE: {displayIndex}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-cqTeal-300">{metrics.compositeScore}% Ready</span>
                <p className="text-[10px] text-slate-300">Stage {metrics.currentStage} of 9</p>
              </div>
            </div>

            {/* Nav links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-200 ${
                        isActive
                          ? 'bg-cqNavy-950 text-white font-bold shadow-xs'
                          : 'text-slate-600 font-semibold hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cqTeal-400' : 'text-cqTeal-600'}`} />
                        <span>{item.name}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>

            {/* Mobile Actions */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  loginAsAdmin();
                  navigate('/admin');
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-cqNavy-950 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors border border-slate-200/90"
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
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100/80 rounded-xl transition-colors"
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
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
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
