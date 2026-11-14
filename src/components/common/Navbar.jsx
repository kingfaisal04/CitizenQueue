/**
 * CitizenQueue - Unified Public & Application Navigation Bar
 * 
 * - Public Visitors: Minimalist, focused institutional navbar maintaining ONLY
 *   the brand logo on the left and Candidate Sign In & Candidate Sign Up on the right.
 * - Authenticated Candidates: Complete admission workflow navigation, readiness meter,
 *   profile dropdown, and mobile navigation drawer.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  LayoutDashboard,
  User,
  ShoppingBag,
  FileText,
  TrendingUp,
  Calendar,
  Shield,
  School,
  LogIn,
  UserPlus,
  ChevronDown,
  ChevronRight,
  LogOut,
  Phone,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdmissionService } from '../../services/admissionService';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [publicMenuOpen, setPublicMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const publicDropdownRef = useRef(null);

  const location = useLocation();
  const { currentUser, isAdmin, isAuthenticated, logout, loginAsAdmin, loginAsCitizen } = useAuth();

  // Retrieve student profile & stage metrics if authenticated
  const profile = isAuthenticated ? AdmissionService.getProfile() : null;
  const metrics = isAuthenticated ? AdmissionService.getReadinessMetrics() : null;

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

  // Authenticated candidate navigation links
  const authenticatedLinks = [
    { name: 'Command Centre', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Admission Profile', href: '/profile', icon: User },
    { name: 'Digital Prospectus', href: '/prospectus', icon: ShoppingBag },
    { name: 'Document Centre', href: '/documents', icon: FileText },
    { name: 'Journey Timeline', href: '/progress', icon: TrendingUp },
    { name: 'Reporting Booking', href: '/book', icon: Calendar }
  ];

  return (
    <header className="sticky top-0 z-50 w-full transition-all">
      
      {/* 1. Official Civic Institutional Top Bar (Hidden on mobile devices) */}
      <div className="hidden sm:block bg-gradient-to-r from-cqNavy-950 via-cqNavy-900 to-cqNavy-950 text-white text-[11px] py-1.5 px-4 border-b border-cqNavy-850">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Official GES and Republic of Ghana Notice */}
          <div className="flex items-center gap-2.5 truncate">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="truncate text-slate-300">
              <strong className="text-white font-semibold">Republic of Ghana</strong> • Ghana Education Service (GES) Pre-Arrival Admission Portal
            </span>
          </div>

          {/* Right: Civic Standards & Quick Desk Support */}
          <div className="hidden sm:flex items-center gap-4 shrink-0 text-slate-300 text-[11px]">
            <span className="flex items-center gap-1.5 text-cqTeal-300">
              <CheckCircle2 size={12} className="text-emerald-400" />
              <span>Zero Intermediary Fees</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Phone size={11} className="text-cqTeal-400" />
              <span>Toll-Free Desk: 030 274 0000</span>
            </span>
          </div>

        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Brand Logo & National Seal Badge */}
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-cqNavy-950 to-cqNavy-900 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-all ring-1 ring-cqNavy-800/20">
                <School className="w-5 h-5 sm:w-6 sm:h-6 text-cqTeal-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-xl sm:text-2xl tracking-tight text-cqNavy-950 font-sans">
                    Citizen<span className="text-cqTeal-600">Queue</span>
                  </span>
                  {/* <span className="text-[10px] font-extrabold uppercase tracking-wider bg-cqTeal-50 text-cqTeal-800 border border-cqTeal-200/80 px-2 py-0.5 rounded-md hidden sm:inline-block">
                    SHS ADMISSIONS
                  </span> */}
                </div>
                <p className="text-[11px] font-medium text-slate-500 -mt-0.5 hidden md:block">
                  Pre-Arrival Verification & Capacity Orchestration
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links (Only for Authenticated Candidates) */}
            {isAuthenticated && (
              <nav className="hidden lg:flex items-center gap-1">
                {authenticatedLinks.map((link) => {
                  const active = isActive(link.href);
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      to={link.href}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? 'text-cqNavy-950 bg-slate-100 font-bold border border-slate-200/80 shadow-2xs'
                          : 'text-slate-600 hover:text-cqNavy-950 hover:bg-slate-50'
                      }`}
                    >
                      <Icon
                        size={14}
                        className={active ? 'text-cqTeal-600' : 'text-slate-400'}
                      />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  
                  {/* Candidate Journey Stage Pill */}
                  {metrics && (
                    <Link
                      to="/progress"
                      className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs hover:border-slate-300 transition-colors"
                      title="View complete admission roadmap"
                    >
                      <div className="w-2 h-2 rounded-full bg-cqTeal-500 animate-pulse" />
                      <span className="text-slate-500 font-medium">Stage:</span>
                      <strong className="text-slate-900 font-bold">
                        {metrics.currentStage} of 9
                      </strong>
                    </Link>
                  )}

                  {/* Candidate Account Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2.5 p-1.5 pl-3 pr-2.5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-xs font-semibold text-slate-800 shadow-2xs"
                      aria-expanded={userMenuOpen}
                    >
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-cqNavy-950 to-cqNavy-900 text-cqTeal-300 flex items-center justify-center font-black text-xs shadow-xs">
                        {(currentUser?.name || profile?.fullName || 'U')[0]}
                      </div>
                      <div className="text-left hidden sm:block max-w-[130px]">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {currentUser?.name || profile?.fullName || 'Candidate'}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {profile?.assignedSchool || 'Senior High School'}
                        </p>
                      </div>
                      <ChevronDown
                        size={14}
                        className={`text-slate-400 transition-transform duration-200 ${
                          userMenuOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in divide-y divide-slate-100">
                        
                        {/* Candidate Identity Brief */}
                        <div className="px-4 py-3 space-y-1">
                          <p className="text-xs font-black text-slate-900 truncate">
                            {currentUser?.name || profile?.fullName || 'Candidate Account'}
                          </p>
                          <p className="text-[11px] text-cqTeal-700 font-medium truncate">
                            {profile?.assignedSchool || 'Achimota Senior High School'}
                          </p>
                          {profile?.beceIndexNumber && (
                            <p className="text-[10px] font-mono text-slate-500">
                              BECE Index: {profile.beceIndexNumber}
                            </p>
                          )}
                        </div>

                        {/* Navigation Direct Links */}
                        <div className="py-1">
                          <Link
                            to="/dashboard"
                            className="w-full px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-cqNavy-950 flex items-center gap-2.5 transition-colors"
                          >
                            <LayoutDashboard size={14} className="text-slate-400" />
                            <span>Admission Command Centre</span>
                          </Link>

                          <Link
                            to="/profile"
                            className="w-full px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-cqNavy-950 flex items-center gap-2.5 transition-colors"
                          >
                            <User size={14} className="text-slate-400" />
                            <span>Candidate Bio-Data & Contacts</span>
                          </Link>

                          <Link
                            to="/prospectus"
                            className="w-full px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-cqNavy-950 flex items-center gap-2.5 transition-colors"
                          >
                            <ShoppingBag size={14} className="text-slate-400" />
                            <span>Digital Prospectus Checklist</span>
                          </Link>

                          <Link
                            to="/documents"
                            className="w-full px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-cqNavy-950 flex items-center gap-2.5 transition-colors"
                          >
                            <FileText size={14} className="text-slate-400" />
                            <span>Document Verification Centre</span>
                          </Link>

                          <Link
                            to="/progress"
                            className="w-full px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-cqNavy-950 flex items-center gap-2.5 transition-colors"
                          >
                            <TrendingUp size={14} className="text-slate-400" />
                            <span>9-Stage Admission Progress</span>
                          </Link>
                        </div>

                        {/* Role Switcher */}
                        <div className="py-1">
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
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
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
                            className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
                          >
                            <LogOut size={14} />
                            <span>Sign Out of Account</span>
                          </button>
                        </div>

                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Public Actions: Desktop Direct Buttons + Mobile Three Horizontal Button with Responsive Dropdown */
                <div className="flex items-center gap-2">
                  
                  {/* Desktop Only Actions (sm: and larger) */}
                  <div className="hidden sm:flex items-center gap-2 sm:gap-2.5">
                    {/* Candidate Sign In */}
                    <Link
                      to="/login"
                      className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
                        isActive('/login') || isActive('/signin')
                          ? 'bg-slate-100 text-cqNavy-950 font-bold border border-slate-200 shadow-2xs'
                          : 'text-slate-700 hover:text-cqNavy-950 hover:bg-slate-50 border border-slate-200'
                      }`}
                    >
                      <LogIn size={13} className="text-slate-500" />
                      <span>Candidate Sign In</span>
                    </Link>

                    {/* Candidate Sign Up */}
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-xs bg-cqNavy-950 hover:bg-cqNavy-900 text-white hover:shadow-md"
                    >
                      <UserPlus size={13} className="text-cqTeal-400" />
                      <span>Candidate Sign Up</span>
                    </Link>
                  </div>

                  {/* Mobile Three Horizontal Button & Dropdown Menu (Mobile devices) */}
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

                    {/* Mobile Dropdown Displaying Sign Up and Sign In */}
                    {publicMenuOpen && (
                      <div className="absolute right-0 top-full mt-2.5 w-[calc(100vw-2rem)] max-w-[310px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-3 z-50 animate-fade-in divide-y divide-slate-100">
                        
                        {/* Dropdown Header Context */}
                        <div className="pb-3 px-1">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-cqTeal-700 bg-cqTeal-50 border border-cqTeal-200/60 px-2 py-0.5 rounded-md">
                              SHS Admissions
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400">
                              GES Portal
                            </span>
                          </div>
                          <p className="text-xs font-extrabold text-cqNavy-950">
                            Candidate Portal Access
                          </p>
                          <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                            Verify school placement, digital prospectus, and reporting schedule.
                          </p>
                        </div>

                        {/* Sign Up & Sign In Navigation Options */}
                        <div className="py-2.5 space-y-2">
                          
                          {/* 1. Candidate Sign Up */}
                          <Link
                            to="/register"
                            onClick={() => setPublicMenuOpen(false)}
                            className="group flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-cqNavy-950 via-cqNavy-900 to-cqNavy-950 text-white shadow-sm hover:shadow-md hover:from-cqNavy-900 hover:to-cqNavy-850 active:scale-[0.98] transition-all border border-cqNavy-850"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-white/10 text-cqTeal-300 flex items-center justify-center shrink-0 border border-white/10 group-hover:scale-105 transition-transform">
                                <UserPlus size={16} className="text-cqTeal-400" />
                              </div>
                              <div className="text-left truncate">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-white tracking-tight truncate">
                                    Candidate Sign Up
                                  </span>
                                  <span className="text-[9px] font-extrabold uppercase tracking-wider bg-cqTeal-500/20 text-cqTeal-300 border border-cqTeal-400/30 px-1 py-0.2 rounded shrink-0">
                                    Register
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-300 leading-tight truncate">
                                  Create student account with BECE index
                                </p>
                              </div>
                            </div>
                            <ChevronRight size={15} className="text-cqTeal-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1.5" />
                          </Link>

                          {/* 2. Candidate Sign In */}
                          <Link
                            to="/login"
                            onClick={() => setPublicMenuOpen(false)}
                            className={`group flex items-center justify-between p-2.5 rounded-xl transition-all border active:scale-[0.98] ${
                              isActive('/login') || isActive('/signin')
                                ? 'bg-slate-100 text-cqNavy-950 border-slate-300 font-bold shadow-2xs'
                                : 'bg-slate-50 hover:bg-slate-100/90 text-slate-800 border-slate-200/80 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center shrink-0 border border-slate-200 group-hover:scale-105 transition-transform shadow-2xs">
                                <LogIn size={16} className="text-cqNavy-900" />
                              </div>
                              <div className="text-left truncate">
                                <span className="text-xs font-bold text-slate-900 tracking-tight block truncate">
                                  Candidate Sign In
                                </span>
                                <p className="text-[10px] text-slate-500 leading-tight truncate">
                                  Log in to existing admission profile
                                </p>
                              </div>
                            </div>
                            <ChevronRight size={15} className="text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1.5" />
                          </Link>

                        </div>

                        {/* Reassurance & Civic Compliance Footer */}
                        <div className="pt-2 px-1 space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span className="flex items-center gap-1 text-emerald-600 font-semibold truncate">
                              <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                              Zero Intermediary Fees
                            </span>
                            <span className="text-slate-400 text-[9px] font-medium shrink-0">Republic of Ghana</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span className="flex items-center gap-1 text-slate-600 truncate">
                              <Phone size={10} className="text-cqTeal-600 shrink-0" />
                              Toll-Free: 030 274 0000
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono shrink-0">
                              GES Pre-Arrival
                            </span>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* Mobile Hamburger Toggle Button (Only for Authenticated Candidates) */}
              {isAuthenticated && (
                <div className="flex lg:hidden items-center ml-1">
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 rounded-2xl text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200/80"
                    aria-label="Toggle navigation menu"
                  >
                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* 3. Mobile Dropdown Navigation Drawer (Only for Authenticated Candidates) */}
        {isAuthenticated && mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white/98 backdrop-blur-md px-4 pt-3 pb-6 space-y-4 animate-fade-in shadow-xl">
            
            {/* Mobile Candidate Card */}
            <div className="p-3.5 bg-gradient-to-r from-cqNavy-950 to-cqNavy-900 text-white rounded-2xl flex items-center justify-between border border-cqNavy-800 shadow-sm">
              <div className="space-y-0.5">
                <p className="text-xs font-black text-white">
                  {currentUser?.name || profile?.fullName || 'Candidate'}
                </p>
                <p className="text-[11px] text-cqTeal-300 font-medium truncate max-w-[200px]">
                  {profile?.assignedSchool || 'Senior High School'}
                </p>
              </div>
              {metrics && (
                <div className="text-right">
                  <span className="text-xs font-bold text-cqTeal-300">
                    Stage {metrics.currentStage} of 9
                  </span>
                  <p className="text-[10px] text-slate-300">
                    {metrics.compositeScore}% Ready
                  </p>
                </div>
              )}
            </div>

            {/* Navigation Links List */}
            <div className="grid grid-cols-1 gap-1">
              {authenticatedLinks.map((link) => {
                const active = isActive(link.href);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      active
                        ? 'text-cqNavy-950 bg-slate-100 font-bold border border-slate-200'
                        : 'text-slate-600 hover:text-cqNavy-950 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={16} className={active ? 'text-cqTeal-600' : 'text-slate-400'} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Actions Area */}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
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
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-cqNavy-950 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
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
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
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
