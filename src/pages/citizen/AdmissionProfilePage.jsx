/**
 * CitizenQueue - Admission Profile & Placement Information
 * 
 * Route: `/profile`
 * 
 * Allows students and guardians to manage their bio-data, guardian contacts,
 * residential preference, and placement slip demo upload.
 */

import React, { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { AdmissionService } from '../../services/admissionService';
import StageNavigation from '../../components/common/StageNavigation';

export default function AdmissionProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => AdmissionService.getProfile());
  const [formData, setFormData] = useState(() => AdmissionService.getProfile());
  const [isSaved, setIsSaved] = useState(false);
  const [placementFilePreview, setPlacementFilePreview] = useState(() => AdmissionService.getProfile().placementSlipFileName || null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setIsSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updated = AdmissionService.updateProfile({
      ...formData,
      placementSlipUploaded: Boolean(placementFilePreview),
      placementSlipFileName: placementFilePreview
    });
    setProfile(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Simulated file upload for sample placement slip
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPlacementFilePreview(file.name);
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
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cqNavy-50 text-cqNavy-900 flex items-center justify-center">
                <School size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-cqNavy-950">Assigned School & Placement Data</h2>
                <p className="text-xs text-slate-500">Placement details received from CSSPS for the 2026 Academic Cycle</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
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

          {/* Placement Slip Upload */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Official CSSPS Placement Slip (PDF or Scan)</p>
                <p className="text-[11px] text-slate-500">Upload your PDF or scanned image of the official CSSPS placement form</p>
              </div>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cqNavy-900 text-white text-xs font-semibold cursor-pointer hover:bg-cqNavy-800 transition-colors shadow-xs">
                <Upload size={13} />
                <span>Upload Placement Slip</span>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {placementFilePreview ? (
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <FileText size={16} className="text-cqTeal-600" />
                  <span>{placementFilePreview}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold">
                    Attached
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-rose-600 hover:text-rose-800 p-1 rounded-md transition-colors"
                  title="Remove file"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">No placement file uploaded yet.</p>
            )}
          </div>
        </div>

        {/* Section 2: Student Bio-data */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
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

        {/* Section 3: Parent / Guardian Details */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
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
