/**
 * CitizenQueue - Institutional Administrative Layout
 * 
 * Staff-facing interface with dedicated navigation, institution badge,
 * responsive segmented pill rail, and quick actions for school administrators
 * and departmental officers across all viewports.
 */

import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  ShoppingBag,
  CalendarCheck,
  Clock,
  ArrowLeft,
  Menu,
  X,
  Shield,
  KeyRound,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Convert full institutional staff roles into concise badges that fit cleanly on the navbar
 */
const getShortRole = (role) => {
  if (!role) return 'Staff';
  const lower = role.toLowerCase();

  if (lower.includes('admissions') || lower.includes('placement')) return 'Admissions';
  if (lower.includes('senior housemaster') || lower.includes('senior housemistress')) return 'Sr. Housemaster';
  if (lower.includes('housemaster') || lower.includes('housemistress')) return 'Housemaster';
  if (lower.includes('registrar')) return 'Registrar';
  if (lower.includes('assistant head') || lower.includes('asst. head')) return 'Asst. Head';
  if (lower.includes('verification') || lower.includes('document')) return 'Verifier';
  if (lower.includes('principal') || lower.includes('headmaster') || lower.includes('headmistress')) return 'Headmaster';
  if (lower.includes('bursar') || lower.includes('finance')) return 'Bursar';
  if (lower.includes('nurse') || lower.includes('health') || lower.includes('medical')) return 'Health Officer';
  if (lower.includes('academic')) return 'Academic Officer';
  if (lower.includes('library')) return 'Library Officer';
  if (lower.includes('collection')) return 'Collection Desk';
  if (lower.includes('admin')) return 'School Admin';

  const firstPart = role.split(/[/&]/)[0].trim();
  if (firstPart.length > 14) {
    return firstPart.slice(0, 13) + '…';
  }
  return firstPart || 'Staff';
};

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isSchoolManager, loginAsCitizen, logout } = useAuth();
  const [mobileAdminNavOpen, setMobileAdminNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Subtle scroll-aware depth
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile/tablet drawer on route change
  useEffect(() => {
    setMobileAdminNavOpen(false);
  }, [location.pathname]);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileAdminNavOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Document Verification', path: '/admin/documents', icon: FileText },
    { name: 'Prospectus', path: '/admin/prospectus', icon: ShoppingBag },
    { name: 'Appointments', path: '/admin/appointments', icon: CalendarCheck },
    { name: 'Capacity', path: '/admin/availability', icon: Clock },
    ...(isSchoolManager ? [{ name: 'Staff & Key', path: '/admin/staff', icon: KeyRound }] : [])
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    setMobileAdminNavOpen(false);
    await logout();
    navigate('/login');
  };

  const schoolLabel =
    currentUser?.institutionName || currentUser?.schoolName || 'Achimota Senior High School';

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans antialiased">
      
      {/* 1. Official Civic Top Bar (Hidden on mobile devices) */}
      <div className="hidden sm:block bg-gradient-to-r from-cqNavy-950 via-cqNavy-900 to-cqNavy-950 text-white text-[11px] py-1.5 px-4 border-b border-cqNavy-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cqTeal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cqTeal-500" />
            </span>
            <span className="truncate text-slate-300">
              <strong className="text-white font-semibold">Republic of Ghana</strong> • Senior High School Administrative Desk & Verification Terminal
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 md:gap-4 shrink-0 text-slate-300 text-[11px]">
            <span className="hidden md:inline text-slate-400 whitespace-nowrap">Desk Station: Verification Desk 3</span>
            <span className="hidden md:inline text-slate-600">|</span>
            <Link
              to="/dashboard"
              onClick={loginAsCitizen}
              className="text-xs font-semibold text-cqTeal-300 hover:text-white flex items-center gap-1 transition-colors whitespace-nowrap"
            >
              <ArrowLeft size={12} />
              <span>Switch to Student View</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Admin Top Header */}
      <header
        className={`bg-cqNavy-950/95 backdrop-blur-xl text-white border-b sticky top-0 z-30 transition-all duration-300 ${
          isScrolled
            ? 'border-cqNavy-800 shadow-[0_10px_30px_-10px_rgba(2,6,23,0.45)]'
            : 'border-cqNavy-800/80 shadow-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 h-16 sm:h-[72px]">
            
            {/* Left: Admin Brand & Institution Indicator */}
            <div className="flex items-center gap-2.5 min-w-0 shrink-0">
              <Link
                to="/admin"
                className="flex items-center gap-2.5 sm:gap-3 group min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-cqTeal-400/50 rounded-2xl"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-cqNavy-900 to-cqNavy-800 text-cqTeal-400 border border-cqNavy-700/80 ring-1 ring-inset ring-white/10 flex items-center justify-center shadow-md group-hover:-translate-y-0.5 transition-all duration-200 shrink-0">
                  <Shield size={18} className="group-hover:scale-105 transition-transform" />
                </div>
                <div className="min-w-0 leading-tight">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg sm:text-xl tracking-[-0.025em] text-white">
                      Citizen<span className="text-cqTeal-400">Queue</span>
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5 hidden sm:block truncate max-w-[180px] md:max-w-[240px] xl:max-w-[185px] 2xl:max-w-[235px]">
                    {schoolLabel} Registry Desk
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links (xl+ to prevent any overflow on 1024px–1279px laptops) */}
            <nav
              aria-label="Administrator navigation"
              className="hidden xl:flex items-center gap-0.5 bg-cqNavy-900/75 p-1 rounded-2xl border border-cqNavy-800/90 shrink-0"
            >
              {navItems.map((item) => {
                const active = isActive(item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`group flex items-center gap-1.5 px-2.5 2xl:px-3 py-1.5 rounded-xl text-xs transition-all duration-200 whitespace-nowrap ${
                      active
                        ? 'bg-cqNavy-800 text-white font-bold border border-cqNavy-700/90 shadow-xs ring-1 ring-inset ring-white/5'
                        : 'text-slate-300 font-medium hover:text-white hover:bg-cqNavy-900/90 border border-transparent'
                    }`}
                  >
                    <Icon
                      size={14}
                      className={`shrink-0 transition-colors ${
                        active ? 'text-cqTeal-400' : 'text-slate-400 group-hover:text-cqTeal-300'
                      }`}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right: Staff Identity, Student View & Sign Out */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              <div className="hidden sm:flex items-center gap-2.5">
                <div className="text-right hidden md:block">
                  <span className="inline-block text-[9px] uppercase font-extrabold tracking-wider text-cqTeal-300 bg-cqNavy-900/90 px-1.5 py-0.5 rounded border border-cqNavy-700/80">
                    {getShortRole(currentUser?.designation || currentUser?.role)}
                  </span>
                  <p className="text-xs font-bold text-white truncate max-w-[125px] 2xl:max-w-[160px] mt-0.5">
                    {currentUser?.name || 'Staff Member'}
                  </p>
                </div>

                <Link
                  to="/dashboard"
                  onClick={loginAsCitizen}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-cqNavy-900/80 hover:bg-cqNavy-800 border border-cqNavy-700/90 transition-all duration-200 whitespace-nowrap active:scale-[0.98]"
                  title="Switch to student portal view"
                >
                  <ArrowLeft size={13} className="text-cqTeal-400" />
                  <span className="hidden sm:inline">Student View</span>
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center justify-center p-2 rounded-xl text-slate-300 hover:text-rose-300 hover:bg-cqNavy-800 border border-cqNavy-800 hover:border-rose-500/30 transition-all duration-200 active:scale-95"
                  title="Sign Out"
                  aria-label="Sign out of staff desk"
                >
                  <LogOut size={15} />
                </button>
              </div>

              {/* Mobile & Tablet Admin Nav Toggle (< xl) */}
              <button
                type="button"
                onClick={() => setMobileAdminNavOpen(!mobileAdminNavOpen)}
                className={`xl:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200 active:scale-95 ${
                  mobileAdminNavOpen
                    ? 'bg-cqNavy-800 text-white border-cqNavy-700 shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-cqNavy-800/80 border-cqNavy-800'
                }`}
                aria-expanded={mobileAdminNavOpen}
                aria-label="Toggle admin navigation"
              >
                {mobileAdminNavOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile & Tablet Navigation Dropdown (< xl) */}
        {mobileAdminNavOpen && (
          <div className="xl:hidden bg-cqNavy-900/98 backdrop-blur-xl border-t border-cqNavy-800 px-4 py-4 space-y-3 animate-fade-in shadow-[0_20px_50px_-12px_rgba(2,6,23,0.5)]">
            <div className="pb-3 border-b border-cqNavy-800 text-xs text-slate-300 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="inline-block text-[9px] uppercase font-extrabold tracking-wider text-cqTeal-300 bg-cqNavy-800 px-2 py-0.5 rounded border border-cqNavy-700">
                  {getShortRole(currentUser?.designation || currentUser?.role)}
                </span>
                <p className="font-bold text-white text-xs mt-1 truncate">
                  {currentUser?.name || 'Staff Member'}
                </p>
                <p className="text-[11px] text-slate-400 truncate sm:hidden mt-0.5">
                  {schoolLabel}
                </p>
              </div>
              <span className="text-slate-300 text-[11px] font-mono bg-cqNavy-800 px-2.5 py-1 rounded-lg border border-cqNavy-700 shrink-0">
                {currentUser?.staffId || 'Staff Terminal'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
              {navItems.map((item) => {
                const active = isActive(item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileAdminNavOpen(false)}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      active
                        ? 'bg-cqNavy-800 text-white font-bold border border-cqNavy-700 shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-cqNavy-800/70 border border-transparent'
                    }`}
                  >
                    <Icon size={15} className={`shrink-0 ${active ? 'text-cqTeal-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-cqNavy-800 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Link
                to="/dashboard"
                onClick={() => {
                  setMobileAdminNavOpen(false);
                  loginAsCitizen();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-cqNavy-800 rounded-xl hover:bg-cqNavy-700 border border-cqNavy-700 transition-colors"
              >
                <ArrowLeft size={13} className="text-cqTeal-400" />
                <span>Return to Student Portal View</span>
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-rose-300 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-800/50 rounded-xl transition-colors"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Admin Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* Admin Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 CitizenQueue - Institutional Admission Orchestration Desk</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Official Ghana Education Service (GES) Compliant</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Desk Connected
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
