/**
 * CitizenQueue - Authentication: Sign In & Password Reset Page
 * 
 * Route: `/login` (and `/signin`)
 * 
 * Production-grade authentication for Students/Guardians and School Administrators.
 * Features:
 * - Standard full-length password support (no 4-digit limit)
 * - Forgot Password tab with Multi-Channel OTP verification (Email & SMS)
 * - Live validation, password toggle visibility, and sample demo fill helpers
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  School,
  User,
  ShieldCheck,
  KeyRound,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Mail,
  Phone,
  RotateCcw,
  Lock,
  Search,
  X,
  Check,
  ChevronDown,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { InstitutionService } from '../../services/institutionService';

// Fallback catalog of Ghanaian Senior High Schools (merged with live DB schools)
const FALLBACK_SCHOOLS = [
  { id: 'inst-1', schoolId: 'inst-1', name: 'Achimota Senior High School', shortName: 'Achimota', region: 'Greater Accra', town: 'Accra', category: 'Category A' },
  { id: 'inst-2', schoolId: 'inst-2', name: 'Prempeh College', shortName: 'Prempeh', region: 'Ashanti', town: 'Kumasi', category: 'Category A' },
  { id: 'inst-3', schoolId: 'inst-3', name: 'Tamale Senior High School', shortName: 'Tamasco', region: 'Northern', town: 'Tamale', category: 'Category A' },
  { id: 'inst-4', schoolId: 'inst-4', name: "Presbyterian Boys' Secondary School (PRESEC Legon)", shortName: 'PRESEC Legon', region: 'Greater Accra', town: 'Accra', category: 'Category A' },
  { id: 'inst-5', schoolId: 'inst-5', name: 'Mfantsipim School', shortName: 'Kwabotwe', region: 'Central', town: 'Cape Coast', category: 'Category A' },
  { id: 'inst-6', schoolId: 'inst-6', name: "Wesley Girls' High School", shortName: 'Wey Gey Hey', region: 'Central', town: 'Cape Coast', category: 'Category A' },
  { id: 'inst-7', schoolId: 'inst-7', name: 'Opoku Ware School', shortName: 'OWASS', region: 'Ashanti', town: 'Kumasi', category: 'Category A' },
  { id: 'inst-8', schoolId: 'inst-8', name: 'Adisadel College', shortName: 'Adisco', region: 'Central', town: 'Cape Coast', category: 'Category A' },
  { id: 'inst-9', schoolId: 'inst-9', name: "St. Augustine's College", shortName: 'Augusco', region: 'Central', town: 'Cape Coast', category: 'Category A' },
  { id: 'inst-10', schoolId: 'inst-10', name: 'Accra Academy', shortName: 'Bleoo', region: 'Greater Accra', town: 'Accra', category: 'Category A' },
  { id: 'inst-11', schoolId: 'inst-11', name: 'Holy Child School', shortName: 'Holico', region: 'Central', town: 'Cape Coast', category: 'Category A' },
  { id: 'inst-12', schoolId: 'inst-12', name: "St. Peter's Senior High School (PERSCO)", shortName: 'PERSCO', region: 'Eastern', town: 'Nkwatia', category: 'Category A' },
  { id: 'inst-13', schoolId: 'inst-13', name: "Aburi Girls' Senior High School", shortName: 'ABUGISS', region: 'Eastern', town: 'Aburi', category: 'Category A' },
  { id: 'inst-14', schoolId: 'inst-14', name: 'St. Louis Senior High School', shortName: 'St. Louis', region: 'Ashanti', town: 'Kumasi', category: 'Category A' },
  { id: 'inst-15', schoolId: 'inst-15', name: 'Kumasi High School', shortName: 'KUHIS', region: 'Ashanti', town: 'Kumasi', category: 'Category A' },
  { id: 'inst-16', schoolId: 'inst-16', name: "Yaa Asantewaa Girls' Senior High School", shortName: 'YAGSHS', region: 'Ashanti', town: 'Kumasi', category: 'Category A' },
  { id: 'inst-17', schoolId: 'inst-17', name: 'Pope John Senior High School and Minor Seminary', shortName: 'POJOSS', region: 'Eastern', town: 'Koforidua', category: 'Category A' },
  { id: 'inst-18', schoolId: 'inst-18', name: 'Ghana National College', shortName: 'Ghanacoll', region: 'Central', town: 'Cape Coast', category: 'Category A' },
  { id: 'inst-19', schoolId: 'inst-19', name: 'Keta Senior High Technical School', shortName: 'Ketasco', region: 'Volta', town: 'Keta', category: 'Category A' },
  { id: 'inst-20', schoolId: 'inst-20', name: 'Ghana Secondary Technical School (GSTS)', shortName: 'GSTS', region: 'Western', town: 'Takoradi', category: 'Category A' },
  { id: 'inst-21', schoolId: 'inst-21', name: 'Mawuli School', shortName: 'Mawuli', region: 'Volta', town: 'Ho', category: 'Category A' },
  { id: 'inst-22', schoolId: 'inst-22', name: "St. Rose's Senior High School", shortName: 'ROSEC', region: 'Eastern', town: 'Akwatia', category: 'Category A' },
  { id: 'inst-23', schoolId: 'inst-23', name: 'Bishop Herman College', shortName: 'BIHECO', region: 'Volta', town: 'Kpando', category: 'Category A' },
  { id: 'inst-24', schoolId: 'inst-24', name: "Archbishop Porter Girls' Secondary School", shortName: 'APGSS', region: 'Western', town: 'Takoradi', category: 'Category A' },
  { id: 'inst-25', schoolId: 'inst-25', name: 'Sunyani Senior High School', shortName: 'SUSEC', region: 'Bono', town: 'Sunyani', category: 'Category B' },
  { id: 'inst-26', schoolId: 'inst-26', name: 'Bolgatanga Senior High School', shortName: 'Big BOSS', region: 'Upper East', town: 'Bolgatanga', category: 'Category B' },
  { id: 'inst-27', schoolId: 'inst-27', name: 'Wa Senior High School', shortName: 'WASEC', region: 'Upper West', town: 'Wa', category: 'Category B' }
];

export default function SignInPage() {
  const navigate = useNavigate();
  const {
    loginAsCitizen,
    loginAsAdmin,
    forgotPassword,
    resetPassword
  } = useAuth();

  // Active Role/View Tab: 'student' | 'admin' | 'forgot_password'
  const [activeRole, setActiveRole] = useState('student');

  // Student Form State
  const [studentIdentifier, setStudentIdentifier] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [showStudentPassword, setShowStudentPassword] = useState(false);

  // Admin Form State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminSchool, setAdminSchool] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Staff School Autocomplete State
  const [schools, setSchools] = useState(FALLBACK_SCHOOLS);
  const [isSchoolDropdownOpen, setIsSchoolDropdownOpen] = useState(false);
  const schoolDropdownRef = useRef(null);
  const schoolInputRef = useRef(null);

  // Load schools from backend and merge with fallback catalog
  useEffect(() => {
    let isMounted = true;
    const fetchSchools = async () => {
      try {
        const liveSchools = await InstitutionService.getAll();
        if (isMounted && Array.isArray(liveSchools) && liveSchools.length > 0) {
          const map = new Map();
          liveSchools.forEach((s) => {
            const key = (s.name || '').toLowerCase().trim();
            if (key) {
              map.set(key, {
                id: s.schoolId || s._id || s.id || `sch-${map.size + 1}`,
                schoolId: s.schoolId || s._id || s.id,
                name: s.name,
                shortName: s.shortName || s.name,
                region: s.region || 'Ghana',
                town: s.town || s.city || '',
                category: s.category || 'Senior High School'
              });
            }
          });
          FALLBACK_SCHOOLS.forEach((fallback) => {
            const key = fallback.name.toLowerCase().trim();
            if (!map.has(key)) {
              map.set(key, fallback);
            }
          });
          setSchools(Array.from(map.values()));
        }
      } catch {
        // Fallback catalog remains active
      }
    };
    fetchSchools();
    return () => { isMounted = false; };
  }, []);

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (schoolDropdownRef.current && !schoolDropdownRef.current.contains(e.target)) {
        setIsSchoolDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Dynamic school suggestions filter as staff types
  const filteredSchools = useMemo(() => {
    const q = (adminSchool || '').trim().toLowerCase();
    if (!q) {
      return schools.slice(0, 10);
    }
    return schools
      .filter((s) => {
        const nameMatch = s.name.toLowerCase().includes(q);
        const shortMatch = s.shortName ? s.shortName.toLowerCase().includes(q) : false;
        const regionMatch = s.region ? s.region.toLowerCase().includes(q) : false;
        const townMatch = s.town ? s.town.toLowerCase().includes(q) : false;
        return nameMatch || shortMatch || regionMatch || townMatch;
      })
      .slice(0, 12);
  }, [schools, adminSchool]);

  const handleSelectAdminSchool = (school) => {
    setAdminSchool(school.name);
    setIsSchoolDropdownOpen(false);
    setFormError('');
  };

  const handleClearAdminSchool = () => {
    setAdminSchool('');
    setIsSchoolDropdownOpen(true);
    if (schoolInputRef.current) {
      schoolInputRef.current.focus();
    }
  };

  // Forgot Password Flow State
  const [forgotStep, setForgotStep] = useState('request'); // 'request' | 'reset' | 'success'
  const [forgotMode, setForgotMode] = useState('email'); // 'email' | 'phone' | 'index'
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotChannel, setForgotChannel] = useState('email'); // 'email' | 'phone'
  const [maskedDestination, setMaskedDestination] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Switch to Forgot Password tab with optional pre-filled identifier
  const openForgotPassword = (initialIdentifier = '', initialChannel = 'email') => {
    const rawId = (initialIdentifier || studentIdentifier || adminEmail).trim();
    setForgotIdentifier(rawId);
    if (rawId.includes('@')) {
      setForgotMode('email');
      setForgotChannel('email');
    } else if (rawId && rawId.replace(/\D/g, '').length === 10 && rawId.startsWith('10')) {
      setForgotMode('index');
      setForgotChannel(initialChannel || 'email');
    } else if (rawId && rawId.replace(/\D/g, '').length >= 8) {
      setForgotMode('phone');
      setForgotChannel('phone');
    } else {
      setForgotMode(initialChannel === 'phone' ? 'phone' : 'email');
      setForgotChannel(initialChannel || 'email');
    }
    setForgotStep('request');
    setOtpCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setDevOtp('');
    setFormError('');
    setForgotSuccessMsg('');
    setActiveRole('forgot_password');
  };

  // Handle student login submit
  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    if (!studentIdentifier.trim()) {
      setFormError('Please enter your BECE Index Number, Email, or Phone Number.');
      setIsSubmitting(false);
      return;
    }

    if (!studentPassword) {
      setFormError('Please enter your account password.');
      setIsSubmitting(false);
      return;
    }

    const res = await loginAsCitizen({
      identifier: studentIdentifier.trim(),
      beceIndexNumber: studentIdentifier.trim(),
      password: studentPassword.trim()
    });

    setIsSubmitting(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setFormError(res.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  // Handle admin login submit
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    if (!adminEmail.trim()) {
      setFormError('Please enter your institutional email address.');
      setIsSubmitting(false);
      return;
    }

    if (!adminPassword) {
      setFormError('Please enter your staff password.');
      setIsSubmitting(false);
      return;
    }

    const res = await loginAsAdmin({
      email: adminEmail.trim(),
      identifier: adminEmail.trim(),
      password: adminPassword.trim()
    });

    setIsSubmitting(false);
    if (res.success) {
      navigate('/admin');
    } else {
      setFormError(res.error || 'Staff authentication failed. Please check your credentials.');
    }
  };

  // Handle Forgot Password - Request OTP
  const handleForgotPasswordRequest = async (e) => {
    e.preventDefault();
    setFormError('');
    setForgotSuccessMsg('');

    if (!forgotIdentifier.trim()) {
      setFormError('Please provide your BECE Index Number, registered Email, or Phone Number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await forgotPassword({
        identifier: forgotIdentifier.trim(),
        channel: forgotChannel
      });

      if (res.success && res.data) {
        setMaskedDestination(res.data.destination || forgotIdentifier.trim());
        if (res.data.devOtp) {
          setDevOtp(res.data.devOtp);
        }
        setForgotStep('reset');
        setForgotSuccessMsg(res.data.message || 'A 6-digit confirmation code has been dispatched.');
      } else {
        setFormError(res.error || 'No matching account found with the provided credentials.');
      }
    } catch (err) {
      setFormError(err.message || 'Failed to dispatch verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Forgot Password - Verify OTP & Reset Password
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setFormError('Please enter the 6-digit verification code sent to your chosen channel.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setFormError('Your new password must be at least 8 characters long.');
      return;
    }

    if (!/[a-zA-Z]/.test(newPassword)) {
      setFormError('Your new password must contain at least one letter (a-z or A-Z).');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setFormError('The new password and confirmation password do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPassword({
        identifier: forgotIdentifier.trim(),
        otp: otpCode.trim(),
        newPassword
      });

      if (res.success) {
        setForgotStep('success');
      } else {
        setFormError(res.error || 'Verification code is invalid or has expired.');
      }
    } catch (err) {
      setFormError(err.message || 'An error occurred while resetting your password.');
    } finally {
      setIsSubmitting(false);
    }
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
            {activeRole === 'forgot_password' ? 'Password Recovery' : 'Sign In to CitizenQueue'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {activeRole === 'forgot_password'
              ? 'Reset your credentials using an OTP confirmation code'
              : 'Access your Senior High School admission orchestration account'}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          
          {/* Role & Action Segmented Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setActiveRole('student');
                setFormError('');
                setForgotSuccessMsg('');
              }}
              className={`py-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
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
                setForgotSuccessMsg('');
              }}
              className={`py-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeRole === 'admin'
                  ? 'bg-white text-cqNavy-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShieldCheck size={14} className={activeRole === 'admin' ? 'text-cqTeal-600' : 'text-slate-400'} />
              <span>School Staff</span>
            </button>

            {/* <button
              type="button"
              onClick={() => openForgotPassword()}
              className={`py-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeRole === 'forgot_password'
                  ? 'bg-white text-cqNavy-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <KeyRound size={14} className={activeRole === 'forgot_password' ? 'text-cqTeal-600' : 'text-slate-400'} />
              <span>Forgot Password</span>
            </button> */}
          </div>

          {/* Form Error Message */}
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Form Success Message */}
          {forgotSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
              <span>{forgotSuccessMsg}</span>
            </div>
          )}

          {/* 1. STUDENT FORM */}
          {activeRole === 'student' && (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                 Email or Phone Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your email or number"
                  value={studentIdentifier}
                  onChange={(e) => setStudentIdentifier(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => openForgotPassword(studentIdentifier, 'email')}
                    className="text-[11px] font-semibold text-cqTeal-700 hover:text-cqTeal-800 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showStudentPassword ? 'text' : 'password'}
                    required
                    placeholder="XXXXXX"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500 transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStudentPassword(!showStudentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showStudentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-fit mx-auto px-8 py-3 rounded-xl bg-cqNavy-950 hover:bg-cqNavy-900 disabled:opacity-60 text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* 2. ADMIN FORM */}
          {activeRole === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="space-y-1.5 relative" ref={schoolDropdownRef}>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Assigned Senior High School
                  </label>
                  <span className="text-[10px] text-cqTeal-600 font-medium">
                    Type to search school
                  </span>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search size={15} />
                  </div>
                  <input
                    ref={schoolInputRef}
                    type="text"
                    required
                    placeholder="Type school name e.g. Achimota, Prempeh, PRESEC..."
                    value={adminSchool}
                    onChange={(e) => {
                      setAdminSchool(e.target.value);
                      setIsSchoolDropdownOpen(true);
                      setFormError('');
                    }}
                    onFocus={() => setIsSchoolDropdownOpen(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setIsSchoolDropdownOpen(false);
                      }
                    }}
                    autoComplete="off"
                    className="w-full pl-9 pr-16 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cqTeal-500 transition-colors font-medium"
                  />
                  <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-0.5">
                    {adminSchool && (
                      <button
                        type="button"
                        onClick={handleClearAdminSchool}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Clear school name"
                      >
                        <X size={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsSchoolDropdownOpen((prev) => !prev)}
                      className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Toggle school suggestions"
                    >
                      <ChevronDown
                        size={15}
                        className={`transform transition-transform duration-200 ${
                          isSchoolDropdownOpen ? 'rotate-180 text-cqTeal-600' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Floating Suggestions Dropdown */}
                {isSchoolDropdownOpen && (
                  <div className="absolute z-30 left-0 right-0 mt-1 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-64 flex flex-col">
                    <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>Suggested Schools ({filteredSchools.length})</span>
                      <span className="text-[10px] text-slate-400">Click to select</span>
                    </div>

                    <div className="overflow-y-auto divide-y divide-slate-50 py-1">
                      {filteredSchools.length > 0 ? (
                        filteredSchools.map((school) => {
                          const isSelected = adminSchool === school.name;
                          return (
                            <button
                              key={school.id || school.schoolId || school.name}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelectAdminSchool(school);
                              }}
                              className={`w-full text-left px-3.5 py-2.5 hover:bg-teal-50/70 transition-colors flex items-start justify-between gap-3 group ${
                                isSelected ? 'bg-cqTeal-50/80' : ''
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-xs font-bold truncate ${
                                      isSelected
                                        ? 'text-cqTeal-900'
                                        : 'text-slate-800 group-hover:text-cqTeal-900'
                                    }`}
                                  >
                                    {school.name}
                                  </span>
                                  {school.shortName && school.shortName !== school.name && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono shrink-0">
                                      {school.shortName}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                                  {school.region && (
                                    <span className="flex items-center gap-0.5">
                                      <MapPin size={11} className="text-slate-400 shrink-0" />
                                      <span>{school.region}</span>
                                    </span>
                                  )}
                                  {school.town && (
                                    <>
                                      <span className="text-slate-300">•</span>
                                      <span>{school.town}</span>
                                    </>
                                  )}
                                  {school.category && (
                                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                                      {school.category}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {isSelected && (
                                <div className="shrink-0 mt-1 text-cqTeal-600">
                                  <Check size={16} />
                                </div>
                              )}
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center space-y-1.5">
                          <p className="text-xs font-semibold text-slate-700">
                            No matching registered school found
                          </p>
                          <p className="text-[11px] text-slate-500">
                            You can continue with <strong>"{adminSchool}"</strong> as your designated institution.
                          </p>
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setIsSchoolDropdownOpen(false);
                            }}
                            className="mt-1 text-xs font-bold text-cqTeal-700 hover:text-cqTeal-800 hover:underline"
                          >
                            Use "{adminSchool}"
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Staff Password
                  </label>
                  <button
                    type="button"
                    onClick={() => openForgotPassword(adminEmail, 'email')}
                    className="text-[11px] font-semibold text-cqTeal-700 hover:text-cqTeal-800 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    required
                    placeholder="XXXXXX"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500 transition-colors pr-10"
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
                disabled={isSubmitting}
                className="w-fit mx-auto px-8 py-3 rounded-xl bg-cqNavy-950 hover:bg-cqNavy-900 disabled:opacity-60 text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD TAB FLOW */}
          {activeRole === 'forgot_password' && (
            <div className="space-y-4">
              
              {/* STEP 1: REQUEST OTP */}
              {forgotStep === 'request' && (
                <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
                  
                  {/* Account Recovery Method Switcher */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Choose Recovery Channel
                    </label>
                    <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          setForgotMode('email');
                          setForgotChannel('email');
                          setFormError('');
                        }}
                        className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                          forgotMode === 'email'
                            ? 'bg-white text-cqNavy-950 shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        <Mail size={13} className={forgotMode === 'email' ? 'text-cqTeal-600' : 'text-slate-400'} />
                        <span>By Email</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setForgotMode('phone');
                          setForgotChannel('phone');
                          setFormError('');
                        }}
                        className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                          forgotMode === 'phone'
                            ? 'bg-white text-cqNavy-950 shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        <Phone size={13} className={forgotMode === 'phone' ? 'text-cqTeal-600' : 'text-slate-400'} />
                        <span>By Phone</span>
                      </button>

                      {/* <button
                        type="button"
                        onClick={() => {
                          setForgotMode('index');
                          setFormError('');
                        }}
                        className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                          forgotMode === 'index'
                            ? 'bg-white text-cqNavy-950 shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        <School size={13} className={forgotMode === 'index' ? 'text-cqTeal-600' : 'text-slate-400'} />
                        <span>By Index No.</span>
                      </button> */}
                    </div>
                  </div>

                  {/* Input Field Tailored to Selected Mode */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      {forgotMode === 'email' ? (
                        <>
                          <Mail size={13} className="text-cqTeal-600" />
                          <span>Email Address *</span>
                        </>
                      ) : forgotMode === 'phone' ? (
                        <>
                          <Phone size={13} className="text-cqTeal-600" />
                          <span>Phone Number *</span>
                        </>
                      ) : (
                        <>
                          <School size={13} className="text-cqTeal-600" />
                          <span>BECE Index Number *</span>
                        </>
                      )}
                    </label>

                    <div className="relative">
                      <input
                        type={forgotMode === 'email' ? 'email' : 'text'}
                        required
                        placeholder={
                          forgotMode === 'email'
                            ? 'Enter email address used at registration'
                            : forgotMode === 'phone'
                            ? 'Enter mobile phone (e.g. +233 24 411 2233 or 0244112233)'
                            : 'Enter 10-digit BECE Index Number'
                        }
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500 transition-colors"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {forgotMode === 'email'
                        ? 'We will send a 6-digit confirmation code directly to this email inbox.'
                        : forgotMode === 'phone'
                        ? 'We will send a 6-digit confirmation code via SMS to this mobile number.'
                        : 'Your OTP will be sent to the contact phone or email linked to your admission profile.'}
                    </p>
                  </div>

                  {/* Delivery preference when using Index Number */}
                  {forgotMode === 'index' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        Deliver OTP Code To
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setForgotChannel('email')}
                          className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                            forgotChannel === 'email'
                              ? 'border-cqTeal-500 bg-cqTeal-50/50 text-cqNavy-950 ring-1 ring-cqTeal-500'
                              : 'border-slate-200 hover:border-slate-300 text-slate-600'
                          }`}
                        >
                          <Mail size={14} className={forgotChannel === 'email' ? 'text-cqTeal-600' : 'text-slate-400'} />
                          <span className="text-xs font-bold">Registered Email</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setForgotChannel('phone')}
                          className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                            forgotChannel === 'phone'
                              ? 'border-cqTeal-500 bg-cqTeal-50/50 text-cqNavy-950 ring-1 ring-cqTeal-500'
                              : 'border-slate-200 hover:border-slate-300 text-slate-600'
                          }`}
                        >
                          <Phone size={14} className={forgotChannel === 'phone' ? 'text-cqTeal-600' : 'text-slate-400'} />
                          <span className="text-xs font-bold">Registered Phone</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-cqNavy-950 hover:bg-cqNavy-900 disabled:opacity-60 text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <span>{isSubmitting ? 'Sending OTP Code...' : 'Send Verification OTP'}</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}

              {/* STEP 2: VERIFY OTP & SET NEW PASSWORD */}
              {forgotStep === 'reset' && (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  
                  {/* Destination Info & Quick Demo Helper */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Destination:</span>
                      <span className="font-semibold text-slate-900 font-mono">{maskedDestination}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500">Delivery Channel:</span>
                      <span className="font-semibold text-cqTeal-700 capitalize">{forgotChannel}</span>
                    </div>
                    {devOtp && (
                      <div className="mt-2 pt-1.5 border-t border-dashed border-cqTeal-200 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-cqTeal-700 flex items-center gap-1">
                          <Sparkles size={12} />
                          <span>Demo OTP Code:</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setOtpCode(devOtp)}
                          className="px-2 py-0.5 bg-cqTeal-100 hover:bg-cqTeal-200 text-cqTeal-800 rounded font-mono text-xs font-bold transition-colors"
                        >
                          Auto-fill {devOtp}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 6-Digit OTP Input */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700">
                        Enter 6-Digit Verification Code
                      </label>
                      <button
                        type="button"
                        onClick={handleForgotPasswordRequest}
                        disabled={isSubmitting}
                        className="text-[11px] font-semibold text-cqTeal-700 hover:text-cqTeal-800 flex items-center gap-1"
                      >
                        <RotateCcw size={11} />
                        <span>Resend OTP</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="••••••"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-center font-mono text-lg tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                    />
                  </div>

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700">
                        New Password (min. 8 characters)
                      </label>
                      <span className="text-[10px] text-cqTeal-600 font-medium">
                        At least 1 letter
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        placeholder="At least 8 characters (no max limit)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        aria-label="Toggle new password visibility"
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Must be &ge; 8 characters with at least one letter. No maximum limit.
                    </p>
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700">
                        Confirm New Password
                      </label>
                      <span className="text-[10px] text-slate-400">
                        Match above
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter your new password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        aria-label="Toggle confirm password visibility"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Must match password exactly.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-cqNavy-950 hover:bg-cqNavy-900 disabled:opacity-60 text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <span>{isSubmitting ? 'Resetting Password...' : 'Reset Password & Proceed'}</span>
                    <Lock size={15} />
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setForgotStep('request')}
                      className="text-xs font-medium text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
                    >
                      <ArrowLeft size={12} />
                      <span>Change identifier or delivery channel</span>
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: RESET SUCCESS CONFIRMATION */}
              {forgotStep === 'success' && (
                <div className="text-center py-4 space-y-4">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 size={32} />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-slate-900">
                      Password Reset Successfully!
                    </h3>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Your CitizenQueue credentials have been updated. You can now log into your account using your new password.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      // Switch to student (or admin) with new password pre-filled
                      if (forgotIdentifier.includes('@') && forgotIdentifier.endsWith('.edu.gh')) {
                        setAdminEmail(forgotIdentifier);
                        setAdminPassword(newPassword);
                        setActiveRole('admin');
                      } else {
                        setStudentIdentifier(forgotIdentifier);
                        setStudentPassword(newPassword);
                        setActiveRole('student');
                      }
                      setFormError('');
                      setForgotSuccessMsg('Password updated! Click Sign In to access your dashboard.');
                    }}
                    className="w-full py-3 rounded-xl bg-cqNavy-950 hover:bg-cqNavy-900 text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>Return to Sign In</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

            </div>
          )}

          {/* Discreet Sample Fill Helper for Sign In
          {activeRole !== 'forgot_password' && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-center">
              {activeRole === 'student' ? (
                <button
                  type="button"
                  onClick={() => {
                    setStudentIdentifier('101245089');
                    setStudentPassword('Password123!');
                  }}
                  className="text-[11px] font-semibold text-cqTeal-700 hover:text-cqTeal-800 flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles size={12} />
                  <span>Fill sample student credentials (Index: 101245089 • Pass: Password123!)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAdminEmail('admin@achimota.edu.gh');
                    setAdminPassword('Password123!');
                    setAdminSchool('Achimota Senior High School');
                  }}
                  className="text-[11px] font-semibold text-cqTeal-700 hover:text-cqTeal-800 flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles size={12} />
                  <span>Fill sample staff credentials (admin@achimota.edu.gh • Password123!)</span>
                </button>
              )}
            </div>
          )} */}
        </div>

        {/* Link to Register or Back to Sign In */}
        <p className="text-center text-xs text-slate-500">
          {activeRole === 'forgot_password' ? (
            <span>
              Remembered your credentials?{' '}
              <button
                type="button"
                onClick={() => {
                  setActiveRole('student');
                  setFormError('');
                  setForgotSuccessMsg('');
                }}
                className="font-bold text-cqNavy-950 hover:text-cqTeal-700 underline"
              >
                Back to Sign In
              </button>
            </span>
          ) : activeRole === 'admin' ? (
            <span>
              First-time school officer or housemaster?{' '}
              <Link to="/admin/register" className="font-bold text-cqNavy-950 hover:text-cqTeal-700 underline">
                Set up staff desk profile
              </Link>
            </span>
          ) : (
            <span>
              Haven't created an admission profile yet?{' '}
              <Link to="/register" className="font-bold text-cqTeal-700 hover:text-cqTeal-800 underline">
                Register your placement
              </Link>
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
