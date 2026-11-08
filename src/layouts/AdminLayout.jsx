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
  Camera,
  ShoppingBag,
  CalendarCheck,
  Clock,
  ArrowLeft,
  School,
  Menu,
  X,
  Shield
} from 'lucide-react';
import DemoBanner from '../components/common/DemoBanner';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const location = useLocation();
  const { currentUser, loginAsCitizen } = useAuth();
  const [mobileAdminNavOpen, setMobileAdminNavOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Documents', path: '/admin/documents', icon: FileText },
    { name: 'Item Photos', path: '/admin/items', icon: Camera },
    { name: 'Prospectus', path: '/admin/prospectus', icon: ShoppingBag },
    { name: 'Appointments', path: '/admin/appointments', icon: CalendarCheck },
    { name: 'Capacity', path: '/admin/availability', icon: Clock }
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      <DemoBanner />

      {/* Admin Top Header */}
      <header className="bg-cqNavy-950 text-white border-b border-cqNavy-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            
            {/* Left: Admin Brand & Institution Indicator */}
            <div className="flex items-center gap-3">
              <Link to="/admin" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-cqNavy-800 text-cqTeal-400 border border-cqNavy-700 flex items-center justify-center">
                  <Shield size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-lg tracking-tight text-white">
                      Citizen<span className="text-cqTeal-400">Queue</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-tight px-2 py-0.5 rounded bg-cqNavy-800 text-cqTeal-300 border border-cqNavy-700">
                      Staff Portal
                    </span>
                  </div>
                </div>
              </Link>

              <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-cqNavy-800 text-xs text-slate-300">
                <School size={14} className="text-cqTeal-400" />
                <span className="font-semibold text-white">
                  Achimota Senior High School Desk
                </span>
              </div>
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

            {/* Right: Switch back to Student / Citizen View */}
            <div className="hidden sm:flex items-center gap-3">
              <Link
                to="/dashboard"
                onClick={loginAsCitizen}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-cqNavy-800 border border-cqNavy-700 transition-colors"
                title="Switch back to citizen mode"
              >
                <ArrowLeft size={13} />
                <span>Student View</span>
              </Link>
            </div>

            {/* Mobile Admin Nav Toggle */}
            <button
              type="button"
              onClick={() => setMobileAdminNavOpen(!mobileAdminNavOpen)}
              className="xl:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-cqNavy-800"
              aria-label="Toggle admin navigation"
            >
              {mobileAdminNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileAdminNavOpen && (
          <div className="xl:hidden bg-cqNavy-900 border-t border-cqNavy-800 px-4 py-3 space-y-1 animate-fade-in">
            <div className="pb-2 mb-2 border-b border-cqNavy-800 text-xs text-slate-300 flex items-center gap-2">
              <School size={14} className="text-cqTeal-400" />
              <span>Achimota Senior High School Admissions</span>
            </div>

            <div className="grid grid-cols-2 gap-1">
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

            <div className="pt-2 border-t border-cqNavy-800">
              <Link
                to="/dashboard"
                onClick={() => {
                  loginAsCitizen();
                  setMobileAdminNavOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-300 hover:text-white bg-cqNavy-800 rounded-xl"
              >
                <ArrowLeft size={14} />
                <span>Return to Student Portal</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* Admin Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CitizenQueue Institution Control Portal • Demo Instance</span>
          <span>Logged in as: <strong>{currentUser?.name || 'Admissions Officer Addo'}</strong></span>
        </div>
      </footer>
    </div>
  );
}
