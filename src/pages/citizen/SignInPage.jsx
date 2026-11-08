/**
 * CitizenQueue - Authentication: Sign In / Login Page
 * 
 * Route: `/login` (and `/signin`)
 * 
 * Features role-based sign in tabs for Student/Guardian and School Administrator,
 * live validation, 1-click demonstration profile buttons, and responsive design.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  School,
  User,
  ShieldCheck,
  LogIn,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Calendar,
  ShoppingBag,
  FileText,
  HelpCircle,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SignInPage() {
  const navigate = useNavigate();
  const { loginAsCitizen, loginAsAdmin } = useAuth();

  // Active Tab: 'student' | 'admin'
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
  const [showForgotModal, setShowForgotModal] = useState(false);

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

  // Quick 1-click Demo Fill for specific students
  const handleQuickDemoStudent = (name, index, prog, res) => {
    loginAsCitizen({
      fullName: name,
      beceIndexNumber: index,
      programme: prog,
      residentialStatus: res,
      assignedSchool: 'Achimota Senior High School'
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 lg:py-16 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Left Column: Visual Brand Hero & Testimonial */}
        <div className="lg:col-span-5 bg-gradient-to-br from-cqNavy-950 via-cqNavy-900 to-cqNavy-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cqTeal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cqNavy-700/20 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 group w-fit">
              <div className="w-9 h-9 rounded-xl bg-cqNavy-800 text-cqTeal-400 flex items-center justify-center border border-cqNavy-700 shadow-xs">
                <School size={18} />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white font-sans">
                Citizen<span className="text-cqTeal-400">Queue</span>
              </span>
            </Link>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-cqTeal-300 bg-cqNavy-800 px-2.5 py-0.5 rounded-full border border-cqNavy-700">
                <Sparkles size={11} />
                SHS Admission Orchestration
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                Skip the 4:00 AM campus queues.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Coordinate your prospectus items, submit admission slips for early desk check, and reserve your physical arrival slot.
              </p>
            </div>

            {/* Value checklist */}
            <div className="space-y-3 pt-2 text-xs text-slate-200">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={15} className="text-cqTeal-400 shrink-0" />
                <span>Preliminary item photo inspection</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={15} className="text-cqTeal-400 shrink-0" />
                <span>Direct document review feedback from school desk</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={15} className="text-cqTeal-400 shrink-0" />
                <span>Guaranteed reporting time slot without chaos</span>
              </div>
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="pt-8 mt-8 border-t border-cqNavy-800/80 relative z-10">
            <p className="text-xs italic text-slate-300 leading-relaxed">
              "CitizenQueue helped us verify trunk dimensions and upload our placement slip before leaving Kasoa. On reporting day, check-in took 20 minutes."
            </p>
            <div className="mt-3 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-cqTeal-600/30 border border-cqTeal-400/40 text-cqTeal-300 flex items-center justify-center text-xs font-bold">
                KM
              </div>
              <div>
                <p className="text-xs font-bold text-white">Kwame Mensah</p>
                <p className="text-[10px] text-slate-400">Parent • Achimota School Admitted Student</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Form & Tabs */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div className="space-y-6">
            
            {/* Role Switcher Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setActiveRole('student');
                  setFormError('');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeRole === 'student'
                    ? 'bg-white text-cqNavy-950 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <User size={15} className={activeRole === 'student' ? 'text-cqTeal-600' : 'text-slate-400'} />
                <span>Student / Guardian</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveRole('admin');
                  setFormError('');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeRole === 'admin'
                    ? 'bg-white text-cqNavy-950 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <ShieldCheck size={15} className={activeRole === 'admin' ? 'text-cqTeal-600' : 'text-slate-400'} />
                <span>School Staff</span>
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle size={15} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* ============================================================== */}
            {/* STUDENT / GUARDIAN SIGN IN FORM                                */}
            {/* ============================================================== */}
            {activeRole === 'student' && (
              <form onSubmit={handleStudentSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-cqNavy-950">
                    Sign In to Student Command Centre
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enter your BECE index number or registered mobile phone.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    BECE Index Number or Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 101245089 or +233 24 411 2233"
                    value={studentIdentifier}
                    onChange={(e) => setStudentIdentifier(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">
                      Access PIN / Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-[11px] text-cqTeal-600 hover:text-cqTeal-700 font-semibold"
                    >
                      Need Help?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showStudentPin ? 'text' : 'password'}
                      placeholder="e.g. 2026"
                      value={studentPin}
                      onChange={(e) => setStudentPin(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500 pr-10 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStudentPin(!showStudentPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showStudentPin ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-cqNavy-950 hover:bg-cqNavy-900 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <LogIn size={15} />
                  <span>Open Admission Command Centre</span>
                </button>

                {/* 1-Click Demo Personas */}
                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Or 1-Click Demo Candidate Login:
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickDemoStudent('Emmanuel Mensah', '101245089', 'General Science', 'Boarding')}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-cqTeal-500 hover:bg-slate-50 transition-all text-left text-xs"
                    >
                      <p className="font-bold text-slate-900">Emmanuel Mensah</p>
                      <p className="text-[10px] text-slate-500">General Science • Boarding</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemoStudent('Adwoa Osei', '101245112', 'General Arts', 'Day')}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-cqTeal-500 hover:bg-slate-50 transition-all text-left text-xs"
                    >
                      <p className="font-bold text-slate-900">Adwoa Osei</p>
                      <p className="text-[10px] text-slate-500">General Arts • Day</p>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* ============================================================== */}
            {/* SCHOOL ADMINISTRATOR SIGN IN FORM                              */}
            {/* ============================================================== */}
            {activeRole === 'admin' && (
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-cqNavy-950">
                    School Staff Portal Login
                  </h3>
                  <p className="text-xs text-slate-500">
                    Administrative access for admissions desk officers and house masters.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Select Senior High School *
                  </label>
                  <select
                    value={adminSchool}
                    onChange={(e) => setAdminSchool(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500 font-medium"
                  >
                    <option value="Achimota Senior High School">Achimota Senior High School</option>
                    <option value="Prempeh College">Prempeh College</option>
                    <option value="Tamale Senior High School">Tamale Senior High School</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Staff Email / Admissions ID *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. admissions-desk@achimota.edu.gh"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">
                      Staff Password
                    </label>
                    <span className="text-[11px] text-slate-400 italic">Demo authorized</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showAdminPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-cqNavy-950 hover:bg-cqNavy-900 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={15} className="text-cqTeal-400" />
                  <span>Access Admissions Operations Desk</span>
                </button>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
                  <ShieldCheck size={14} className="text-cqTeal-600 shrink-0 mt-0.5" />
                  <span>
                    Staff credentials authorize access to student dossier verification, prospectus item screening, and daily reporting intake controls.
                  </span>
                </div>
              </form>
            )}

          </div>

          {/* Bottom Switcher */}
          <div className="pt-6 border-t border-slate-100 mt-6 text-center text-xs text-slate-500">
            {activeRole === 'student' ? (
              <p>
                New candidate placed via CSSPS?{' '}
                <Link to="/signup" className="font-bold text-cqTeal-700 hover:underline">
                  Create Admission Profile
                </Link>
              </p>
            ) : (
              <p>
                Are you a student or parent?{' '}
                <button
                  type="button"
                  onClick={() => setActiveRole('student')}
                  className="font-bold text-cqTeal-700 hover:underline"
                >
                  Switch to Student Sign In
                </button>
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Forgot PIN / Help Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HelpCircle size={18} className="text-cqTeal-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Sign In Access Code & PIN
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              In this prototype demonstration, your credentials are saved in your browser's local memory. You can sign in using:
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono space-y-1 text-slate-800">
              <p><strong>BECE Index:</strong> 101245089</p>
              <p><strong>Demo PIN:</strong> 2026</p>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              Or use the 1-Click Demo Buttons on the login form to immediately explore as Emmanuel Mensah or Adwoa Osei.
            </p>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 text-xs font-bold text-white bg-cqNavy-950 rounded-xl"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
