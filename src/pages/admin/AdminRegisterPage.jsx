/**
 * CitizenQueue - Institutional Administrative Staff Registration & Onboarding
 * 
 * Route: `/admin/register` (and `/staff/register`)
 * 
 * Allows first-time school heads, admissions officers, and boarding housemasters
 * to register their staff profile, configure their assigned Senior High School,
 * specify their administrative role, and access the Admissions Command Desk.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  School,
  User,
  Shield,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  Building2,
  BadgeCheck,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const GHANA_SHS_SCHOOLS = [
  'Achimota Senior High School',
  'Prempeh College',
  'Presbyterian Boys\' Secondary School (PRESEC Legon)',
  'Wesley Girls\' High School',
  'Mfantsipim School',
  'Opoku Ware School',
  'Holy Child School',
  'St. Augustine\'s College',
  'Aburi Girls\' Senior High School',
  'Kumasi High School',
  'Accra Academy',
  'Tamale Senior High School'
];

const STAFF_ROLES = [
  'Admissions & Placement Officer',
  'Senior Housemaster / Senior Housemistress',
  'Housemaster / Housemistress (Dormitory Affairs)',
  'Academic Registrar / Assistant Head (Academics)',
  'Document Verification Officer',
  'Head of Institution (Principal / Headmaster)'
];

const DEPARTMENTS = [
  'Admissions & Records Directorate',
  'Boarding & Housemaster Affairs',
  'Academic Affairs Division',
  'Guidance & Counselling Directorate',
  'Administration & General Operations'
];

export default function AdminRegisterPage() {
  const navigate = useNavigate();
  const { registerStaff } = useAuth();

  const [formData, setFormData] = useState({
    title: 'Mr.',
    fullName: '',
    staffId: '',
    email: '',
    phone: '',
    schoolName: 'Achimota Senior High School',
    designation: 'Admissions & Placement Officer',
    department: 'Admissions & Records Directorate',
    authorizationKey: 'GES-SHS-2026',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setFormError('');
  };

  // 1-Click Sample Staff Fill Helper
  const handleFillDemoData = () => {
    setFormData({
      title: 'Mr.',
      fullName: 'Kwame Addo',
      staffId: 'GES-482910',
      email: 'k.addo@achimota.edu.gh',
      phone: '+233 24 330 9988',
      schoolName: 'Achimota Senior High School',
      designation: 'Senior Housemaster / Senior Housemistress',
      department: 'Boarding & Housemaster Affairs',
      authorizationKey: 'GES-SHS-2026',
      password: 'staffpass2026',
      confirmPassword: 'staffpass2026'
    });
    setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!formData.fullName.trim()) {
      setFormError('Please enter your full official name.');
      return;
    }

    if (!formData.staffId.trim()) {
      setFormError('Please provide your official GES or Institutional Staff ID Number.');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFormError('Please enter a valid official or institutional email address.');
      return;
    }

    if (!formData.phone.trim()) {
      setFormError('Please enter a valid contact phone number.');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setFormError('Password must contain at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (!formData.authorizationKey.trim()) {
      setFormError('Please enter the school desk authorization key (sample: GES-SHS-2026).');
      return;
    }

    try {
      // Register staff profile & log in
      registerStaff(formData);
      setFormSuccess(true);

      setTimeout(() => {
        navigate('/admin');
      }, 700);
    } catch (err) {
      console.error('[CitizenQueue] Staff registration error:', err);
      setFormError('An error occurred creating staff profile. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center animate-fade-in">
      <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-10 space-y-7">
        
        {/* Header & Crest */}
        <div className="text-center space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-cqNavy-950 text-cqTeal-400 flex items-center justify-center mx-auto shadow-md ring-1 ring-cqNavy-800/20">
            <Shield size={24} />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-cqTeal-700 bg-cqTeal-50 border border-cqTeal-200/80 px-2.5 py-0.5 rounded-full inline-block">
              INSTITUTIONAL STAFF DESK
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-cqNavy-950 tracking-tight">
              Staff Profile Onboarding
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Create your administrative credentials to manage admission queues, review candidate records, and oversee physical reporting arrivals.
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {formSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-900 animate-fade-in">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Staff Profile Created Successfully!</p>
              <p className="text-emerald-700">Redirecting to Admissions Command Desk...</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {formError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs text-rose-800 animate-fade-in">
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          
          {/* SECTION 1: PERSONAL & STAFF IDENTIFICATION */}
          <div className="space-y-3.5 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm">
              <User size={16} className="text-cqTeal-600" />
              <span>1. Staff Bio-Data & Identification</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Title / Salutation */}
              <div className="sm:col-span-1 space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Title
                </label>
                <select
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
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

              {/* Full Name */}
              <div className="sm:col-span-3 space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Full Official Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Kwame Addo"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Staff ID */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center justify-between">
                  <span>GES / Staff ID Number *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Official Identifier</span>
                </label>
                <input
                  type="text"
                  name="staffId"
                  value={formData.staffId}
                  onChange={handleChange}
                  placeholder="e.g. GES-482910"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Official Phone Number *
                </label>
                <div className="relative">
                  <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +233 24 330 9988"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Staff Institutional Email Address *
              </label>
              <div className="relative">
                <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. k.addo@achimota.edu.gh or kwame.addo@ges.gov.gh"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: SCHOOL & ADMINISTRATIVE ROLE */}
          <div className="space-y-3.5 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm">
              <Building2 size={16} className="text-cqTeal-600" />
              <span>2. School & Administrative Designation</span>
            </div>

            {/* Assigned School */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Assigned Senior High School *
              </label>
              <div className="relative">
                <School size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleChange}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                >
                  {GHANA_SHS_SCHOOLS.map((school) => (
                    <option key={school} value={school}>
                      {school}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Designation / Role */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Administrative Role *
                </label>
                <select
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                >
                  {STAFF_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Department / Unit *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
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

          {/* SECTION 3: DESK SECURITY & AUTHORIZATION */}
          <div className="space-y-3.5 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm">
              <Lock size={16} className="text-cqTeal-600" />
              <span>3. Desk Security & Authorization Key</span>
            </div>

            {/* Authorization Key */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center justify-between">
                <span>Institutional Authorization Key *</span>
                <span className="text-[10px] text-cqTeal-700 font-mono">Sample: GES-SHS-2026</span>
              </label>
              <div className="relative">
                <KeyRound size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="authorizationKey"
                  value={formData.authorizationKey}
                  onChange={handleChange}
                  placeholder="e.g. GES-SHS-2026"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Password */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Desk Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    className="w-full px-3 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-cqNavy-950 hover:bg-cqNavy-900 text-white font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <BadgeCheck size={16} className="text-cqTeal-400" />
            <span>Complete Staff Desk Onboarding</span>
            <ArrowRight size={14} />
          </button>

          {/* 1-Click Demo Fill Button */}
          <div className="pt-1 flex items-center justify-center">
            <button
              type="button"
              onClick={handleFillDemoData}
              className="text-[11px] font-semibold text-cqTeal-700 hover:text-cqTeal-800 flex items-center gap-1.5 transition-colors p-1"
            >
              <Sparkles size={12} />
              <span>Fill sample staff details (Mr. Kwame Addo • Senior Housemaster, Achimota School)</span>
            </button>
          </div>

        </form>

        {/* Footer Navigation Links */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Already registered?{' '}
            <Link to="/login" className="font-bold text-cqNavy-950 hover:underline">
              Sign In to Staff Desk
            </Link>
          </div>
          <div>
            Are you a student/guardian?{' '}
            <Link to="/register" className="font-bold text-cqTeal-700 hover:underline">
              Candidate Registration
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
