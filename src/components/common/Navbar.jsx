/**
 * CitizenQueue - Main Navigation Bar
 * 
 * Provides responsive, production-grade navigation for students, guardians,
 * and institutional staff with clean account controls and clear access points.
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
  UserPlus,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { currentUser, isCitizen, isAdmin, isAuthenticated, logout, loginAsAdmin, loginAsCitizen } = useAuth();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const authenticatedLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Admission Profile', href: '/profile', icon: User },
    { name: 'Digital Prospectus', href: '/prospectus', icon: ShoppingBag },
    { name: 'Document Centre', href: '/documents', icon: FileText },
    { name: 'Progress', href: '/progress', icon: TrendingUp },
    { name: 'Reporting Slots', href: '/book', icon: Calendar }
  ];

  const publicLinks = [
    { name: 'Admission Overview', href: '/', icon: School },
    { name: 'Requirements & Services', href: '/services', icon: FileText },
    { name: 'Reporting Capacity', href: '/book', icon: Calendar }
  ];

  const currentNavLinks = isAuthenticated ? authenticatedLinks : publicLinks;

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
                <span className="text-[10px] font-bold uppercase tracking-wider bg-cqTeal-50 text-cqTeal-800 border border-cqTeal-200 px-1.5 py-0.2 rounded hidden sm:inline-block">
                  SHS
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 -mt-0.5 hidden sm:block">
                Admission Orchestration Platform
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {currentNavLinks.map((link) => {
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

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Staff desk link */}
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-cqNavy-950 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                >
                  <Shield size={13} className="text-cqTeal-600" />
                  <span>Staff Desk</span>
                </Link>

                {/* User avatar menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 pl-2.5 pr-2 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-800"
                  >
                    <div className="w-6 h-6 rounded-lg bg-cqNavy-950 text-cqTeal-300 flex items-center justify-center font-bold text-[11px]">
                      {(currentUser?.name || 'U')[0]}
                    </div>
                    <span className="truncate max-w-[120px]">{currentUser?.name || 'Account'}</span>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-3.5 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.name}</p>
                        <p className="text-[11px] text-slate-500 capitalize">{currentUser?.role} Account</p>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                      >
                        <LayoutDashboard size={14} className="text-slate-400" />
                        <span>Candidate Dashboard</span>
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                      >
                        <User size={14} className="text-slate-400" />
                        <span>Admission Profile</span>
                      </Link>

                      <div className="border-t border-slate-100 my-1" />

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
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                      >
                        <Shield size={14} className="text-cqTeal-600" />
                        <span>{isAdmin ? 'Switch to Student View' : 'Switch to Staff Desk'}</span>
                      </button>

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
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
            ) : (
              <div className="flex items-center gap-2">
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
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-xs bg-cqNavy-950 text-white hover:bg-cqNavy-900"
                >
                  <UserPlus size={13} className="text-cqTeal-400" />
                  <span>Register Placement</span>
                </Link>

                <div className="h-5 w-[1px] bg-slate-200 mx-1" />

                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-cqNavy-950 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                >
                  <Shield size={13} className="text-cqTeal-600" />
                  <span>Staff Desk</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
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
          <div className="lg:hidden py-4 border-t border-slate-200 space-y-3 animate-fade-in">
            <div className="grid grid-cols-1 gap-1">
              {currentNavLinks.map((link) => {
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
              {isAuthenticated ? (
                <>
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
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-cqNavy-950 bg-slate-100 rounded-xl"
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
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
                  >
                    <LogIn size={14} />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-cqNavy-950 text-white text-xs font-bold"
                  >
                    <UserPlus size={14} className="text-cqTeal-400" />
                    <span>Register</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
