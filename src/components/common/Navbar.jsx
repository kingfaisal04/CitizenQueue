/**
 * CitizenQueue - Main Navigation Bar
 * 
 * Provides responsive navigation for students, guardians, and institutional staff,
 * including prominent Sign In and Sign Up entry points.
 */

import React, { useState } from 'react';
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
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { currentUser, isCitizen, isAdmin } = useAuth();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const citizenNavLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Admission Profile', href: '/profile', icon: User },
    { name: 'Digital Prospectus', href: '/prospectus', icon: ShoppingBag },
    { name: 'Document Centre', href: '/documents', icon: FileText },
    { name: 'Progress Tracker', href: '/progress', icon: TrendingUp },
    { name: 'Reporting Booking', href: '/book', icon: Calendar }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-cqNavy-950 text-white flex items-center justify-center shadow-md group-hover:bg-cqNavy-900 transition-colors">
              <School className="w-5 h-5 text-cqTeal-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-cqNavy-950 font-sans">
                  Citizen<span className="text-cqTeal-600">Queue</span>
                </span>
                {/* <span className="text-[10px] font-bold uppercase tracking-wider bg-cqTeal-50 text-cqTeal-800 border border-cqTeal-200 px-1.5 py-0.2 rounded hidden sm:inline-block">
                  SHS
                </span> */}
              </div>
              <p className="text-[11px] font-medium text-slate-500 -mt-0.5 hidden sm:block">
                Admission Coordination System
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {citizenNavLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'text-cqNavy-950 bg-slate-100 font-bold'
                      : 'text-slate-600 hover:text-cqNavy-950 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={14} className={active ? 'text-cqTeal-600' : 'text-slate-400'} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right CTA / Mode Switcher */}
          <div className="hidden md:flex items-center gap-2">
            {isAdmin ? (
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-cqNavy-950 text-white hover:bg-cqNavy-900 shadow-sm transition-all"
              >
                <Shield size={14} className="text-cqTeal-400" />
                <span>School Staff Portal</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
                    isActive('/login') || isActive('/signin')
                      ? 'bg-slate-100 text-cqNavy-950 font-bold'
                      : 'text-slate-700 hover:text-cqNavy-950 hover:bg-slate-100'
                  }`}
                >
                  <LogIn size={13} className="text-slate-500" />
                  <span>Sign In</span>
                </Link>

                <Link
                  to="/signup"
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all shadow-xs ${
                    isActive('/signup') || isActive('/register')
                      ? 'bg-cqNavy-950 text-white'
                      : 'bg-cqNavy-950 text-white hover:bg-cqNavy-900'
                  }`}
                >
                  <UserPlus size={13} className="text-cqTeal-400" />
                  <span>Sign Up</span>
                </Link>

                <div className="h-5 w-[1px] bg-slate-200 mx-1" />

                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-cqNavy-950 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                >
                  <Shield size={13} className="text-cqTeal-600" />
                  <span>Staff Desk</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex xl:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="xl:hidden py-4 border-t border-slate-200 space-y-3 animate-fade-in">
            <div className="grid grid-cols-1 gap-1">
              {citizenNavLinks.map((link) => {
                const active = isActive(link.href);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      active
                        ? 'text-cqNavy-950 bg-slate-100 font-bold'
                        : 'text-slate-600 hover:text-cqNavy-950 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={16} className={active ? 'text-cqTeal-600' : 'text-slate-400'} />
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-50"
                >
                  <LogIn size={14} />
                  <span>Sign In</span>
                </Link>

                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-cqNavy-950 text-white text-xs font-bold hover:bg-cqNavy-900"
                >
                  <UserPlus size={14} className="text-cqTeal-400" />
                  <span>Sign Up</span>
                </Link>
              </div>

              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold hover:bg-slate-200"
              >
                <Shield size={14} className="text-cqTeal-600" />
                <span>Switch to School Staff Portal</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
