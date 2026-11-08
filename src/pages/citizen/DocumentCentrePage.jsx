/**
 * CitizenQueue - Document Centre
 * 
 * Route: `/documents`
 * 
 * Central hub for uploading mandatory admission documents, tracking desk review
 * statuses, inspecting administrator feedback, and fixing flagged submissions.
 */

import React, { useState, useEffect } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { AdmissionService } from '../../services/admissionService';
import StageNavigation from '../../components/common/StageNavigation';

export default function DocumentCentrePage() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewModalDoc, setPreviewModalDoc] = useState(null);
  const [feedbackToast, setFeedbackToast] = useState('');
  const [fileError, setFileError] = useState('');

  const loadDocuments = () => {
    setDocuments(AdmissionService.getDocuments());
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const showToast = (msg) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(''), 3000);
  };

  // Open upload dialog for a specific document
  const handleStartUpload = (doc) => {
    setSelectedDoc(doc);
    setUploadProgress(0);
    setFileError('');
  };

  // Simulated client upload with validation
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedDoc) return;

    // 1. File Type Validation
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFileError('Unsupported file type. Please upload a PDF or Image (JPG, PNG).');
      return;
    }

    // 2. File Size Validation (Max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError('File size exceeds 5MB limit. Please compress or choose a smaller file.');
      return;
    }

    // 3. Simulated progress
    setIsUploading(true);
    setFileError('');
    setUploadProgress(20);

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;

      setTimeout(() => setUploadProgress(60), 200);
      setTimeout(() => {
        setUploadProgress(100);
        setTimeout(() => {
          AdmissionService.uploadDocument(selectedDoc.id, {
            fileName: file.name,
            fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            fileUrl: dataUrl
          });
          loadDocuments();
          setIsUploading(false);
          setSelectedDoc(null);
          showToast(`"${selectedDoc.name}" submitted successfully for desk verification!`);
        }, 300);
      }, 500);
    };
    reader.readAsDataURL(file);
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
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-cqNavy-950 to-cqNavy-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cqTeal-300 bg-cqNavy-800/80 px-2.5 py-1 rounded-full border border-cqNavy-700">
            <FileText size={12} />
            <span>Digital Admission Records</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Document Centre
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Upload required slips and certificates for preliminary administrative screening. Ensure files are legible to avoid reporting day delays.
          </p>
        </div>

        {/* Overview Stats pill */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-cqNavy-900/90 border border-cqNavy-700 p-3 sm:p-4 rounded-2xl shrink-0 text-center">
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

      {/* Verification Distinction Disclaimer */}
      <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 text-xs text-teal-900 flex items-start gap-3 shadow-xs">
        <ShieldCheck size={18} className="text-teal-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-teal-950">Preliminary Online Submission Notice</p>
          <p className="text-teal-800 leading-relaxed">
            Online document submission facilitates administrative screening before your physical reporting date. You must still bring <strong>original hard copies</strong> of your BECE slip, Placement Slip, and Birth Certificate when physically attending your appointment.
          </p>
        </div>
      </div>

      {/* Documents Grid / List */}
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
                      {doc.required && (
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
                      onClick={() => handleStartUpload(doc)}
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

      {/* Upload Dialog Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Upload size={18} className="text-cqTeal-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Upload Document
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <h4 className="text-sm font-bold text-cqNavy-950">{selectedDoc.name}</h4>
              <p className="text-xs text-slate-500 mt-1">{selectedDoc.description}</p>
            </div>

            {fileError && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs flex items-center gap-2 border border-rose-200">
                <AlertCircle size={14} className="shrink-0" />
                <span>{fileError}</span>
              </div>
            )}

            {/* Drop / Select zone */}
            {isUploading ? (
              <div className="p-8 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-200">
                <RefreshCw size={24} className="text-cqTeal-600 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-800">
                  Encrypting & Simulating Secure Client Upload...
                </p>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-cqTeal-600 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">{uploadProgress}% complete</p>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-300 hover:border-cqTeal-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50">
                <Upload size={30} className="text-cqTeal-600 mb-2" />
                <p className="text-sm font-bold text-slate-800">Click to browse or drop file</p>
                <p className="text-xs text-slate-400 mt-1">
                  Supported formats: PDF, JPG, PNG (Max 5MB)
                </p>
                <input
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                disabled={isUploading}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
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
