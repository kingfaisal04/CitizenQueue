/**
 * CitizenQueue - Unified Public & Home Overview Navigation Bar
 *
 * - Public Visitors: Clean institutional navbar with brand logo on the left and
 *   Sign In & Sign Up controls on the right (responsive dropdown on mobile).
 * - Authenticated Users on Public Overview: Streamlined 3-zone executive navbar
 *   with Brand (left), focused Command Centre & Admission Profile pill rail (center),
 *   and Stage indicator + Account dropdown (right), balanced across all viewports.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  LayoutDashboard,
  User,
  Shield,
  School,
  LogIn,
  UserPlus,
  ChevronDown,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdmissionService } from '../../services/admissionService';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [publicMenuOpen, setPublicMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [profile, setProfile] = useState(null);
  const [metrics, setMetrics] = useState(null);

  const dropdownRef = useRef(null);
  const publicDropdownRef = useRef(null);

  const location = useLocation();
  const {
    currentUser,
    studentProfile,
    admissionData,
    isAdmin,
    isAuthenticated,
    logout,
    loginAsAdmin,
    loginAsCitizen
  } = useAuth();

  // Subtle scroll-aware glass elevation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load student profile & stage metrics if authenticated
  useEffect(() => {
    let isMounted = true;
    if (!isAuthenticated) {
      setProfile(null);
      setMetrics(null);
      return;
    }

    if (studentProfile) {
      setProfile(studentProfile);
    }
    if (admissionData) {
      setMetrics({
        currentStage: admissionData.currentStage || 1,
        compositeScore: admissionData.readinessScore || 0
      });
    }

    const loadHeaderMetrics = async () => {
      try {
        const [p, m] = await Promise.all([
          AdmissionService.getProfile(),
          AdmissionService.getReadinessMetrics()
        ]);
        if (isMounted) {
          if (p) setProfile(p);
          if (m) setMetrics(m);
        }
      } catch {
        // Keep context values if request fails
      }
    };
    loadHeaderMetrics();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, studentProfile, admissionData]);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (publicDropdownRef.current && !publicDropdownRef.current.contains(event.target)) {
        setPublicMenuOpen(false);
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
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
        setPublicMenuOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile and public menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setPublicMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Streamlined public overview navigation links for authenticated users
  const authenticatedLinks = [
    { name: 'Command Centre', href: isAdmin ? '/admin' : '/dashboard', icon: LayoutDashboard },
    { name: 'Admission Profile', href: '/profile', icon: User }
  ];

  const displayName = currentUser?.name || profile?.fullName || 'Candidate';
  const displaySchool =
    currentUser?.institutionName || profile?.assignedSchool || 'Senior High School';

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      <div
        className={`backdrop-blur-xl border-b transition-all duration-300 ${
          isScrolled
            ? 'bg-white/92 border-slate-200/90 shadow-[0_8px_30px_rgb(15,23,42,0.06)]'
            : 'bg-white/85 border-slate-200/70 shadow-2xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`h-16 sm:h-[74px] flex items-center justify-between gap-3 ${
              isAuthenticated ? 'md:grid md:grid-cols-[1fr_auto_1fr]' : ''
            }`}
          >
            {/* 1. Left: Brand Logo & Subtitle */}
            <div className="flex items-center min-w-0 justify-self-start">
              <Link
                to="/"
                className="flex items-center gap-2.5 sm:gap-3 group shrink-0 min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-cqTeal-500/40 rounded-2xl"
              >
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-cqNavy-900 via-cqNavy-950 to-cqNavy-950 text-white flex items-center justify-center shadow-[0_6px_16px_-4px_rgba(15,23,42,0.35)] ring-1 ring-inset ring-white/10 group-hover:-translate-y-0.5 group-hover:shadow-[0_10px_22px_-6px_rgba(15,23,42,0.45)] transition-all duration-200 shrink-0">
                  <School className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-cqTeal-400 group-hover:scale-105 transition-transform duration-200" />
                </div>
                <div className="leading-tight min-w-0">
                  <span className="block font-black text-lg sm:text-[22px] tracking-[-0.025em] text-cqNavy-950 font-sans truncate">
                    Citizen<span className="text-cqTeal-600">Queue</span>
                  </span>
                  <p
                    className={`text-[11px] font-medium text-slate-500 tracking-[0.01em] mt-0.5 truncate ${
                      isAuthenticated ? 'hidden lg:block' : 'hidden md:block'
                    }`}
                  >
                    Pre-Arrival Verification & Capacity Orchestration
                  </p>
                </div>
              </Link>
            </div>

            {/* 2. Center: Focused 2-Tab Segmented Nav Rail (Authenticated Users, md+) */}
            {isAuthenticated && (
              <nav
                aria-label="Primary candidate navigation"
                className="hidden md:flex items-center justify-self-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/75 shadow-[inset_0_1px_2px_rgba(15,23,42,0.03)] shrink-0"
              >
                {authenticatedLinks.map((link) => {
                  const active = isActive(link.href);
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      to={link.href}
                      className={`group flex items-center gap-2 px-3.5 lg:px-4 py-1.5 rounded-xl text-xs transition-all duration-200 whitespace-nowrap ${
                        active
                          ? 'text-cqNavy-950 bg-white font-bold shadow-[0_1px_3px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/80'
                          : 'text-slate-600 font-semibold hover:text-cqNavy-950 hover:bg-white/70'
                      }`}
                    >
                      <Icon
                        size={14}
                        className={`shrink-0 transition-colors duration-200 ${
                          active
                            ? 'text-cqTeal-600'
                            : 'text-slate-400 group-hover:text-cqTeal-600'
                        }`}
                      />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* 3. Right: Actions / Account Controls */}
            <div className="flex items-center justify-end gap-2 sm:gap-2.5 shrink-0 justify-self-end">
              {isAuthenticated ? (
                <div className="flex items-center gap-2 sm:gap-2.5">
                  {/* Candidate Journey Stage Pill (xl+) */}
                  {metrics && !isAdmin && (
                    <Link
                      to="/progress"
                      className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-50/90 rounded-full border border-slate-200/80 text-xs hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all duration-200 whitespace-nowrap"
                      title="View complete admission roadmap"
                    >
                      <span className="w-2 h-2 rounded-full bg-cqTeal-500 ring-4 ring-cqTeal-500/15 animate-pulse" />
                      <span className="text-slate-500 font-medium">Stage:</span>
                      <strong className="text-cqNavy-950 font-bold">
                        {metrics.currentStage} of 9
                      </strong>
                    </Link>
                  )}

                  {/* Account Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className={`flex items-center gap-2 sm:gap-2.5 p-1.5 pl-1.5 sm:pl-2 pr-2 sm:pr-2.5 rounded-2xl border transition-all duration-200 text-xs font-semibold text-slate-800 active:scale-[0.98] ${
                        userMenuOpen
                          ? 'bg-slate-50 border-slate-300 shadow-xs ring-2 ring-cqTeal-500/15'
                          : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
                      }`}
                      aria-expanded={userMenuOpen}
                    >
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cqNavy-900 to-cqNavy-950 text-cqTeal-300 flex items-center justify-center font-black text-xs shadow-xs ring-1 ring-inset ring-white/10 shrink-0">
                        {displayName[0]}
                      </div>
                      <div className="text-left hidden sm:block max-w-[115px] lg:max-w-[140px]">
                        <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                          {displayName}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {displaySchool}
                        </p>
                      </div>
                      <ChevronDown
                        size={14}
                        className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                          userMenuOpen ? 'rotate-180 text-cqNavy-950' : ''
                        }`}
                      />
                    </button>

                    {/* Streamlined Account Dropdown Menu */}
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2.5 w-64 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_-12px_rgba(15,23,42,0.18)] border border-slate-200/80 ring-1 ring-slate-900/5 p-1.5 z-50 animate-fade-in">
                        {/* Identity Brief */}
                        <div className="px-3 py-2.5 mb-1 rounded-xl bg-slate-50/80 border border-slate-100 space-y-0.5">
                          <p className="text-xs font-black text-slate-900 truncate">
                            {displayName}
                          </p>
                          <p className="text-[11px] text-cqTeal-700 font-semibold truncate">
                            {displaySchool}
                          </p>
                          {profile?.beceIndexNumber && (
                            <p className="text-[10px] font-mono text-slate-500 pt-0.5">
                              BECE Index: {profile.beceIndexNumber}
                            </p>
                          )}
                        </div>

                        {/* Direct Workspace Links */}
                        <div className="py-1 space-y-0.5 border-b border-slate-100">
                          <Link
                            to={isAdmin ? '/admin' : '/dashboard'}
                            className="group w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100/80 hover:text-cqNavy-950 flex items-center gap-2.5 transition-colors"
                          >
                            <LayoutDashboard size={14} className="text-slate-400 group-hover:text-cqTeal-600 transition-colors" />
                            <span>Command Centre</span>
                          </Link>

                          <Link
                            to="/profile"
                            className="group w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100/80 hover:text-cqNavy-950 flex items-center gap-2.5 transition-colors"
                          >
                            <User size={14} className="text-slate-400 group-hover:text-cqTeal-600 transition-colors" />
                            <span>Admission Profile</span>
                          </Link>
                        </div>

                        {/* Role Switcher */}
                        <div className="py-1 border-b border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setUserMenuOpen(false);
                              if (isAdmin) {
                                loginAsCitizen();
                              } else {
                                loginAsAdmin();
                              }
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100/80 hover:text-cqNavy-950 flex items-center gap-2.5 transition-colors"
                          >
                            <Shield size={14} className="text-cqTeal-600" />
                            <span>{isAdmin ? 'Switch to Student View' : 'Switch to School Staff Desk'}</span>
                          </button>
                        </div>

                        {/* Sign Out */}
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setUserMenuOpen(false);
                              logout();
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

                  {/* Mobile Hamburger Toggle (Only below md where 2-tab rail hides) */}
                  <div className="flex md:hidden items-center">
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                      className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200 active:scale-95 ${
                        mobileMenuOpen
                          ? 'bg-slate-100 text-cqNavy-950 border-slate-300 shadow-inner'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200/90 shadow-2xs'
                      }`}
                      aria-expanded={mobileMenuOpen}
                      aria-label="Toggle navigation menu"
                    >
                      {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                  </div>
                </div>
              ) : (
                /* Public Visitor Actions */
                <div className="flex items-center gap-2">
                  {/* Desktop / Tablet Actions (sm+) */}
                  <div className="hidden sm:flex items-center gap-2.5">
                    <Link
                      to="/login"
                      className={`group inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] whitespace-nowrap ${
                        isActive('/login') || isActive('/signin')
                          ? 'bg-slate-100 text-cqNavy-950 font-bold border border-slate-300 shadow-2xs'
                          : 'bg-white text-slate-700 hover:text-cqNavy-950 hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs'
                      }`}
                    >
                      <LogIn size={13} className="text-slate-500 group-hover:text-cqNavy-950 transition-colors" />
                      <span>Sign In</span>
                    </Link>

                    <Link
                      to="/register"
                      className={`group inline-flex items-center gap-1.5 px-4 sm:px-4.5 py-2 text-xs font-bold rounded-xl transition-all duration-200 bg-gradient-to-b from-cqNavy-900 to-cqNavy-950 hover:from-cqNavy-900 hover:to-cqNavy-900 text-white shadow-[0_4px_12px_-2px_rgba(15,23,42,0.35)] hover:shadow-[0_8px_20px_-4px_rgba(15,23,42,0.45)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] whitespace-nowrap ${
                        isActive('/register') || isActive('/signup')
                          ? 'ring-2 ring-cqTeal-500/60 ring-offset-1'
                          : 'ring-1 ring-inset ring-white/10'
                      }`}
                    >
                      <UserPlus size={13} className="text-cqTeal-400 group-hover:scale-110 transition-transform duration-200" />
                      <span>Sign Up</span>
                    </Link>
                  </div>

                  {/* Mobile Menu Button & Dropdown (< sm) */}
                  <div className="relative sm:hidden" ref={publicDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setPublicMenuOpen(!publicMenuOpen)}
                      className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cqTeal-500/30 ${
                        publicMenuOpen
                          ? 'bg-slate-100 text-cqNavy-950 border-slate-300 shadow-inner ring-1 ring-slate-300'
                          : 'bg-white text-slate-700 hover:text-cqNavy-950 hover:bg-slate-50 border-slate-200/90 shadow-2xs active:scale-95'
                      }`}
                      aria-expanded={publicMenuOpen}
                      aria-label="Toggle admission portal options menu"
                    >
                      {publicMenuOpen ? (
                        <X size={20} className="text-cqNavy-950 transition-transform duration-200" />
                      ) : (
                        <Menu size={20} className="text-cqNavy-950 transition-transform duration-200" />
                      )}
                    </button>

                    {publicMenuOpen && (
                      <div className="absolute right-0 top-full mt-2.5 w-72 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_-12px_rgba(15,23,42,0.2)] border border-slate-200/80 ring-1 ring-slate-900/5 p-2.5 z-50 animate-fade-in">
                        <div className="space-y-2">
                          <Link
                            to="/register"
                            onClick={() => setPublicMenuOpen(false)}
                            className="group flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-cqNavy-950 via-cqNavy-900 to-cqNavy-950 text-white shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 ring-1 ring-inset ring-white/10"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-white/10 text-cqTeal-300 flex items-center justify-center shrink-0 border border-white/10 group-hover:scale-105 transition-transform">
                                <UserPlus size={16} className="text-cqTeal-400" />
                              </div>
                              <span className="text-xs font-bold text-white tracking-tight truncate">
                                Sign Up
                              </span>
                            </div>
                            <ChevronRight size={15} className="text-cqTeal-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1.5" />
                          </Link>

                          <Link
                            to="/login"
                            onClick={() => setPublicMenuOpen(false)}
                            className={`group flex items-center justify-between p-2.5 rounded-xl transition-all duration-200 border active:scale-[0.98] ${
                              isActive('/login') || isActive('/signin')
                                ? 'bg-slate-100 text-cqNavy-950 border-slate-300 font-bold shadow-2xs'
                                : 'bg-slate-50/90 hover:bg-slate-100 text-slate-800 border-slate-200/80 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center shrink-0 border border-slate-200 group-hover:scale-105 transition-transform shadow-2xs">
                                <LogIn size={16} className="text-cqNavy-900" />
                              </div>
                              <span className="text-xs font-bold text-slate-900 tracking-tight truncate">
                                Sign In
                              </span>
                            </div>
                            <ChevronRight size={15} className="text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1.5" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer (< md, Authenticated Users Only) */}
        {isAuthenticated && mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-xl px-4 pt-3.5 pb-5 space-y-3.5 animate-fade-in shadow-[0_20px_50px_-12px_rgba(15,23,42,0.16)]">
            {/* Compact Identity Card */}
            <div className="p-3.5 bg-gradient-to-r from-cqNavy-950 to-cqNavy-900 text-white rounded-2xl flex items-center justify-between gap-3 border border-cqNavy-800 ring-1 ring-inset ring-white/10 shadow-sm">
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs font-black text-white truncate">{displayName}</p>
                <p className="text-[11px] text-cqTeal-300 font-medium truncate">{displaySchool}</p>
              </div>
              {metrics && !isAdmin && (
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-cqTeal-300">
                    Stage {metrics.currentStage} of 9
                  </span>
                  <p className="text-[10px] text-slate-300">
                    {metrics.compositeScore}% Ready
                  </p>
                </div>
              )}
            </div>

            {/* Streamlined 2 Navigation Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {authenticatedLinks.map((link) => {
                const active = isActive(link.href);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-200 ${
                      active
                        ? 'text-cqNavy-950 bg-slate-100/90 font-bold border border-slate-200/90 shadow-2xs'
                        : 'text-slate-600 font-semibold hover:text-cqNavy-950 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <Icon size={16} className={active ? 'text-cqTeal-600' : 'text-slate-400'} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (isAdmin) {
                    loginAsCitizen();
                  } else {
                    loginAsAdmin();
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-cqNavy-950 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors border border-slate-200/90"
              >
                <Shield size={14} className="text-cqTeal-600" />
                <span>{isAdmin ? 'Switch to Student View' : 'Switch to Staff Desk'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100/80 rounded-xl transition-colors"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
