/**
 * CitizenQueue - Institutional Document Review Desk
 * 
 * Route: `/admin/documents`
 * 
 * Review queue for admissions desk officers to inspect uploaded slips, certificates,
 * and identification cards, provisionally approve valid documents, or request corrections
 * with actionable feedback.
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sparkles,
  Check,
  X,
  ShieldCheck
} from 'lucide-react';
import { AdmissionService } from '../../services/admissionService';

export default function AdminDocumentReviewPage() {
  const [documents, setDocuments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'accepted' | 'changes'
  const [selectedDoc, setSelectedDoc] = useState(null);
  
  // Review Action Form State
  const [reviewAction, setReviewAction] = useState('provisionally_accepted'); // 'provisionally_accepted' | 'changes_required'
  const [feedbackNote, setFeedbackNote] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const loadDocuments = () => {
    setDocuments(AdmissionService.getDocuments());
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleOpenReviewModal = (doc, initialAction = 'provisionally_accepted') => {
    setSelectedDoc(doc);
    setReviewAction(initialAction);
    setFeedbackNote(
      initialAction === 'provisionally_accepted'
        ? 'Verified and provisionally accepted for reporting day records.'
        : 'Please re-upload a clearer, full-page scanned copy.'
    );
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!selectedDoc) return;

    AdmissionService.adminReviewDocument(selectedDoc.id, {
      status: reviewAction,
      adminFeedback: feedbackNote.trim()
    });

    loadDocuments();
    setSelectedDoc(null);
    showToast(
      reviewAction === 'provisionally_accepted'
        ? `"${selectedDoc.name}" has been provisionally accepted!`
        : `Correction request sent for "${selectedDoc.name}".`
    );
  };

  // Filtered documents
  const filteredDocs = documents.filter((doc) => {
    if (filterStatus === 'pending') return doc.status === 'submitted' || doc.status === 'under_review';
    if (filterStatus === 'accepted') return doc.status === 'provisionally_accepted';
    if (filterStatus === 'changes') return doc.status === 'changes_required';
    return true;
  });

  const pendingReviewCount = documents.filter(
    (d) => d.status === 'submitted' || d.status === 'under_review'
  ).length;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cqTeal-800 bg-cqTeal-50 px-2.5 py-0.5 rounded-full border border-cqTeal-200">
            <ShieldCheck size={12} />
            <span>Admissions Desk Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-cqNavy-950 mt-1">
            Document Review Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Review submitted student placement slips, BECE results, and certificates before reporting day.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 shadow-xs">
            {pendingReviewCount} Awaiting Review
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Documents' },
          { id: 'pending', label: 'Awaiting Review' },
          { id: 'changes', label: 'Changes Requested' },
          { id: 'accepted', label: 'Provisionally Accepted' }
        ].map((tab) => {
          const active = filterStatus === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                active
                  ? 'bg-cqNavy-950 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Documents Review List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => {
          const isPending = doc.status === 'submitted' || doc.status === 'under_review';
          const isAccepted = doc.status === 'provisionally_accepted';
          const isChanges = doc.status === 'changes_required';

          return (
            <div
              key={doc.id}
              className={`bg-white rounded-3xl border p-5 shadow-xs flex flex-col justify-between space-y-4 ${
                isChanges
                  ? 'border-rose-200 bg-rose-50/20'
                  : isPending
                  ? 'border-amber-200 bg-amber-50/10'
                  : 'border-slate-200'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cqNavy-50 text-cqNavy-900 flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{doc.name}</h3>
                      <p className="text-[11px] text-slate-500">{doc.category}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    isAccepted
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : isChanges
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : isPending
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {isAccepted ? 'Accepted' : isChanges ? 'Changes Requested' : isPending ? 'Awaiting Review' : 'Not Submitted'}
                  </span>
                </div>

                {/* File Attachment & Preview Thumbnail */}
                {doc.fileUrl ? (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-44 relative group">
                    <img
                      src={doc.fileUrl}
                      alt={doc.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs font-bold text-white bg-cqNavy-950/80 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                        <Eye size={13} />
                        Inspect Document
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-xs italic">
                    Candidate has not uploaded this document yet.
                  </div>
                )}

                {/* Metadata */}
                <div className="space-y-1 text-xs text-slate-600">
                  {doc.fileName && (
                    <p className="font-mono text-[11px] truncate text-slate-800">
                      File: <strong>{doc.fileName}</strong> ({doc.fileSize || '1.2 MB'})
                    </p>
                  )}
                  {doc.uploadedAt && (
                    <p className="text-[11px] text-slate-500">
                      Submitted on: {new Date(doc.uploadedAt).toLocaleString()}
                    </p>
                  )}
                  {doc.adminFeedback && (
                    <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] border border-slate-200">
                      <strong>Current Desk Feedback: </strong>
                      <span className="text-slate-700">{doc.adminFeedback}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {doc.fileUrl && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleOpenReviewModal(doc, 'changes_required')}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <AlertCircle size={13} />
                    <span>Request Fix</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenReviewModal(doc, 'provisionally_accepted')}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-cqNavy-950 hover:bg-cqNavy-900 transition-colors flex items-center justify-center gap-1 shadow-xs"
                  >
                    <CheckCircle2 size={13} />
                    <span>Accept Document</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Review Feedback Decision Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-cqTeal-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Document Review Decision
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

            <div className="space-y-1">
              <h4 className="text-sm font-black text-cqNavy-950">{selectedDoc.name}</h4>
              <p className="text-xs text-slate-500 font-mono">File: {selectedDoc.fileName}</p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Select Review Outcome</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewAction('provisionally_accepted')}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      reviewAction === 'provisionally_accepted'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <CheckCircle2 size={14} />
                    <span>Provisionally Accept</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewAction('changes_required')}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      reviewAction === 'changes_required'
                        ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-200'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <AlertCircle size={14} />
                    <span>Request Corrections</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Desk Feedback Message for Student / Guardian
                </label>
                <textarea
                  rows={3}
                  required
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  placeholder="Explain clearly what was verified or why corrections are requested..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                />
              </div>

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
                  className="px-5 py-2 text-xs font-bold text-white bg-cqNavy-950 hover:bg-cqNavy-900 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Confirm Decision</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-cqNavy-950 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-cqNavy-800 flex items-center gap-2 animate-fade-in">
          <Sparkles size={14} className="text-cqTeal-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
