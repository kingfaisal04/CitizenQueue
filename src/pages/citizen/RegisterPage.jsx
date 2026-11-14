/**
 * CitizenQueue - Authentication: Sign Up & Candidate Registration Page
 * 
 * Route: `/register` (and `/signup`)
 * 
 * Allows new students and guardians to register their admission profile,
 * specify CSSPS placement information, guardian emergency details, and
 * generate their Admission Command Centre profile with 1-click test fill support.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  School,
  User,
  Shield,
  Phone,
  Mail,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  FileCheck2,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { registerCandidate } = useAuth();

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    beceIndexNumber: '',
    assignedSchool: 'Achimota Senior High School',
    programme: 'General Science',
    residentialStatus: 'Boarding',
    aggregateScore: '08',
    juniorHighSchool: '',
    guardianName: '',
    guardianRelation: 'Father',
    guardianPhone: '',
    guardianEmail: '',
    homeTown: '',
    pin: '2026',
    confirmPin: '2026'
  });

  const [showPin, setShowPin] = useState(false);
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

  // 1-Click Fill Demo Candidate
  const handleFillDemoData = () => {
    setFormData({
      fullName: 'Emmanuel Mensah',
      beceIndexNumber: '101245089',
      assignedSchool: 'Achimota Senior High School',
      programme: 'General Science',
      residentialStatus: 'Boarding',
      aggregateScore: '08',
      juniorHighSchool: "St. Theresa's Basic School, Kaneshie",
      guardianName: 'Kwame Mensah',
      guardianRelation: 'Father',
      guardianPhone: '+233 24 411 2233',
      guardianEmail: 'kwame.mensah@example.com',
      homeTown: 'Kasoa, Central Region',
      pin: '2026',
      confirmPin: '2026'
    });
    setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!formData.fullName.trim()) {
      setFormError('Please enter the student full name.');
      return;
    }

    if (!formData.beceIndexNumber.trim() || formData.beceIndexNumber.trim().length < 8) {
      setFormError('Please enter a valid BECE Index Number (minimum 8-10 digits).');
      return;
    }

    if (!formData.guardianName.trim()) {
      setFormError('Parent or Guardian full name is required.');
      return;
    }

    if (!formData.guardianPhone.trim()) {
      setFormError('Parent or Guardian contact phone number is mandatory.');
      return;
    }

    if (formData.pin !== formData.confirmPin) {
      setFormError('Access PIN and Confirm PIN do not match.');
      return;
    }

    // Register candidate via context & admission service
    registerCandidate({
      ...formData,
      id: `std-${formData.beceIndexNumber.trim()}`
    });

    setFormSuccess(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-[85vh] py-8 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      
      {/* Top Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="w-12 h-12 bg-cqNavy-950 text-cqTeal-400 rounded-2xl flex items-center justify-center mx-auto shadow-md">
          <School size={24} />
        </div>
        <h1 className="text-3xl font-black text-cqNavy-950 tracking-tight">
          Register Admission Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Create your digital profile after receiving your CSSPS placement. Coordinate prospectus requirements, submit documents, and reserve your reporting slot.
        </p>
      </div>

      {/* Subtle evaluation autofill helper */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs px-2 text-slate-500">
        <span className="flex items-center gap-1.5 font-medium text-slate-600">
          <Shield size={14} className="text-cqTeal-600 shrink-0" />
          Official 2026 Academic Cycle Senior High School Pre-Screening
        </span>
        <button
          type="button"
          onClick={handleFillDemoData}
          className="inline-flex items-center gap-1 text-cqTeal-700 hover:text-cqTeal-800 font-semibold hover:underline self-start sm:self-auto"
        >
          <Sparkles size={13} />
          <span>Quick fill sample candidate</span>
        </button>
      </div>

      {/* Main Registration Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
              <span>Registration completed! Opening your Admission Command Centre...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Candidate Bio-data & Placement */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <School size={16} className="text-cqTeal-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  1. Candidate & Placement Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="fullName"
                    placeholder="Surname, First & Other Names"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    BECE Index Number *
                  </label>
                  <input
                    type="text"
                    required
                    name="beceIndexNumber"
                    placeholder="e.g. 101245089"
                    value={formData.beceIndexNumber}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Assigned Senior High School *
                  </label>
                  <select
                    name="assignedSchool"
                    value={formData.assignedSchool}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500 font-medium"
                  >
                    <option value="Achimota Senior High School">Achimota Senior High School</option>
                    <option value="Prempeh College">Prempeh College</option>
                    <option value="Tamale Senior High School">Tamale Senior High School</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Enrolled Academic Programme *
                  </label>
                  <select
                    name="programme"
                    value={formData.programme}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  >
                    <option value="General Science">General Science</option>
                    <option value="General Arts">General Arts</option>
                    <option value="Business">Business</option>
                    <option value="Visual Arts">Visual Arts</option>
                    <option value="Home Economics">Home Economics</option>
                    <option value="Agricultural Science">Agricultural Science</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Residential Status *
                  </label>
                  <select
                    name="residentialStatus"
                    value={formData.residentialStatus}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500 font-medium"
                  >
                    <option value="Boarding">Boarding Student</option>
                    <option value="Day">Day Student</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    BECE Raw Aggregate Score
                  </label>
                  <input
                    type="text"
                    name="aggregateScore"
                    placeholder="e.g. 08"
                    value={formData.aggregateScore}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Junior High School (JHS) Attended
                  </label>
                  <input
                    type="text"
                    name="juniorHighSchool"
                    placeholder="e.g. St. Theresa's Basic School"
                    value={formData.juniorHighSchool}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Guardian Details */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Shield size={16} className="text-cqTeal-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  2. Parent or Guardian Emergency Contacts
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Guardian Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="guardianName"
                    placeholder="e.g. Kwame Mensah"
                    value={formData.guardianName}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Relationship to Student *
                  </label>
                  <input
                    type="text"
                    name="guardianRelation"
                    placeholder="e.g. Father, Mother, Guardian"
                    value={formData.guardianRelation}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Contact Phone Number * (Mandatory)
                  </label>
                  <input
                    type="tel"
                    required
                    name="guardianPhone"
                    placeholder="e.g. +233 24 411 2233"
                    value={formData.guardianPhone}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Guardian Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    name="guardianEmail"
                    placeholder="e.g. kwame.mensah@example.com (optional)"
                    value={formData.guardianEmail}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Home Town & Region
                  </label>
                  <input
                    type="text"
                    name="homeTown"
                    placeholder="e.g. Kasoa, Central Region"
                    value={formData.homeTown}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Access Code */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Lock size={16} className="text-cqTeal-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  3. Account Access PIN
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    4-Digit Access PIN / Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      name="pin"
                      placeholder="e.g. 2026"
                      value={formData.pin}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500 pr-10 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1"
                    >
                      {showPin ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Confirm PIN
                  </label>
                  <input
                    type={showPin ? 'text' : 'password'}
                    name="confirmPin"
                    placeholder="e.g. 2026"
                    value={formData.confirmPin}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Security and Privacy Notice */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
              <Shield size={15} className="text-cqTeal-600 shrink-0 mt-0.5" />
              <span>
                <strong>Data Protection:</strong> In compliance with the Ghana Data Protection Act (Act 843), your candidate information is encrypted and accessible strictly by your placed school's authorized registry desk.
              </span>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-cqNavy-950 hover:bg-cqNavy-900 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <UserPlus size={16} />
              <span>Complete Registration!</span>
            </button>
          </form>
        </div>

        {/* Right Preview Card (4 Cols on lg) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Real-time Candidate Badge Preview */}
          <div className="bg-gradient-to-br from-cqNavy-950 to-cqNavy-900 text-white rounded-3xl p-6 border border-cqNavy-800 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cqNavy-800 text-xs">
              <span className="text-cqTeal-400 font-bold uppercase tracking-wider text-[10px]">
                Student Admission Pass
              </span>
              <span className="bg-cqNavy-800 px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono">
                CSSPS 2026
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-lg font-black text-white truncate">
                {formData.fullName || 'Candidate Full Name'}
              </p>
              <p className="text-xs text-cqTeal-300 font-mono">
                Index: {formData.beceIndexNumber || '101245089'}
              </p>
            </div>

            <div className="space-y-2 text-xs pt-2 border-t border-cqNavy-800/80">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">School:</span>
                <span className="font-semibold text-slate-200 truncate max-w-[170px] text-right">
                  {formData.assignedSchool}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Programme:</span>
                <span className="font-semibold text-slate-200">
                  {formData.programme}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Residence:</span>
                <span className="font-semibold text-cqTeal-300">
                  {formData.residentialStatus}
                </span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
              <span>Pre-arrival file will be initialized upon registration</span>
            </div>
          </div>

          {/* Already have an account card */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 text-center space-y-3 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900">
              Already Registered an Account?
            </h4>
            <p className="text-xs text-slate-500">
              If your candidate profile was already created, proceed directly to the sign-in portal.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-800 transition-colors"
            >
              <span>Sign In to Your Account</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* School Staff Registration Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1.5">
            <p className="text-xs text-slate-600">
              Are you a school administrator or housemaster?
            </p>
            <Link
              to="/admin/register"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cqNavy-950 hover:text-cqTeal-700 hover:underline"
            >
              <Shield size={13} className="text-cqTeal-600" />
              <span>Register Institutional Staff Profile</span>
              <ArrowRight size={12} />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
