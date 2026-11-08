/**
 * CitizenQueue - Authentication: Sign In Page
 * 
 * Route: `/login` (and `/signin`)
 * 
 * Clean, production-grade authentication for Students/Guardians and School Administrators.
 * Includes sleek role tabs, live validation, and discreet sample fill helpers.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  School,
  User,
  ShieldCheck,
  LogIn,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SignInPage() {
  const navigate = useNavigate();
  const { loginAsCitizen, loginAsAdmin } = useAuth();

  // Active Role Tab: 'student' | 'admin'
  const [activeRole, setActiveRole] = useState('student');

  // Student Form State
  const [studentIdentifier, setStudentIdentifier] = useState('101245089');
  const [studentPin, setStudentPin] = useState('2026');
  const [showStudentPin, setShowStudentPin] = useState(false);

  // Admin Form State
  const [adminEmail, setAdminEmail] = useState('admissions-desk@achimota.edu.gh');
  const [adminPassword, setAdminPassword] = useState('staff2026');
  const [adminSchool, setAdminSchool] = useState('Achimota Senior High School');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const [formError, setFormError] = useState('');

  // Handle student login submit
  const handleStudentSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!studentIdentifier.trim()) {
      setFormError('Please enter your 10-digit BECE Index Number or Phone Number.');
      return;
    }

    loginAsCitizen({
      fullName: 'Emmanuel Mensah',
      beceIndexNumber: studentIdentifier.trim(),
      guardianName: 'Kwame Mensah',
      guardianPhone: '+233 24 411 2233',
      guardianEmail: 'kwame.mensah@example.com',
      assignedSchool: 'Achimota Senior High School',
      programme: 'General Science',
      residentialStatus: 'Boarding'
    });

    navigate('/dashboard');
  };

  // Handle admin login submit
  const handleAdminSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!adminEmail.trim()) {
      setFormError('Please enter your staff institutional email address.');
      return;
    }

    loginAsAdmin({
      name: 'Admissions Officer Addo',
      email: adminEmail.trim(),
      institutionName: adminSchool,
      institutionId: 'inst-1'
    });

    navigate('/admin');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-2xl bg-cqNavy-950 text-white flex items-center justify-center shadow-md group-hover:bg-cqNavy-900 transition-colors">
              <School className="w-6 h-6 text-cqTeal-400" />
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-cqNavy-950 tracking-tight">
            Sign In to CitizenQueue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Access your Senior High School admission orchestration account
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          
          {/* Role Segmented Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setActiveRole('student');
                setFormError('');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeRole === 'student'
                  ? 'bg-white text-cqNavy-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <User size={14} className={activeRole === 'student' ? 'text-cqTeal-600' : 'text-slate-400'} />
              <span>Student / Parent</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveRole('admin');
                setFormError('');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeRole === 'admin'
                  ? 'bg-white text-cqNavy-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShieldCheck size={14} className={activeRole === 'admin' ? 'text-cqTeal-600' : 'text-slate-400'} />
              <span>School Staff</span>
            </button>
          </div>

          {/* Form Error Message */}
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* 1. STUDENT FORM */}
          {activeRole === 'student' && (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  BECE Index Number or Phone Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1012450890"
                  value={studentIdentifier}
                  onChange={(e) => setStudentIdentifier(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    4-Digit Access PIN
                  </label>
                  <span className="text-[11px] text-slate-400">Default: 2026</span>
                </div>
                <div className="relative">
                  <input
                    type={showStudentPin ? 'text' : 'password'}
                    required
                    maxLength={6}
                    placeholder="••••"
                    value={studentPin}
                    onChange={(e) => setStudentPin(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500 tracking-widest transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStudentPin(!showStudentPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    aria-label="Toggle PIN visibility"
                  >
                    {showStudentPin ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cqNavy-950 hover:bg-cqNavy-900 text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>Sign In to Candidate Dashboard</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* 2. ADMIN FORM */}
          {activeRole === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Assigned Senior High School
                </label>
                <input
                  type="text"
                  required
                  value={adminSchool}
                  onChange={(e) => setAdminSchool(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Staff Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="admissions-desk@school.edu.gh"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Staff Password
                </label>
                <div className="relative">
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cqNavy-950 hover:bg-cqNavy-900 text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>Sign In to School Staff Desk</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* Discreet Sample Fill Helper */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center">
            {activeRole === 'student' ? (
              <button
                type="button"
                onClick={() => {
                  setStudentIdentifier('101245089');
                  setStudentPin('2026');
                }}
                className="text-[11px] font-semibold text-cqTeal-700 hover:text-cqTeal-800 flex items-center gap-1.5 transition-colors"
              >
                <Sparkles size={12} />
                <span>Fill sample student credentials (Index: 101245089 • PIN: 2026)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAdminEmail('admissions-desk@achimota.edu.gh');
                  setAdminPassword('staff2026');
                  setAdminSchool('Achimota Senior High School');
                }}
                className="text-[11px] font-semibold text-cqTeal-700 hover:text-cqTeal-800 flex items-center gap-1.5 transition-colors"
              >
                <Sparkles size={12} />
                <span>Fill sample staff credentials</span>
              </button>
            )}
          </div>
        </div>

        {/* Link to Register */}
        <p className="text-center text-xs text-slate-500">
          Haven't created an admission profile yet?{' '}
          <Link to="/register" className="font-bold text-cqTeal-700 hover:text-cqTeal-800 underline">
            Register your placement
          </Link>
        </p>
      </div>
    </div>
  );
}
