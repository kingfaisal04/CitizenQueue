/**
 * CitizenQueue - Admission Profile & Placement Information
 * 
 * Route: `/profile`
 * 
 * Allows students and guardians to manage their bio-data, guardian contacts,
 * residential preference, and placement slip demo upload.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  School,
  FileText,
  CheckCircle2,
  AlertCircle,
  Save,
  Upload,
  Trash2,
  Shield,
  ArrowRight,
  Phone,
  Mail,
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import { AdmissionService } from '../../services/admissionService';
import StageNavigation from '../../components/common/StageNavigation';

export default function AdmissionProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => AdmissionService.getCachedProfile());
  const [formData, setFormData] = useState(() => AdmissionService.getCachedProfile());
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [placementFilePreview, setPlacementFilePreview] = useState(() => AdmissionService.getCachedProfile().placementSlipFileName || null);

  useEffect(() => {
    let isMounted = true;
    AdmissionService.getProfile().then((p) => {
      if (isMounted && p) {
        setProfile(p);
        setFormData(p);
        if (p.placementSlipFileName) {
          setPlacementFilePreview(p.placementSlipFileName);
        }
      }
    });
    return () => { isMounted = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setIsSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await AdmissionService.updateProfile({
        ...formData,
        placementSlipUploaded: Boolean(placementFilePreview),
        placementSlipFileName: placementFilePreview
      });
      if (updated) {
        setProfile(updated);
        setFormData(updated);
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Real file upload for sample placement slip
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPlacementFilePreview(file.name);
      try {
        await AdmissionService.uploadDocument('doc-1', file);
      } catch (err) {
        console.warn('Placement upload note:', err);
      }
      setFormData((prev) => ({
        ...prev,
        placementSlipUploaded: true,
        placementSlipFileName: file.name
      }));
      setIsSaved(false);
    }
  };

  const handleRemoveFile = () => {
    setPlacementFilePreview(null);
    setFormData((prev) => ({
      ...prev,
      placementSlipUploaded: false,
      placementSlipFileName: null
    }));
    setIsSaved(false);
  };

  // Calculate completeness percentage
  const requiredFields = [
    formData.fullName,
    formData.beceIndexNumber,
    formData.phone,
    formData.email,
    formData.dateOfBirth,
    formData.gender,
    formData.assignedSchool,
    formData.programme,
    formData.residentialStatus,
    formData.guardianName,
    formData.guardianPhone
  ];
  const filledCount = requiredFields.filter((f) => f && f.toString().trim().length > 0).length;
  const completionPercentage = Math.round((filledCount / requiredFields.length) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8 animate-fade-in">
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-cqNavy-950 to-cqNavy-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cqTeal-300 bg-cqNavy-800/80 px-2.5 py-1 rounded-full border border-cqNavy-700">
            <School size={12} />
            <span>Senior High School Admission Profile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Student & Admission Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Confirm your placement details, verify bio-data, and register primary guardian contacts for school reporting.
          </p>
        </div>

        {/* Profile Completion Card */}
        <div className="bg-cqNavy-900/90 border border-cqNavy-700 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shrink-0">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-cqNavy-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-cqTeal-400 transition-all duration-700"
                strokeDasharray={`${completionPercentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xs font-black text-white">{completionPercentage}%</span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Profile Status</p>
            <p className="text-sm font-bold text-white">
              {completionPercentage === 100 ? 'Fully Completed' : 'Details Pending'}
            </p>
            <p className="text-[11px] text-cqTeal-300">
              {filledCount} of {requiredFields.length} core fields ready
            </p>
          </div>
        </div>
      </div>

      {/* Official Admission & CSSPS Pre-Screening Notice */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
        <AlertCircle size={18} className="text-cqTeal-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-900">Ghana Education Service (GES) Compliance Notice</p>
          <p className="text-slate-600 leading-relaxed">
            CitizenQueue coordinates administrative workflows <strong>after</strong> placement. CSSPS manages initial student school placement. Please ensure all bio-data entered matches your official BECE certificate and placement documentation.
          </p>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Assigned School & Placement (CSSPS Context) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cqNavy-50 text-cqNavy-900 flex items-center justify-center shrink-0">
                <School size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-cqNavy-950">Assigned School & Placement Data</h2>
                <p className="text-xs text-slate-500">Placement details received from CSSPS for the 2026 Academic Cycle</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto shrink-0">
              Placement Confirmed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Assigned Senior High School</label>
              <input
                type="text"
                name="assignedSchool"
                value={formData.assignedSchool || ''}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Enrolled Academic Programme</label>
              <select
                name="programme"
                value={formData.programme || 'General Science'}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
              >
                <option value="General Science">General Science</option>
                <option value="General Arts">General Arts</option>
                <option value="Business">Business</option>
                <option value="Visual Arts">Visual Arts</option>
                <option value="Home Economics">Home Economics</option>
                <option value="Agricultural Science">Agricultural Science</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Residential Status</label>
              <select
                name="residentialStatus"
                value={formData.residentialStatus || 'Boarding'}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
              >
                <option value="Boarding">Boarding Student</option>
                <option value="Day">Day Student</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">BECE Raw Aggregate Score</label>
              <input
                type="text"
                name="aggregateScore"
                value={formData.aggregateScore || ''}
                onChange={handleChange}
                placeholder="e.g. 08"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Junior High School (JHS) Attended</label>
              <input
                type="text"
                name="juniorHighSchool"
                value={formData.juniorHighSchool || ''}
                onChange={handleChange}
                placeholder="e.g. St. Theresa's Basic School"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">CSSPS Placement Batch</label>
              <input
                type="text"
                name="placementBatch"
                value={formData.placementBatch || 'CSSPS 2026 Batch A'}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-700"
              />
            </div>
          </div>

          {/* Official CSSPS Placement Slip Upload (Responsive & Mobile-Structured) */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
            {/* Header + Action Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cqTeal-50 border border-cqTeal-200/70 text-cqTeal-700 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 shadow-2xs">
                  <FileText className="w-5 h-5 text-cqTeal-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs sm:text-sm font-bold text-slate-900">
                      Official CSSPS Placement Slip
                    </p>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cqTeal-700 bg-cqTeal-50 border border-cqTeal-200/70 px-2 py-0.5 rounded-md">
                      PDF or Scan
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                    Upload your digital PDF or scanned image of the official CSSPS placement form
                  </p>
                </div>
              </div>

              {/* Upload Action Button (shown when no file is uploaded yet) */}
              {!placementFilePreview && (
                <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-xl bg-cqNavy-950 hover:bg-cqNavy-900 active:scale-[0.98] text-white text-xs font-bold cursor-pointer transition-all shadow-xs shrink-0 border border-cqNavy-850">
                  <Upload size={14} className="text-cqTeal-400" />
                  <span>Upload Placement Slip</span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* File State Display */}
            {placementFilePreview ? (
              <div className="p-3 sm:p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-cqTeal-50 border border-cqTeal-100 text-cqTeal-600 flex items-center justify-center shrink-0">
                    <FileText size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs font-bold text-slate-900 truncate"
                      title={placementFilePreview}
                    >
                      {placementFilePreview}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 shrink-0">
                        <CheckCircle2 size={10} className="text-emerald-500" />
                        Attached
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Ready for verification
                      </span>
                    </div>
                  </div>
                </div>

                {/* File Action Controls */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 w-full sm:w-auto justify-end">
                  <label className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-cqNavy-950 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors border border-slate-200">
                    <Upload size={12} className="text-slate-500" />
                    <span>Change</span>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors border border-rose-200/60"
                    title="Remove attached file"
                  >
                    <Trash2 size={12} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 bg-white/80 rounded-xl border border-dashed border-slate-200 text-slate-500 text-[11px]">
                <AlertCircle size={13} className="text-slate-400 shrink-0" />
                <span className="truncate">No file uploaded yet. Formats: PDF, JPG, PNG (Max 5MB)</span>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Student Bio-data */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-cqNavy-50 text-cqNavy-900 flex items-center justify-center">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-cqNavy-950">Student Personal Information</h2>
              <p className="text-xs text-slate-500">Official student identity data matching examination records</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Student Full Name *</label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName || ''}
                onChange={handleChange}
                placeholder="Surname, First & Other Names"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">BECE Index Number *</label>
              <input
                type="text"
                name="beceIndexNumber"
                required
                value={formData.beceIndexNumber || ''}
                onChange={handleChange}
                placeholder="e.g. 101245089"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Date of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                required
                value={formData.dateOfBirth || ''}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Gender *</label>
              <select
                name="gender"
                value={formData.gender || 'Male'}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Home Town & Region</label>
              <input
                type="text"
                name="homeTown"
                value={formData.homeTown || ''}
                onChange={handleChange}
                placeholder="e.g. Kasoa, Central Region"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Student / Candidate Direct Contact Details (Phone & Email) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cqTeal-50 text-cqTeal-700 flex items-center justify-center shrink-0">
                <Phone size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-cqNavy-950">Candidate Direct Contact & Account Recovery</h2>
                <p className="text-xs text-slate-500">Your direct personal phone and email linked to your account for OTP verification & notices</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cqTeal-50 text-cqTeal-700 border border-cqTeal-200 self-start sm:self-auto shrink-0 flex items-center gap-1">
              <KeyRound size={12} />
              <span>OTP Linked</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Phone size={13} className="text-cqTeal-600" />
                <span>Candidate Mobile Phone Number *</span>
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone || ''}
                onChange={handleChange}
                placeholder="e.g. +233 24 123 4567 or 0241234567"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
              />
              <p className="text-[11px] text-slate-400">
                Used to receive 6-digit OTP verification codes via SMS when recovering your password.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Mail size={13} className="text-cqTeal-600" />
                <span>Candidate Personal Email Address *</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email || ''}
                onChange={handleChange}
                placeholder="e.g. student@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
              />
              <p className="text-[11px] text-slate-400">
                Used for account sign in, admission clearance updates, and email OTP password recovery.
              </p>
            </div>
          </div>

          {/* Account Security Notice */}
          <div className="p-3.5 bg-cqTeal-50/50 rounded-2xl border border-cqTeal-100 flex items-start gap-2.5 text-xs text-cqNavy-900">
            <ShieldCheck size={16} className="text-cqTeal-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Account Recovery Integration:</strong> When you click <em>"Forgot Password"</em> on the sign-in page, you can enter either this phone number or email address to receive your instant 6-digit confirmation OTP.
            </p>
          </div>
        </div>

        {/* Section 4: Parent / Guardian Details */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-cqNavy-50 text-cqNavy-900 flex items-center justify-center">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-cqNavy-950">Parent or Guardian Information</h2>
              <p className="text-xs text-slate-500">Designated contact person responsible for student reporting and emergency notices</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Guardian Full Name *</label>
              <input
                type="text"
                name="guardianName"
                required
                value={formData.guardianName || ''}
                onChange={handleChange}
                placeholder="e.g. Kwame Mensah"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Relationship to Student</label>
              <input
                type="text"
                name="guardianRelation"
                value={formData.guardianRelation || 'Father'}
                onChange={handleChange}
                placeholder="e.g. Mother, Father, Uncle, Guardian"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Guardian Telephone Number * (Mandatory)</label>
              <input
                type="tel"
                name="guardianPhone"
                required
                value={formData.guardianPhone || ''}
                onChange={handleChange}
                placeholder="e.g. +233 24 411 2233"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Guardian Email Address (Optional)</label>
              <input
                type="email"
                name="guardianEmail"
                value={formData.guardianEmail || ''}
                onChange={handleChange}
                placeholder="e.g. kwame.mensah@example.com (optional)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
              />
            </div>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500">
            {isSaved ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold">
                <CheckCircle2 size={16} />
                Profile changes saved and synchronized with school registry!
              </span>
            ) : (
              <span>Save your profile to update your school records.</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-cqNavy-950 hover:bg-cqNavy-900 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              <Save size={15} />
              <span>Save Admission Profile</span>
            </button>
          </div>
        </div>
      </form>

      {/* Stage Navigation: Back to Dashboard, Next to Digital Prospectus */}
      <StageNavigation
        prevHref="/dashboard"
        prevLabel="Back to Dashboard"
        nextHref="/prospectus"
        nextLabel="Proceed to Digital Prospectus"
        currentStage="Stage 2 of 9"
        stageTitle="Student Bio-Data & Placement Verification"
      />
    </div>
  );
}
