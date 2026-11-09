/**
 * CitizenQueue - Institutional Document Verification Terminal
 * 
 * Route: `/admin/documents`
 * 
 * Official admissions desk review terminal for school registrars and verification
 * officers to inspect submitted placement slips, BECE certificates, birth records,
 * and identification cards, provisionally approve authentic records, or issue
 * actionable correction notices in compliance with GES pre-arrival protocols.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  Check,
  X,
  ShieldCheck,
  Search,
  Clock,
  Sparkles,
  ZoomIn,
  AlertTriangle
} from 'lucide-react';
import { AdmissionService } from '../../services/admissionService';

export default function AdminDocumentReviewPage() {
  const [documents, setDocuments] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'accepted' | 'changes'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [inspectModalDoc, setInspectModalDoc] = useState(null);
  
  // Review Action Form State
  const [reviewAction, setReviewAction] = useState('provisionally_accepted'); // 'provisionally_accepted' | 'changes_required'
  const [feedbackNote, setFeedbackNote] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const loadData = () => {
    setDocuments(AdmissionService.getDocuments());
    setStudentProfile(AdmissionService.getProfile());
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Official preset feedback templates
  const PRESET_FEEDBACKS = {
    provisionally_accepted: [
      'Verified and provisionally approved for reporting day intake registration.',
      'Document authenticity confirmed. Raw aggregate and personal details match school placement record.',
      'Document certified and placed in active student pre-arrival registry dossier.'
    ],
    changes_required: [
      'The uploaded scan is blurred or illegible. Please re-upload a clear, high-resolution copy.',
      'Document is cut off at the borders. Please provide a full-page scan showing all margins.',
      'Placement slip is missing parent or guardian signature. Please sign and re-upload.',
      'Official document stamp or serial number is not visible in this upload. Please rescan.'
    ]
  };

  const handleOpenReviewModal = (doc, initialAction = 'provisionally_accepted') => {
    setSelectedDoc(doc);
    setReviewAction(initialAction);
    setFeedbackNote(
      initialAction === 'provisionally_accepted'
        ? PRESET_FEEDBACKS.provisionally_accepted[0]
        : PRESET_FEEDBACKS.changes_required[0]
    );
  };

  const handleSelectPreset = (presetText) => {
    setFeedbackNote(presetText);
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!selectedDoc) return;

    AdmissionService.adminReviewDocument(selectedDoc.id, {
      status: reviewAction,
      adminFeedback: feedbackNote.trim()
    });

    loadData();
    setSelectedDoc(null);
    showToast(
      reviewAction === 'provisionally_accepted'
        ? `"${selectedDoc.name}" has been provisionally accepted and stamped.`
        : `Correction request issued for "${selectedDoc.name}".`
    );
  };

  // One-click quick accept directly from card
  const handleQuickAccept = (doc) => {
    AdmissionService.adminReviewDocument(doc.id, {
      status: 'provisionally_accepted',
      adminFeedback: 'Verified and provisionally approved by admissions officer.'
    });
    loadData();
    showToast(`"${doc.name}" provisionally approved.`);
  };

  // Filtered & Searched documents
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      // Status filter
      let matchesStatus = true;
      if (filterStatus === 'pending') {
        matchesStatus = doc.status === 'submitted' || doc.status === 'under_review';
      } else if (filterStatus === 'accepted') {
        matchesStatus = doc.status === 'provisionally_accepted';
      } else if (filterStatus === 'changes') {
        matchesStatus = doc.status === 'changes_required';
      }

      // Search filter
      const matchesSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.fileName && doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesStatus && matchesSearch;
    });
  }, [documents, filterStatus, searchQuery]);

  // Metric counts
  const totalCount = documents.length;
  const acceptedCount = documents.filter((d) => d.status === 'provisionally_accepted').length;
  const pendingCount = documents.filter((d) => d.status === 'submitted' || d.status === 'under_review').length;
  const changesCount = documents.filter((d) => d.status === 'changes_required').length;

  return (
    <div className="space-y-7 animate-fade-in">
      
      {/* 1. Official Terminal Header & Verification Authority */}
      <div className="bg-gradient-to-r from-cqNavy-950 via-cqNavy-900 to-cqNavy-950 text-white rounded-3xl p-6 sm:p-8 border border-cqNavy-800 shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-cqTeal-300 bg-cqNavy-800/90 px-3 py-1 rounded-full border border-cqNavy-700">
              <ShieldCheck size={13} className="text-cqTeal-400" />
              <span>GES Admissions Verification Authority</span>
            </span>
            <span className="text-xs text-slate-300 bg-cqNavy-800/60 px-2.5 py-1 rounded-full border border-cqNavy-700/60 font-mono">
              Terminal: Desk 3 • Achimota SHS
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 bg-cqNavy-900/90 px-2.5 py-1 rounded-full border border-cqNavy-700/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Registry Online
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            Admissions Document Verification Terminal
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Official review queue for applicant credentials, placement validation, certified examination slips, and identity documentation for the 2026 Senior High School academic intake.
          </p>
        </div>

        {/* Quick Candidate Snapshot Card */}
        {studentProfile && (
          <div className="bg-cqNavy-900/90 border border-cqNavy-700 rounded-2xl p-4 sm:p-5 text-xs space-y-2 shrink-0 w-full lg:w-auto shadow-inner">
            <div className="flex items-center justify-between gap-3 text-slate-400">
              <span className="text-[10px] uppercase font-bold tracking-wider text-cqTeal-400">
                Active Dossier Under Review
              </span>
              <span className="font-mono text-white text-[11px] bg-cqNavy-800 px-2 py-0.5 rounded">
                Index: {studentProfile.beceIndexNumber || '101245089'}
              </span>
            </div>
            <div>
              <p className="text-sm font-black text-white">{studentProfile.fullName || 'Candidate'}</p>
              <p className="text-[11px] text-slate-300">
                {studentProfile.programme} • {studentProfile.residentialStatus}
              </p>
            </div>
            <div className="pt-1 border-t border-cqNavy-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Guardian: {studentProfile.guardianName || 'Kwame Mensah'}</span>
              <span className="text-cqTeal-300 font-mono">{studentProfile.guardianPhone}</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Executive KPI Statistic Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Documents */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Total Mandatory Dossier</span>
            <FileText size={18} className="text-cqNavy-700" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalCount}</span>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              Credentials
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Official required certificates</p>
        </div>

        {/* Pending Verification */}
        <div className="bg-white rounded-2xl border border-amber-200/80 bg-amber-50/20 p-4 sm:p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-semibold text-amber-900">Awaiting Verification</span>
            <Clock size={18} className="text-amber-600 animate-pulse" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-amber-950">{pendingCount}</span>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              Requires Action
            </span>
          </div>
          <p className="text-[11px] text-amber-800">Pending officer decision</p>
        </div>

        {/* Provisionally Approved */}
        <div className="bg-white rounded-2xl border border-emerald-200/80 bg-emerald-50/20 p-4 sm:p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-semibold text-emerald-900">Provisionally Approved</span>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-emerald-950">{acceptedCount}</span>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              {Math.round((acceptedCount / (totalCount || 1)) * 100)}% Cleared
            </span>
          </div>
          <p className="text-[11px] text-emerald-800">Ready for reporting day</p>
        </div>

        {/* Corrections Required */}
        <div className="bg-white rounded-2xl border border-rose-200/80 bg-rose-50/20 p-4 sm:p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-xs font-semibold text-rose-900">Corrections Requested</span>
            <AlertCircle size={18} className="text-rose-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-rose-950">{changesCount}</span>
            <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
              Notice Sent
            </span>
          </div>
          <p className="text-[11px] text-rose-800">Awaiting candidate re-upload</p>
        </div>

      </div>

      {/* 3. Search & Segmented Filtering Toolbar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Status Filter Segmented Controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Documents', count: totalCount },
            { id: 'pending', label: 'Awaiting Verification', count: pendingCount, highlight: 'amber' },
            { id: 'changes', label: 'Corrections Required', count: changesCount, highlight: 'rose' },
            { id: 'accepted', label: 'Provisionally Approved', count: acceptedCount, highlight: 'emerald' }
          ].map((tab) => {
            const active = filterStatus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  active
                    ? 'bg-cqNavy-950 text-white shadow-xs font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  active
                    ? 'bg-cqNavy-800 text-cqTeal-300'
                    : tab.highlight === 'amber'
                    ? 'bg-amber-100 text-amber-800'
                    : tab.highlight === 'rose'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Search Input */}
        <div className="relative w-full md:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search credential or filename..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              <X size={13} />
            </button>
          )}
        </div>

      </div>

      {/* 4. Document Dossier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredDocs.map((doc) => {
          const isPending = doc.status === 'submitted' || doc.status === 'under_review';
          const isAccepted = doc.status === 'provisionally_accepted';
          const isChanges = doc.status === 'changes_required';

          return (
            <div
              key={doc.id}
              className={`bg-white rounded-3xl border shadow-xs transition-all overflow-hidden flex flex-col justify-between ${
                isChanges
                  ? 'border-rose-200 hover:border-rose-300'
                  : isPending
                  ? 'border-amber-200 hover:border-amber-300 ring-1 ring-amber-100'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              
              {/* Card Header */}
              <div className="p-5 sm:p-6 space-y-4">
                
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-cqNavy-50 text-cqNavy-900 border border-cqNavy-100 flex items-center justify-center shrink-0">
                      <FileText size={20} className="text-cqNavy-900" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-cqTeal-700 bg-cqTeal-50 px-2 py-0.5 rounded border border-cqTeal-200/60">
                        {doc.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">
                        {doc.name}
                      </h3>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full border shrink-0 ${
                    isAccepted
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 flex items-center gap-1'
                      : isChanges
                      ? 'bg-rose-50 text-rose-800 border-rose-200 flex items-center gap-1'
                      : isPending
                      ? 'bg-amber-50 text-amber-800 border-amber-200 flex items-center gap-1'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {isAccepted && <CheckCircle2 size={12} className="text-emerald-600" />}
                    {isChanges && <AlertCircle size={12} className="text-rose-600" />}
                    {isPending && <Clock size={12} className="text-amber-600" />}
                    <span>{isAccepted ? 'Provisionally Approved' : isChanges ? 'Correction Required' : isPending ? 'Awaiting Verification' : 'Not Submitted'}</span>
                  </span>
                </div>

                {/* Document Description */}
                <p className="text-xs text-slate-500 leading-relaxed">
                  {doc.description}
                </p>

                {/* High-Resolution Preview Frame Viewport */}
                {doc.fileUrl ? (
                  <div
                    onClick={() => setInspectModalDoc(doc)}
                    className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 h-48 relative group cursor-pointer shadow-inner"
                  >
                    <img
                      src={doc.fileUrl}
                      alt={doc.name}
                      className="w-full h-full object-cover group-hover:scale-105 opacity-90 group-hover:opacity-100 transition-all duration-300"
                    />
                    
                    {/* Hover Inspect Overlay */}
                    <div className="absolute inset-0 bg-cqNavy-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-white">
                      <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md">
                        <ZoomIn size={22} className="text-white" />
                      </div>
                      <span className="text-xs font-bold tracking-wide">
                        Click to Inspect High-Resolution Scan
                      </span>
                    </div>

                    {/* Format Badge Bottom Overlay */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-white bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-700/60">
                      <span className="font-mono truncate">{doc.fileName}</span>
                      <span className="font-bold text-cqTeal-300">{doc.fileSize || '1.4 MB'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                    <FileText size={28} className="mx-auto mb-2 text-slate-300" />
                    <span>Candidate has not submitted this credential yet.</span>
                  </div>
                )}

                {/* Metadata & Audit Trail */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Submitted Timestamp:</span>
                    <strong className="text-slate-800">
                      {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : 'Not uploaded'}
                    </strong>
                  </div>

                  {doc.reviewedAt && (
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Reviewed Date:</span>
                      <span className="text-slate-700">
                        {new Date(doc.reviewedAt).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {doc.adminFeedback && (
                    <div className={`mt-2 p-2.5 rounded-xl text-[11px] flex items-start gap-2 ${
                      isChanges
                        ? 'bg-rose-50 text-rose-900 border border-rose-200'
                        : isAccepted
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        : 'bg-white text-slate-800 border border-slate-200'
                    }`}>
                      {isChanges ? (
                        <AlertTriangle size={14} className="text-rose-600 shrink-0 mt-0.5" />
                      ) : (
                        <ShieldCheck size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <strong>Desk Note: </strong>
                        <span>{doc.adminFeedback}</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Action Buttons Strip */}
              {doc.fileUrl && (
                <div className="p-4 sm:p-5 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInspectModalDoc(doc)}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    title="Inspect document full-screen"
                  >
                    <Eye size={14} />
                    <span className="hidden sm:inline">Inspect</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenReviewModal(doc, 'changes_required')}
                    className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <AlertCircle size={14} />
                    <span>Request Correction</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenReviewModal(doc, 'provisionally_accepted')}
                    className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-cqNavy-950 hover:bg-cqNavy-900 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 size={14} />
                    <span>Verify & Approve</span>
                  </button>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {filteredDocs.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <FileText size={36} className="mx-auto text-slate-300" />
          <h3 className="font-bold text-slate-900">No Documents Found</h3>
          <p className="text-xs text-slate-500">
            No credential submissions matched the selected filter "{filterStatus}" or query "{searchQuery}".
          </p>
          <button
            type="button"
            onClick={() => {
              setFilterStatus('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-800"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* 5. Document Inspection Modal (High-Resolution View) */}
      {inspectModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
            
            {/* Modal Top Bar */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cqNavy-950 text-white flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-cqTeal-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{inspectModalDoc.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {inspectModalDoc.fileName} • {inspectModalDoc.fileSize}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const docToReview = inspectModalDoc;
                    setInspectModalDoc(null);
                    handleOpenReviewModal(docToReview);
                  }}
                  className="px-3.5 py-1.5 bg-cqNavy-950 hover:bg-cqNavy-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 size={14} />
                  <span>Review Decision</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInspectModalDoc(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Document Full Viewport */}
            <div className="flex-1 overflow-auto bg-slate-900 p-4 sm:p-6 flex items-center justify-center min-h-[420px]">
              {inspectModalDoc.fileUrl ? (
                <img
                  src={inspectModalDoc.fileUrl}
                  alt={inspectModalDoc.name}
                  className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-2xl border border-slate-800"
                />
              ) : (
                <div className="text-center text-slate-400">No document image available.</div>
              )}
            </div>

            {/* Modal Bottom Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>GES Authenticated Document Preview • Achimota School Registry Terminal</span>
              </div>
              <button
                type="button"
                onClick={() => setInspectModalDoc(null)}
                className="px-4 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-white font-semibold"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 6. Official Decision Form Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 border border-slate-200 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cqNavy-50 text-cqNavy-900 flex items-center justify-center">
                  <ShieldCheck size={18} className="text-cqTeal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Official Verification Decision
                  </h3>
                  <p className="text-[11px] text-slate-500">Admissions Desk Sign-Off Protocol</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Credential:</span>
                <span className="font-bold text-slate-900">{selectedDoc.name}</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px] text-slate-500">
                <span>File attached:</span>
                <span className="text-slate-800">{selectedDoc.fileName}</span>
              </div>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              
              {/* Decision Outcome Radio Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Select Official Outcome</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setReviewAction('provisionally_accepted');
                      setFeedbackNote(PRESET_FEEDBACKS.provisionally_accepted[0]);
                    }}
                    className={`p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
                      reviewAction === 'provisionally_accepted'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-200 shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 size={18} className={reviewAction === 'provisionally_accepted' ? 'text-emerald-600' : 'text-slate-400'} />
                    <span>Provisionally Accept</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setReviewAction('changes_required');
                      setFeedbackNote(PRESET_FEEDBACKS.changes_required[0]);
                    }}
                    className={`p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
                      reviewAction === 'changes_required'
                        ? 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-200 shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <AlertCircle size={18} className={reviewAction === 'changes_required' ? 'text-rose-600' : 'text-slate-400'} />
                    <span>Request Corrections</span>
                  </button>
                </div>
              </div>

              {/* Quick Template Preset Buttons */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600">
                  Quick Official Presets:
                </span>
                <div className="flex flex-col gap-1.5">
                  {(reviewAction === 'provisionally_accepted'
                    ? PRESET_FEEDBACKS.provisionally_accepted
                    : PRESET_FEEDBACKS.changes_required
                  ).map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`text-left text-[11px] p-2 rounded-xl border transition-all ${
                        feedbackNote === preset
                          ? 'bg-cqNavy-900 text-white font-medium border-cqNavy-900'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Feedback Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Official Desk Notes (Visible to Student & Parent)
                </label>
                <textarea
                  rows={3}
                  required
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  placeholder="Enter specific desk observations or instructions..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedDoc(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 ${
                    reviewAction === 'provisionally_accepted'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  <Check size={14} />
                  <span>Submit Official Decision</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 7. Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-cqNavy-950 text-white text-xs px-4 py-3 rounded-2xl shadow-xl border border-cqNavy-800 flex items-center gap-2.5 animate-fade-in">
          <Sparkles size={15} className="text-cqTeal-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
