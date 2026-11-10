/**
 * CitizenQueue - Institutional Administrative Layout
 * 
 * Staff-facing interface with dedicated navigation, institution badge,
 * and quick actions for admissions officers and boarding house masters.
 */

import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  ShoppingBag,
  CalendarCheck,
  Clock,
  ArrowLeft,
  School,
  Menu,
  X,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const location = useLocation();
  const { currentUser, loginAsCitizen } = useAuth();
  const [mobileAdminNavOpen, setMobileAdminNavOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Document Verification', path: '/admin/documents', icon: FileText },
    { name: 'Prospectus', path: '/admin/prospectus', icon: ShoppingBag },
    { name: 'Appointments', path: '/admin/appointments', icon: CalendarCheck },
    { name: 'Capacity', path: '/admin/availability', icon: Clock }
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans antialiased">
      
      {/* 1. Official Civic Top Bar */}
      <div className="bg-gradient-to-r from-cqNavy-950 via-cqNavy-900 to-cqNavy-950 text-white text-[11px] py-1.5 px-4 border-b border-cqNavy-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 truncate">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cqTeal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cqTeal-500" />
            </span>
            <span className="truncate text-slate-300">
              <strong className="text-white font-semibold">Republic of Ghana</strong> • Senior High School Administrative Desk & Verification Terminal
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 shrink-0 text-slate-300 text-[11px]">
            <span className="text-slate-400">Desk Station: Verification Desk 3</span>
            <span className="text-slate-600">|</span>
            <Link
              to="/dashboard"
              onClick={loginAsCitizen}
              className="text-xs font-semibold text-cqTeal-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft size={12} />
              <span>Switch to Student View</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Admin Top Header */}
      <header className="bg-cqNavy-950 text-white border-b border-cqNavy-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            
            {/* Left: Admin Brand & Institution Indicator */}
            <div className="flex items-center gap-3 ml-4">
              <Link to="/admin" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cqNavy-900 to-cqNavy-800 text-cqTeal-400 border border-cqNavy-700 flex items-center justify-center shadow-md">
                  <Shield size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xl tracking-tight text-white">
                      Citizen<span className="text-cqTeal-400">Queue</span>
                    </span>

                  </div>
                  <p className="text-[11px] font-medium text-slate-400 -mt-0.5 hidden sm:block">
                    {currentUser?.institutionName || currentUser?.schoolName || 'Achimota Senior High School'} Registry Desk
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1">
              {navItems.map((item) => {
                const active = isActive(item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? 'bg-cqNavy-800 text-white font-bold border border-cqNavy-700 shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-cqNavy-900'
                    }`}
                  >
                    <Icon size={14} className={active ? 'text-cqTeal-400' : 'text-slate-400'} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Staff Identity & Switch back to Student / Citizen View */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-white truncate max-w-[170px]">
                  {currentUser?.name || 'Admissions Officer Addo'}
                </p>
                <p className="text-[10px] text-cqTeal-300 truncate max-w-[170px]">
                  {currentUser?.designation || 'Admissions Desk'}
                </p>
              </div>
              <Link
                to="/dashboard"
                onClick={loginAsCitizen}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-cqNavy-800 border border-cqNavy-700 transition-colors"
                title="Switch to student portal view"
              >
                <ArrowLeft size={13} />
                <span>Student View</span>
              </Link>
            </div>

            {/* Mobile Admin Nav Toggle */}
            <button
              type="button"
              onClick={() => setMobileAdminNavOpen(!mobileAdminNavOpen)}
              className="xl:hidden p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-cqNavy-800 border border-cqNavy-800"
              aria-label="Toggle admin navigation"
            >
              {mobileAdminNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileAdminNavOpen && (
          <div className="xl:hidden bg-cqNavy-900 border-t border-cqNavy-800 px-4 py-3 space-y-2 animate-fade-in shadow-xl">
            <div className="pb-2 mb-1 border-b border-cqNavy-800 text-xs text-slate-300 flex items-center justify-between">
              <span className="font-semibold text-white">Achimota SHS Registry</span>
              <span className="text-cqTeal-400 font-mono text-[11px]">Staff Terminal</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {navItems.map((item) => {
                const active = isActive(item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileAdminNavOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${
                      active
                        ? 'bg-cqNavy-800 text-white font-bold border border-cqNavy-700'
                        : 'text-slate-300 hover:text-white hover:bg-cqNavy-800'
                    }`}
                  >
                    <Icon size={14} className={active ? 'text-cqTeal-400' : 'text-slate-400'} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 mt-2 border-t border-cqNavy-800">
              <Link
                to="/dashboard"
                onClick={() => {
                  setMobileAdminNavOpen(false);
                  loginAsCitizen();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-white bg-cqNavy-800 rounded-xl hover:bg-cqNavy-700"
              >
                <ArrowLeft size={13} />
                <span>Return to Student Portal View</span>
              </Link>
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
