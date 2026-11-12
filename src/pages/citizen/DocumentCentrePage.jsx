/**
 * CitizenQueue - Document Centre
 * 
 * Route: `/documents`
 * 
 * Central hub for uploading mandatory admission documents, tracking desk review
 * statuses, inspecting administrator feedback, and fixing flagged submissions.
 */

import React, { useState } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Trash2,
  ShieldCheck,
  Sparkles,
  X,
  FileCheck2,
  AlertTriangle,
  RefreshCw,
  Plus,
  FilePlus,
  Check
} from 'lucide-react';
import { AdmissionService } from '../../services/admissionService';
import StageNavigation from '../../components/common/StageNavigation';

const DOCUMENT_CATEGORIES = [
  'Placement & Enrollment',
  'Academic Records',
  'Identity & Bio-data',
  'Identification',
  'Health & Welfare',
  'Guardian Records',
  'Special Clearances'
];

export default function DocumentCentrePage() {
  const [documents, setDocuments] = useState(() => AdmissionService.getDocuments());
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState('existing'); // 'existing' | 'custom'
  const [targetDocId, setTargetDocId] = useState('');
  const [customDocName, setCustomDocName] = useState('');
  const [customDocCategory, setCustomDocCategory] = useState('Academic Records');
  const [customDocDesc, setCustomDocDesc] = useState('');
  
  // Staged File State
  const [stagedFile, setStagedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState('');

  // Previews & Feedback
  const [previewModalDoc, setPreviewModalDoc] = useState(null);
  const [feedbackToast, setFeedbackToast] = useState('');

  const loadDocuments = () => {
    setDocuments(AdmissionService.getDocuments());
  };

  const showToast = (msg) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(''), 3500);
  };

  // Open upload modal (either for a specific card or globally)
  const handleOpenUploadModal = (doc = null) => {
    setFileError('');
    setUploadProgress(0);
    setIsUploading(false);
    setStagedFile(null);

    if (doc) {
      setUploadMode('existing');
      setTargetDocId(doc.id);
    } else {
      setUploadMode('existing');
      // Default to first doc awaiting upload or first in list
      const firstAwaiting = documents.find((d) => d.status === 'not_submitted' || d.status === 'changes_required');
      setTargetDocId(firstAwaiting ? firstAwaiting.id : (documents[0]?.id || ''));
      setCustomDocName('');
      setCustomDocDesc('');
    }

    setIsUploadModalOpen(true);
  };

  // Handle file selection & validation
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. File Type Validation
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFileError('Unsupported file type. Please upload a PDF or Image (JPG, PNG, WEBP).');
      return;
    }

    // 2. File Size Validation (Max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError('File size exceeds 5MB limit. Please compress or choose a smaller file.');
      return;
    }

    setFileError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setStagedFile({
        name: file.name,
        sizeFormatted: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        dataUrl: reader.result,
        type: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  // Execute upload submission
  const handleConfirmUpload = (e) => {
    e.preventDefault();
    if (!stagedFile) {
      setFileError('Please select a file to upload before submitting.');
      return;
    }

    if (uploadMode === 'custom' && !customDocName.trim()) {
      setFileError('Please provide a name for this document requirement.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(25);

    setTimeout(() => {
      setUploadProgress(65);
      setTimeout(() => {
        setUploadProgress(100);
        setTimeout(() => {
          if (uploadMode === 'existing') {
            const targetDoc = documents.find((d) => d.id === targetDocId);
            AdmissionService.uploadDocument(targetDocId, {
              fileName: stagedFile.name,
              fileSize: stagedFile.sizeFormatted,
              fileUrl: stagedFile.dataUrl
            });
            showToast(`"${targetDoc?.name || 'Document'}" submitted successfully for desk verification!`);
          } else {
            AdmissionService.addDocumentRequirement({
              name: customDocName.trim(),
              category: customDocCategory,
              description: customDocDesc.trim() || 'Additional candidate document submission.',
              required: false,
              fileName: stagedFile.name,
              fileSize: stagedFile.sizeFormatted,
              fileUrl: stagedFile.dataUrl,
              status: 'submitted'
            });
            showToast(`New document "${customDocName.trim()}" uploaded and submitted!`);
          }

          loadDocuments();
          setIsUploading(false);
          setIsUploadModalOpen(false);
          setStagedFile(null);
        }, 300);
      }, 400);
    }, 300);
  };

  // Remove document
  const handleRemove = (docId, docName) => {
    AdmissionService.removeDocument(docId);
    loadDocuments();
    showToast(`Removed submission for ${docName}`);
  };

  // Metrics
  const totalCount = documents.length;
  const acceptedCount = documents.filter((d) => d.status === 'provisionally_accepted').length;
  const pendingCount = documents.filter((d) => d.status === 'submitted' || d.status === 'under_review').length;
  const changesCount = documents.filter((d) => d.status === 'changes_required').length;
  const notSubmittedCount = documents.filter((d) => d.status === 'not_submitted').length;
  const uploadedCount = totalCount - notSubmittedCount;

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'provisionally_accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 size={13} />
            Provisionally Accepted
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
            <Clock size={13} />
            Under Review
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <FileCheck2 size={13} />
            Submitted
          </span>
        );
      case 'changes_required':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertCircle size={13} />
            Changes Required
          </span>
        );
      case 'not_submitted':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Not Submitted
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8 animate-fade-in">
      
      {/* 1. Header Hero Banner with Prominent "Upload / Add Document" Button */}
      <div className="bg-gradient-to-r from-cqNavy-950 via-cqNavy-900 to-cqNavy-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md border border-cqNavy-800">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cqTeal-300 bg-cqNavy-800/80 px-2.5 py-1 rounded-full border border-cqNavy-700">
            <FileText size={12} />
            <span>Digital Admission Records</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Document Centre
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Upload required placement slips and certificates for preliminary administrative screening. Ensure files are clear to prevent reporting day delays.
          </p>

          {/* Primary Upload / Add Document Action Button */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => handleOpenUploadModal()}
              className="px-5 py-2.5 rounded-xl bg-cqTeal-500 hover:bg-cqTeal-400 text-cqNavy-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <Upload size={16} />
              <span>Upload / Add Document</span>
            </button>
            <span className="text-xs text-slate-300 font-medium">
              {uploadedCount} of {totalCount} credentials submitted
            </span>
          </div>
        </div>

        {/* Overview Stats pill */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-cqNavy-900/90 border border-cqNavy-700 p-3 sm:p-4 rounded-2xl shrink-0 text-center shadow-inner">
          <div>
            <p className="text-base sm:text-xl font-black text-emerald-400">{acceptedCount}</p>
            <p className="text-[10px] text-slate-400">Accepted</p>
          </div>
          <div className="border-x border-cqNavy-800 px-2 sm:px-3">
            <p className="text-base sm:text-xl font-black text-amber-300">{pendingCount}</p>
            <p className="text-[10px] text-slate-400">In Review</p>
          </div>
          <div>
            <p className="text-base sm:text-xl font-black text-rose-400">{changesCount}</p>
            <p className="text-[10px] text-slate-400">Corrections</p>
          </div>
        </div>
      </div>

      {/* 2. Verification Distinction Disclaimer */}
      <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 text-xs text-teal-900 flex items-start gap-3 shadow-xs">
        <ShieldCheck size={18} className="text-teal-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-teal-950">Preliminary Online Submission Notice</p>
          <p className="text-teal-800 leading-relaxed">
            Online document submission facilitates administrative screening before your physical reporting date. You must still bring <strong>original hard copies</strong> of your BECE slip, Placement Slip, and Birth Certificate when physically attending your appointment.
          </p>
        </div>
      </div>

      {/* 3. Section Header & Quick Add Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Admission Documents Checklist</span>
            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {totalCount} Total
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {acceptedCount} certified • {pendingCount} awaiting desk review • {changesCount} need correction
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenUploadModal()}
          className="px-4 py-2 rounded-xl bg-cqNavy-950 hover:bg-cqNavy-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
        >
          <Plus size={14} className="text-cqTeal-400" />
          <span>Upload / Add Document</span>
        </button>
      </div>

      {/* 4. Documents Grid / List */}
      <div className="space-y-4">
        {documents.map((doc) => {
          return (
            <div
              key={doc.id}
              className={`bg-white rounded-3xl border transition-all p-6 shadow-xs ${
                doc.status === 'changes_required'
                  ? 'border-rose-200 bg-rose-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                
                {/* Left: Doc Details */}
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    doc.status === 'provisionally_accepted'
                      ? 'bg-emerald-100 text-emerald-700'
                      : doc.status === 'changes_required'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-cqNavy-50 text-cqNavy-900'
                  }`}>
                    <FileText size={22} />
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{doc.name}</h3>
                      {doc.required !== false && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          Mandatory
                        </span>
                      )}
                      <span className="text-xs text-slate-500 font-medium">{doc.category}</span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {doc.description}
                    </p>

                    {/* File Attachment & Metadata */}
                    {doc.fileName && (
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
                        <span className="font-mono text-slate-700 font-semibold truncate max-w-xs">
                          {doc.fileName}
                        </span>
                        {doc.fileSize && <span>({doc.fileSize})</span>}
                        {doc.uploadedAt && (
                          <span>• Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    )}

                    {/* Feedback message banner if corrections required or approved */}
                    {doc.adminFeedback && (
                      <div className={`mt-2 p-3 rounded-xl text-xs flex items-start gap-2 ${
                        doc.status === 'changes_required'
                          ? 'bg-rose-50 text-rose-900 border border-rose-200'
                          : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}>
                        <AlertTriangle size={15} className={`shrink-0 mt-0.5 ${
                          doc.status === 'changes_required' ? 'text-rose-600' : 'text-slate-500'
                        }`} />
                        <div>
                          <strong className="font-bold">Desk Review Note: </strong>
                          <span>{doc.adminFeedback}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Status & Actions */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-3 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
                  <div>
                    {renderStatusBadge(doc.status)}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View Preview Button */}
                    {doc.fileUrl && (
                      <button
                        type="button"
                        onClick={() => setPreviewModalDoc(doc)}
                        className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs font-semibold"
                        title="Preview uploaded document"
                      >
                        <Eye size={14} />
                        <span className="hidden sm:inline">Preview</span>
                      </button>
                    )}

                    {/* Remove button */}
                    {doc.status !== 'not_submitted' && doc.status !== 'provisionally_accepted' && (
                      <button
                        type="button"
                        onClick={() => handleRemove(doc.id, doc.name)}
                        className="p-2 rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 transition-colors text-xs"
                        title="Remove document"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}

                    {/* Upload / Replace button */}
                    <button
                      type="button"
                      onClick={() => handleOpenUploadModal(doc)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                        doc.status === 'changes_required'
                          ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                          : doc.status === 'not_submitted'
                          ? 'bg-cqNavy-950 hover:bg-cqNavy-900 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      <Upload size={13} />
                      <span>{doc.status === 'not_submitted' ? 'Upload Document' : 'Replace File'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stage Navigation: Back to Prospectus, Next to Progress Tracker */}
      <StageNavigation
        prevHref="/prospectus"
        prevLabel="Back to Digital Prospectus"
        nextHref="/progress"
        nextLabel="Proceed to Progress Tracker"
        currentStage="Stage 4 of 9"
        stageTitle="Admission Documents Submission"
      />

      {/* =====================================================================
          UPLOAD & ADD DOCUMENT MODAL
          ===================================================================== */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 border border-slate-200 space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cqNavy-50 text-cqNavy-900 flex items-center justify-center">
                  <Upload size={18} className="text-cqTeal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Upload Admission Document
                  </h3>
                  <p className="text-[11px] text-slate-500">Official Student Intake Verification Desk</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                disabled={isUploading}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setUploadMode('existing')}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  uploadMode === 'existing'
                    ? 'bg-white text-cqNavy-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText size={14} />
                <span>Required Checklist</span>
              </button>

              <button
                type="button"
                onClick={() => setUploadMode('custom')}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  uploadMode === 'custom'
                    ? 'bg-white text-cqNavy-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FilePlus size={14} />
                <span>Add Extra Document</span>
              </button>
            </div>

            <form onSubmit={handleConfirmUpload} className="space-y-4">
              
              {/* Mode 1: Choose from existing checklist */}
              {uploadMode === 'existing' ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Select Document to Upload For *
                  </label>
                  <select
                    value={targetDocId}
                    onChange={(e) => setTargetDocId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500 cursor-pointer"
                  >
                    {documents.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} {d.status === 'not_submitted' ? '• (Awaiting Upload)' : d.status === 'changes_required' ? '• (Correction Needed)' : '• (Uploaded)'}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                /* Mode 2: Add custom document requirement */
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Document Title *</label>
                    <input
                      type="text"
                      required
                      value={customDocName}
                      onChange={(e) => setCustomDocName(e.target.value)}
                      placeholder="e.g., Baptismal Certificate, Recommendation Letter, Medical Exemption..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Category</label>
                    <select
                      value={customDocCategory}
                      onChange={(e) => setCustomDocCategory(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500 cursor-pointer"
                    >
                      {DOCUMENT_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Description (Optional)</label>
                    <input
                      type="text"
                      value={customDocDesc}
                      onChange={(e) => setCustomDocDesc(e.target.value)}
                      placeholder="Brief note on what this document certifies..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                    />
                  </div>
                </div>
              )}

              {/* Error Notice */}
              {fileError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs flex items-center gap-2 border border-rose-200">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{fileError}</span>
                </div>
              )}

              {/* File Dropzone / Staged File Display */}
              {isUploading ? (
                <div className="p-6 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <RefreshCw size={24} className="text-cqTeal-600 animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-800">
                    Encrypting & Uploading Document...
                  </p>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-cqTeal-600 h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">{uploadProgress}% complete</p>
                </div>
              ) : stagedFile ? (
                <div className="p-4 bg-cqNavy-50/70 rounded-2xl border border-cqNavy-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-10 h-10 rounded-xl bg-cqNavy-900 text-cqTeal-400 flex items-center justify-center shrink-0">
                      <FileCheck2 size={20} />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 truncate">{stagedFile.name}</p>
                      <p className="text-[11px] text-slate-500">{stagedFile.sizeFormatted} • Ready to upload</p>
                    </div>
                  </div>

                  <label className="text-xs font-bold text-cqTeal-700 hover:text-cqTeal-800 cursor-pointer shrink-0 underline underline-offset-2">
                    Change
                    <input
                      type="file"
                      accept=".pdf,image/png,image/jpeg,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 hover:border-cqTeal-500 rounded-2xl p-7 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50 group">
                  <div className="w-12 h-12 rounded-2xl bg-white text-cqTeal-600 flex items-center justify-center shadow-xs border border-slate-200 mb-2 group-hover:scale-105 transition-transform">
                    <Upload size={22} />
                  </div>
                  <p className="text-sm font-bold text-slate-900">Click to browse or drop file</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports PDF, JPG, PNG, WEBP (Max 5MB)
                  </p>
                  <input
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  disabled={isUploading}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isUploading || !stagedFile}
                  className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 ${
                    isUploading || !stagedFile
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-cqNavy-950 hover:bg-cqNavy-900 active:scale-95'
                  }`}
                >
                  <Check size={14} />
                  <span>{uploadMode === 'custom' ? 'Add & Upload Document' : 'Confirm & Upload'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{previewModalDoc.name}</h3>
                <p className="text-xs text-slate-500 font-mono">{previewModalDoc.fileName}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalDoc(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-slate-100 rounded-2xl p-3 flex items-center justify-center min-h-[300px]">
              {previewModalDoc.fileUrl ? (
                <img
                  src={previewModalDoc.fileUrl}
                  alt={previewModalDoc.name}
                  className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-xs"
                />
              ) : (
                <div className="text-center space-y-2 p-8 text-slate-500">
                  <FileText size={48} className="mx-auto text-slate-400" />
                  <p className="text-sm font-semibold">Digital PDF Preview Available</p>
                  <p className="text-xs text-slate-400">File is encrypted and securely staged for administrative review.</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Status: <strong className="text-slate-800">{previewModalDoc.status}</strong>
              </span>
              <button
                type="button"
                onClick={() => setPreviewModalDoc(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-cqNavy-950 rounded-xl hover:bg-cqNavy-900"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating feedback toast */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-cqNavy-950 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-cqNavy-800 flex items-center gap-2 animate-fade-in">
          <Sparkles size={14} className="text-cqTeal-400" />
          <span>{feedbackToast}</span>
        </div>
      )}
    </div>
  );
}
