/**
 * CitizenQueue - Institutional Onboarding & Staff Profile Registration
 *
 * Routes: `/admin/register`, `/staff/register`, and `/institution/register`
 *
 * Supports two verified workflows:
 * 1. Join Existing Institution (Staff Onboarding): Staff select their registered school,
 *    enter their official Staff ID + Institution Authorization Key, and receive their assigned role.
 * 2. Register New Institution (Headmaster / Principal): Onboards a new school onto CitizenQueue,
 *    generates a unique Institution Authorization Key, and creates the primary School Administrator account.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  School,
  User,
  Shield,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  Building2,
  KeyRound,
  Search,
  X,
  Check,
  ChevronDown,
  MapPin,
  BadgeCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { InstitutionService } from '../../services/institutionService';

const GHANA_REGIONS = [
  'Greater Accra Region',
  'Ashanti Region',
  'Central Region',
  'Eastern Region',
  'Western Region',
  'Western North Region',
  'Volta Region',
  'Oti Region',
  'Northern Region',
  'Savannah Region',
  'North East Region',
  'Upper East Region',
  'Upper West Region',
  'Bono Region',
  'Bono East Region',
  'Ahafo Region'
];

const FALLBACK_SCHOOLS = [
  { id: 'inst-1', schoolId: 'inst-1', name: 'Achimota Senior High School', shortName: 'Achimota', region: 'Greater Accra Region', city: 'Accra' },
  { id: 'inst-2', schoolId: 'inst-2', name: 'Prempeh College', shortName: 'Prempeh', region: 'Ashanti Region', city: 'Kumasi' },
  { id: 'inst-5', schoolId: 'inst-5', name: 'Tamale Senior High School (Tamasco)', shortName: 'Tamasco', region: 'Northern Region', city: 'Tamale' }
];

const SYSTEM_ROLES = [
  { value: 'academic_officer', label: 'Academic Affairs Officer' },
  { value: 'housemaster', label: 'Housemaster / Housemistress' },
  { value: 'finance_officer', label: 'Finance / Bursary Officer' },
  { value: 'registrar', label: 'Registrar / Records Officer' },
  { value: 'library_officer', label: 'Library Clearance Officer' },
  { value: 'collection_officer', label: 'Collection / Desk Officer' },
  { value: 'school_admin', label: 'School Administrator' }
];

const STAFF_DESIGNATIONS = [
  'Admissions & Placement Officer',
  'Senior Housemaster / Senior Housemistress',
  'Housemaster / Housemistress (Dormitory Affairs)',
  'Academic Registrar / Assistant Head (Academics)',
  'Document Verification Officer',
  'School Bursar / Finance Officer',
  'Head of Institution (Principal / Headmaster)'
];

const DEPARTMENTS = [
  'Admissions & Records Directorate',
  'Boarding & Housemaster Affairs',
  'Academic Affairs Division',
  'Bursary & Accounts',
  'Guidance & Counselling Directorate',
  'Administration & General Operations'
];

export default function AdminRegisterPage({ defaultMode = 'staff' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { registerStaff, registerInstitution } = useAuth();

  const initialMode = location.pathname.includes('institution') ? 'institution' : defaultMode;
  const [mode, setMode] = useState(initialMode); // 'staff' | 'institution'

  // Live schools list for Staff Onboarding autocomplete
  const [schools, setSchools] = useState(FALLBACK_SCHOOLS);
  const [schoolQuery, setSchoolQuery] = useState('');
  const [isSchoolDropdownOpen, setIsSchoolDropdownOpen] = useState(false);
  const schoolDropdownRef = useRef(null);
  const schoolInputRef = useRef(null);

  // Tab 1: Join Existing Institution (Staff Onboarding) Form
  const [staffForm, setStaffForm] = useState({
    title: 'Mr.',
    fullName: '',
    staffId: '',
    email: '',
    phone: '',
    schoolId: '',
    schoolName: '',
    role: 'academic_officer',
    designation: 'Admissions & Placement Officer',
    department: 'Admissions & Records Directorate',
    authorizationKey: '',
    password: '',
    confirmPassword: ''
  });

  // Tab 2: Register New Institution Form
  const [instForm, setInstForm] = useState({
    schoolName: '',
    shortName: '',
    category: 'Senior High School',
    region: 'Greater Accra Region',
    city: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    adminFullName: '',
    adminStaffId: '',
    adminEmail: '',
    adminPhone: '',
    adminDesignation: 'Head of Institution (Principal / Headmaster)',
    adminDepartment: 'Administration & General Operations',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync mode if route changes between /admin/register and /institution/register
  useEffect(() => {
    if (location.pathname.includes('institution')) {
      setMode('institution');
    }
  }, [location.pathname]);

  // Fetch registered schools from live database
  useEffect(() => {
    let isMounted = true;
    const loadSchools = async () => {
      try {
        const live = await InstitutionService.getAll();
        if (isMounted && Array.isArray(live) && live.length > 0) {
          const formatted = live.map((s) => ({
            id: s.schoolId || s._id || s.id,
            schoolId: s.schoolId || s._id || s.id,
            name: s.name,
            shortName: s.shortName || s.name,
            region: s.region || 'Ghana',
            city: s.city || s.town || ''
          }));
          setSchools(formatted);
        }
      } catch {
        // Keep fallback schools
      }
    };
    loadSchools();
    return () => { isMounted = false; };
  }, []);

  // Close school suggestions on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (schoolDropdownRef.current && !schoolDropdownRef.current.contains(e.target)) {
        setIsSchoolDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const filteredSchools = useMemo(() => {
    const q = (schoolQuery || '').trim().toLowerCase();
    if (!q) return schools.slice(0, 12);
    return schools
      .filter((s) => {
        return (
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.shortName && s.shortName.toLowerCase().includes(q)) ||
          (s.region && s.region.toLowerCase().includes(q)) ||
          (s.city && s.city.toLowerCase().includes(q))
        );
      })
      .slice(0, 12);
  }, [schools, schoolQuery]);

  const handleSelectSchool = (school) => {
    setStaffForm((prev) => ({
      ...prev,
      schoolId: school.schoolId || school.id,
      schoolName: school.name
    }));
    setSchoolQuery(school.name);
    setIsSchoolDropdownOpen(false);
    setFormError('');
  };

  const handleStaffChange = (e) => {
    const { name, value } = e.target;
    setStaffForm((prev) => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const handleInstChange = (e) => {
    const { name, value } = e.target;
    setInstForm((prev) => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const validatePassword = (pwd, confirmPwd) => {
    if (!pwd || pwd.length < 8) {
      return 'Password must contain at least 8 characters (no maximum limit).';
    }
    if (!/[a-zA-Z]/.test(pwd)) {
      return 'Password must contain at least one letter (a-z or A-Z).';
    }
    if (pwd !== confirmPwd) {
      return 'Passwords do not match. Please re-enter your password.';
    }
    return '';
  };

  // Submit: Join Existing Institution (Staff Onboarding)
  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!staffForm.fullName.trim()) {
      setFormError('Please enter your full official name.');
      return;
    }
    if (!staffForm.staffId.trim()) {
      setFormError('Please provide your official GES or Institutional Staff ID Number.');
      return;
    }
    if (!staffForm.email.trim() || !staffForm.email.includes('@')) {
      setFormError('Please enter a valid official email address.');
      return;
    }
    if (!staffForm.phone.trim() || staffForm.phone.trim().length < 9) {
      setFormError('Please enter a valid contact phone number (at least 9 digits).');
      return;
    }
    if (!staffForm.schoolId && !schoolQuery.trim()) {
      setFormError('Please search and select your registered institution.');
      return;
    }
    if (!staffForm.authorizationKey.trim()) {
      setFormError('Please enter your Institution Authorization Key (obtain from your School Administrator).');
      return;
    }

    const pwdError = validatePassword(staffForm.password, staffForm.confirmPassword);
    if (pwdError) {
      setFormError(pwdError);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await registerStaff({
        fullName: `${staffForm.title} ${staffForm.fullName.trim()}`.trim(),
        name: `${staffForm.title} ${staffForm.fullName.trim()}`.trim(),
        staffId: staffForm.staffId.trim().toUpperCase(),
        email: staffForm.email.trim(),
        phone: staffForm.phone.trim(),
        schoolName: staffForm.schoolName || schoolQuery.trim(),
        schoolId: staffForm.schoolId || 'inst-1',
        institutionId: staffForm.schoolId || 'inst-1',
        role: staffForm.role,
        designation: staffForm.designation,
        department: staffForm.department,
        authorizationKey: staffForm.authorizationKey.trim(),
        password: staffForm.password
      });

      if (res.success) {
        setFormSuccess('Staff profile verified and created! Opening Admissions Command Desk...');
        setTimeout(() => {
          navigate('/admin');
        }, 700);
      } else {
        setFormError(res.error || 'Failed to create staff account. Please verify your Institution Key and details.');
      }
    } catch (err) {
      setFormError(err.message || 'An error occurred creating staff profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit: Register Brand-New Institution
  const handleInstitutionSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!instForm.schoolName.trim() || instForm.schoolName.trim().length < 3) {
      setFormError('Please enter the official name of your institution.');
      return;
    }
    if (!instForm.city.trim()) {
      setFormError('Please enter the city or town where the institution is located.');
      return;
    }
    if (!instForm.adminFullName.trim()) {
      setFormError('Please enter the primary administrator full name.');
      return;
    }
    if (!instForm.adminStaffId.trim()) {
      setFormError('Please enter the administrator official Staff ID.');
      return;
    }
    if (!instForm.adminEmail.trim() || !instForm.adminEmail.includes('@')) {
      setFormError('Please enter a valid official email address.');
      return;
    }
    if (!instForm.adminPhone.trim() || instForm.adminPhone.trim().length < 9) {
      setFormError('Please enter a valid contact phone number (at least 9 digits).');
      return;
    }

    const pwdError = validatePassword(instForm.password, instForm.confirmPassword);
    if (pwdError) {
      setFormError(pwdError);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await registerInstitution({
        schoolName: instForm.schoolName.trim(),
        shortName: instForm.shortName.trim() || undefined,
        category: instForm.category,
        region: instForm.region,
        city: instForm.city.trim(),
        address: instForm.address.trim() || undefined,
        contactEmail: instForm.contactEmail.trim() || undefined,
        contactPhone: instForm.contactPhone.trim() || undefined,
        adminFullName: instForm.adminFullName.trim(),
        adminStaffId: instForm.adminStaffId.trim().toUpperCase(),
        adminEmail: instForm.adminEmail.trim(),
        adminPhone: instForm.adminPhone.trim(),
        adminDesignation: instForm.adminDesignation,
        adminDepartment: instForm.adminDepartment,
        password: instForm.password
      });

      if (res.success) {
        const keyMsg = res.authorizationKey
          ? `Institution registered! Your Institution Authorization Key is ${res.authorizationKey}.`
          : 'Institution registered successfully!';
        setFormSuccess(`${keyMsg} Opening Staff & Key Management...`);
        setTimeout(() => {
          navigate('/admin/staff', {
            state: {
              newInstitutionKey: res.authorizationKey,
              welcomeMessage: `${res.school?.name || instForm.schoolName} is now live! Copy your Institution Authorization Key below and assign roles to your Staff IDs.`
            }
          });
        }, 900);
      } else {
        setFormError(res.error || 'Failed to register institution. Please check your details.');
      }
    } catch (err) {
      setFormError(err.message || 'An error occurred registering your institution.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center animate-fade-in">
      <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-10 space-y-6">
        
        {/* Header & Crest */}
        <div className="text-center space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-cqNavy-950 text-cqTeal-400 flex items-center justify-center mx-auto shadow-md ring-1 ring-cqNavy-800/20">
            {mode === 'institution' ? <Building2 size={24} /> : <Shield size={24} />}
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-cqTeal-700 bg-cqTeal-50 border border-cqTeal-200/80 px-2.5 py-0.5 rounded-full inline-block">
              {mode === 'institution' ? 'NEW INSTITUTION ONBOARDING' : 'INSTITUTIONAL STAFF DESK'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-cqNavy-950 tracking-tight">
              {mode === 'institution' ? 'Register Your Institution' : 'Staff Profile Onboarding'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
              {mode === 'institution'
                ? 'Onboard your school onto CitizenQueue, generate your private Institution Authorization Key, and manage Staff ID role assignments.'
                : 'Join your registered institution using your official Staff ID and Institution Authorization Key.'}
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setMode('staff');
              setFormError('');
              setFormSuccess('');
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'staff'
                ? 'bg-cqNavy-950 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BadgeCheck size={14} className={mode === 'staff' ? 'text-cqTeal-400' : 'text-slate-400'} />
            <span>Join Existing School (Staff)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('institution');
              setFormError('');
              setFormSuccess('');
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'institution'
                ? 'bg-cqNavy-950 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 size={14} className={mode === 'institution' ? 'text-cqTeal-400' : 'text-slate-400'} />
            <span>Register New Institution</span>
          </button>
        </div>

        {/* Success Alert */}
        {formSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-900 animate-fade-in">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span className="font-semibold">{formSuccess}</span>
          </div>
        )}

        {/* Error Alert */}
        {formError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs text-rose-800 animate-fade-in">
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* ============================================================
            TAB 1: JOIN EXISTING INSTITUTION (STAFF ONBOARDING)
           ============================================================ */}
        {mode === 'staff' && (
          <form onSubmit={handleStaffSubmit} className="space-y-6 text-xs">
            {/* SECTION 1: PERSONAL & STAFF IDENTIFICATION */}
            <div className="space-y-3.5 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm">
                <User size={16} className="text-cqTeal-600" />
                <span>1. Staff Bio-Data & Identification</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1 space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Title
                  </label>
                  <select
                    name="title"
                    value={staffForm.title}
                    onChange={handleStaffChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  >
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Rev.">Rev.</option>
                    <option value="Alhaji">Alhaji</option>
                    <option value="Hajia">Hajia</option>
                  </select>
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Full Official Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={staffForm.fullName}
                    onChange={handleStaffChange}
                    placeholder="e.g. Kwame Addo"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center justify-between">
                    <span>GES / Staff ID Number *</span>
                    <span className="text-[10px] text-cqTeal-600 font-normal">Matches Admin Roster</span>
                  </label>
                  <input
                    type="text"
                    name="staffId"
                    value={staffForm.staffId}
                    onChange={handleStaffChange}
                    placeholder="e.g. GES-482910"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono uppercase text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Official Phone Number *
                  </label>
                  <div className="relative">
                    <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={staffForm.phone}
                      onChange={handleStaffChange}
                      placeholder="e.g. +233 24 330 9988"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Staff Institutional Email Address *
                </label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={staffForm.email}
                    onChange={handleStaffChange}
                    placeholder="e.g. k.addo@achimota.edu.gh"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: INSTITUTIONAL ASSIGNMENT & KEY */}
            <div className="space-y-3.5 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm">
                <School size={16} className="text-cqTeal-600" />
                <span>2. Institution Assignment & Authorization Key</span>
              </div>

              {/* Searchable Registered Institution Autocomplete */}
              <div className="space-y-1 relative" ref={schoolDropdownRef}>
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Registered Institution *
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('institution')}
                    className="text-[10px] font-bold text-cqTeal-700 hover:underline"
                  >
                    School not listed? Register it →
                  </button>
                </div>

                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={schoolInputRef}
                    type="text"
                    required
                    placeholder="Search registered school e.g. Achimota, Prempeh..."
                    value={schoolQuery}
                    onChange={(e) => {
                      setSchoolQuery(e.target.value);
                      setStaffForm((prev) => ({ ...prev, schoolName: e.target.value, schoolId: '' }));
                      setIsSchoolDropdownOpen(true);
                    }}
                    onFocus={() => setIsSchoolDropdownOpen(true)}
                    autoComplete="off"
                    className="w-full pl-8 pr-14 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                    {schoolQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSchoolQuery('');
                          setStaffForm((prev) => ({ ...prev, schoolId: '', schoolName: '' }));
                          setIsSchoolDropdownOpen(true);
                          schoolInputRef.current?.focus();
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded"
                      >
                        <X size={13} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsSchoolDropdownOpen((p) => !p)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded"
                    >
                      <ChevronDown
                        size={14}
                        className={`transition-transform ${isSchoolDropdownOpen ? 'rotate-180 text-cqTeal-600' : ''}`}
                      />
                    </button>
                  </div>
                </div>

                {isSchoolDropdownOpen && (
                  <div className="absolute z-30 left-0 right-0 mt-1 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-50">
                    {filteredSchools.length > 0 ? (
                      filteredSchools.map((s) => {
                        const selected = staffForm.schoolId === s.schoolId;
                        return (
                          <button
                            key={s.schoolId || s.name}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectSchool(s);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 hover:bg-teal-50/70 flex items-center justify-between gap-2 ${
                              selected ? 'bg-cqTeal-50/80' : ''
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">{s.name}</p>
                              <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                <MapPin size={10} />
                                <span>{[s.city, s.region].filter(Boolean).join(', ')}</span>
                              </p>
                            </div>
                            {selected && <Check size={15} className="text-cqTeal-600 shrink-0" />}
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-3.5 text-center space-y-1">
                        <p className="text-xs font-semibold text-slate-700">Institution not registered yet</p>
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setInstForm((prev) => ({ ...prev, schoolName: schoolQuery }));
                            setMode('institution');
                            setIsSchoolDropdownOpen(false);
                          }}
                          className="text-xs font-bold text-cqTeal-700 hover:underline"
                        >
                          Register &ldquo;{schoolQuery}&rdquo; as a new institution →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Institution Authorization Key */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center justify-between">
                  <span>Institution Authorization Key *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Issued by School Admin</span>
                </label>
                <div className="relative">
                  <KeyRound size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-cqTeal-600" />
                  <input
                    type="text"
                    name="authorizationKey"
                    value={staffForm.authorizationKey}
                    onChange={handleStaffChange}
                    placeholder="e.g. CQ-ACH-8F3K92 (or GES-SHS-2026 for seeded schools)"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono uppercase text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Desk Role
                  </label>
                  <select
                    name="role"
                    value={staffForm.role}
                    onChange={handleStaffChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  >
                    {SYSTEM_ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400">
                    If your School Admin pre-assigned a role to your Staff ID, that role overrides this automatically.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Department / Unit
                  </label>
                  <select
                    name="department"
                    value={staffForm.department}
                    onChange={handleStaffChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 3: PASSWORD */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm">
                <Lock size={16} className="text-cqTeal-600" />
                <span>3. Account Security Password</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Password (min. 8 chars, 1 letter) *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={staffForm.password}
                      onChange={handleStaffChange}
                      placeholder="At least 8 characters"
                      className="w-full px-3 py-2.5 pr-9 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Confirm Password *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={staffForm.confirmPassword}
                    onChange={handleStaffChange}
                    placeholder="Re-enter password"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-cqNavy-950 hover:bg-cqNavy-900 disabled:opacity-60 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Verifying & Creating Account...' : 'Complete Staff Onboarding'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* ============================================================
            TAB 2: REGISTER BRAND-NEW INSTITUTION
           ============================================================ */}
        {mode === 'institution' && (
          <form onSubmit={handleInstitutionSubmit} className="space-y-6 text-xs">
            {/* SECTION 1: INSTITUTION DETAILS */}
            <div className="space-y-3.5 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm">
                <Building2 size={16} className="text-cqTeal-600" />
                <span>1. Institution Profile</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Official Institution Name *
                  </label>
                  <input
                    type="text"
                    name="schoolName"
                    value={instForm.schoolName}
                    onChange={handleInstChange}
                    placeholder="e.g. Presbyterian Boys' Secondary School"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Short Name / Code
                  </label>
                  <input
                    type="text"
                    name="shortName"
                    value={instForm.shortName}
                    onChange={handleInstChange}
                    placeholder="e.g. PRESEC"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={instForm.category}
                    onChange={handleInstChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  >
                    <option value="Senior High School">Senior High School</option>
                    <option value="Technical Institute">Technical Institute</option>
                    <option value="Tertiary Institution">Tertiary Institution</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Region *
                  </label>
                  <select
                    name="region"
                    value={instForm.region}
                    onChange={handleInstChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  >
                    {GHANA_REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={instForm.city}
                    onChange={handleInstChange}
                    placeholder="e.g. Legon, Accra"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: PRIMARY SCHOOL ADMINISTRATOR */}
            <div className="space-y-3.5 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm">
                <Shield size={16} className="text-cqTeal-600" />
                <span>2. Primary School Administrator (Head of Institution)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Administrator Full Name *
                  </label>
                  <input
                    type="text"
                    name="adminFullName"
                    value={instForm.adminFullName}
                    onChange={handleInstChange}
                    placeholder="e.g. Dr. Samuel Osei"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Administrator Staff ID *
                  </label>
                  <input
                    type="text"
                    name="adminStaffId"
                    value={instForm.adminStaffId}
                    onChange={handleInstChange}
                    placeholder="e.g. PRESEC-ADM-01"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono uppercase text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Official Email Address *
                  </label>
                  <input
                    type="email"
                    name="adminEmail"
                    value={instForm.adminEmail}
                    onChange={handleInstChange}
                    placeholder="head@school.edu.gh"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Official Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="adminPhone"
                    value={instForm.adminPhone}
                    onChange={handleInstChange}
                    placeholder="+233 24 000 1122"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Designation
                </label>
                <select
                  name="adminDesignation"
                  value={instForm.adminDesignation}
                  onChange={handleInstChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                >
                  {STAFF_DESIGNATIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* SECTION 3: PASSWORD */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm">
                <Lock size={16} className="text-cqTeal-600" />
                <span>3. Administrator Password</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Password (min. 8 chars, 1 letter) *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={instForm.password}
                      onChange={handleInstChange}
                      placeholder="At least 8 characters"
                      className="w-full px-3 py-2.5 pr-9 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Confirm Password *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={instForm.confirmPassword}
                    onChange={handleInstChange}
                    placeholder="Re-enter password"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                    required
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-cqTeal-50/70 border border-cqTeal-200/80 text-[11px] text-cqNavy-900 flex items-start gap-2">
                <KeyRound size={15} className="text-cqTeal-700 shrink-0 mt-0.5" />
                <span>
                  Upon registration, CitizenQueue will automatically generate your school&apos;s unique{' '}
                  <strong>Institution Authorization Key</strong> and take you to the{' '}
                  <strong>Staff &amp; Role Management</strong> desk to assign roles by Staff ID.
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-cqNavy-950 hover:bg-cqNavy-900 disabled:opacity-60 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Registering Institution...' : 'Register Institution & Generate Key'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* Footer Links */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>Already have a staff account?</span>
          <Link
            to="/login"
            className="font-bold text-cqNavy-950 hover:text-cqTeal-700 underline inline-flex items-center gap-1"
          >
            <span>Sign In to School Staff Desk</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
