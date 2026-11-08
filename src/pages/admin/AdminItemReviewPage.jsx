/**
 * CitizenQueue - Institutional Item Photo Review Desk
 * 
 * Route: `/admin/items`
 * 
 * Interface for boarding house masters and administrators to inspect item photographs
 * submitted by students, compare with required specifications (e.g. trunk dimensions,
 * khaki shades, math sets), and provide preliminary feedback before reporting day.
 */

import React, { useState, useEffect } from 'react';
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';
import { AdmissionService } from '../../services/admissionService';

export default function AdminItemReviewPage() {
  const [prospectus, setProspectus] = useState([]);
  const [itemStatuses, setItemStatuses] = useState({});
  const [filterMode, setFilterMode] = useState('all_photos'); // 'all_photos' | 'awaiting' | 'accepted' | 'changes'
  const [selectedItem, setSelectedItem] = useState(null);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [reviewStatus, setReviewStatus] = useState('provisionally_accepted');
  const [toastMessage, setToastMessage] = useState('');

  const loadData = () => {
    setProspectus(AdmissionService.getProspectus());
    setItemStatuses(AdmissionService.getStudentProspectusStatus());
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Collect all items that have photo submissions
  const submittedItems = prospectus
    .map((item) => ({
      ...item,
      status: itemStatuses[item.id] || {
        purchased: false,
        photoStatus: 'not_submitted',
        photoUrl: null,
        adminFeedback: null
      }
    }))
    .filter((item) => item.status.photoUrl);

  const filteredItems = submittedItems.filter((item) => {
    if (filterMode === 'awaiting') return item.status.photoStatus === 'awaiting_review';
    if (filterMode === 'accepted') return item.status.photoStatus === 'provisionally_accepted';
    if (filterMode === 'changes') return item.status.photoStatus === 'changes_required';
    return true;
  });

  const handleOpenReviewModal = (item, initialStatus = 'provisionally_accepted') => {
    setSelectedItem(item);
    setReviewStatus(initialStatus);
    setFeedbackNote(
      initialStatus === 'provisionally_accepted'
        ? 'Specification verified. Provisionally approved for physical reporting.'
        : 'Please ensure dimensions and color conform to the school prospectus guidelines.'
    );
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    AdmissionService.adminReviewItemPhoto(selectedItem.id, {
      status: reviewStatus,
      adminFeedback: feedbackNote.trim()
    });

    loadData();
    setSelectedItem(null);
    showToast(
      reviewStatus === 'provisionally_accepted'
        ? `"${selectedItem.name}" provisionally approved!`
        : `Adjustment requested for "${selectedItem.name}".`
    );
  };

  const awaitingCount = submittedItems.filter(
    (i) => i.status.photoStatus === 'awaiting_review'
  ).length;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cqTeal-800 bg-cqTeal-50 px-2.5 py-0.5 rounded-full border border-cqTeal-200">
            <Camera size={12} />
            <span>Boarding House Equipment Screening</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-cqNavy-950 mt-1">
            Prospectus Item Photo Review
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Preliminary photo check to catch oversized trunks, non-standard khaki uniforms, and incorrect items before arrival.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 shadow-xs">
            {awaitingCount} Photos Awaiting Review
          </span>
        </div>
      </div>

      {/* Mandatory Inspection Advisory */}
      <div className="p-4 bg-slate-900 text-white rounded-2xl text-xs flex items-start gap-3 shadow-xs">
        <ShieldCheck size={18} className="text-cqTeal-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-cqTeal-300">Staff Preliminary Advisory</p>
          <p className="text-slate-300 leading-relaxed">
            Approving item photographs here marks the candidate’s item as <strong>provisionally accepted</strong> in their admission dashboard. Final physical clearance is confirmed by the House Master during campus reporting check-in.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all_photos', label: `All Submitted Photos (${submittedItems.length})` },
          { id: 'awaiting', label: `Awaiting Review (${awaitingCount})` },
          { id: 'changes', label: 'Changes Required' },
          { id: 'accepted', label: 'Provisionally Accepted' }
        ].map((tab) => {
          const active = filterMode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterMode(tab.id)}
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

      {/* Item Review Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => {
          const isAwaiting = item.status.photoStatus === 'awaiting_review';
          const isAccepted = item.status.photoStatus === 'provisionally_accepted';
          const isChanges = item.status.photoStatus === 'changes_required';

          return (
            <div
              key={item.id}
              className={`bg-white rounded-3xl border overflow-hidden p-5 shadow-xs flex flex-col justify-between space-y-4 ${
                isChanges
                  ? 'border-rose-200 bg-rose-50/10'
                  : isAwaiting
                  ? 'border-amber-200 bg-amber-50/10 ring-1 ring-amber-200'
                  : 'border-slate-200'
              }`}
            >
              <div className="space-y-3">
                
                {/* Header & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-cqNavy-800 bg-cqNavy-50 px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{item.name}</h3>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    isAccepted
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : isChanges
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {isAccepted ? 'Accepted' : isChanges ? 'Changes Needed' : 'Awaiting Review'}
                  </span>
                </div>

                {/* Photo Preview */}
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-48 relative group">
                  <img
                    src={item.status.photoUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-900/80 text-[10px] text-white font-mono">
                    {item.status.photoName || 'photo.jpg'}
                  </div>
                </div>

                {/* Candidate & Specification Comparison */}
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Official Specification</p>
                    <p className="text-slate-800 font-semibold leading-relaxed mt-0.5">
                      {item.specification}
                    </p>
                  </div>

                  {item.status.adminFeedback && (
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px]">
                      <strong className="text-slate-800">Current Feedback: </strong>
                      <span className="text-slate-600">{item.status.adminFeedback}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Candidate: <strong>Emmanuel Mensah</strong></span>
                    <span>BECE: <strong>101245089</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleOpenReviewModal(item, 'changes_required')}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center justify-center gap-1"
                >
                  <AlertCircle size={13} />
                  <span>Request Fix</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenReviewModal(item, 'provisionally_accepted')}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-cqNavy-950 hover:bg-cqNavy-900 transition-colors flex items-center justify-center gap-1 shadow-xs"
                >
                  <CheckCircle2 size={13} />
                  <span>Accept Item</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-14 bg-white rounded-3xl border border-slate-200 space-y-2">
          <Camera size={32} className="mx-auto text-slate-300" />
          <p className="text-sm font-bold text-slate-800">No submitted photographs match this filter</p>
          <p className="text-xs text-slate-500">Students submit item photographs from their Digital Prospectus portal.</p>
        </div>
      )}

      {/* Review Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Camera size={18} className="text-cqTeal-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Item Review Decision
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-black text-cqNavy-950">{selectedItem.name}</h4>
              <p className="text-xs text-slate-600">
                <strong>Spec:</strong> {selectedItem.specification}
              </p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Review Outcome</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewStatus('provisionally_accepted')}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      reviewStatus === 'provisionally_accepted'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <CheckCircle2 size={14} />
                    <span>Provisionally Accept</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewStatus('changes_required')}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      reviewStatus === 'changes_required'
                        ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-200'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <AlertCircle size={14} />
                    <span>Request Changes</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Instruction / Feedback for Student
                </label>
                <textarea
                  rows={3}
                  required
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  placeholder="e.g. Dimensions exceed standard bunk bed height (trunk is 55cm high; maximum allowed is 40cm)..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-cqNavy-950 hover:bg-cqNavy-900 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Save Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-cqNavy-950 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-cqNavy-800 flex items-center gap-2 animate-fade-in">
          <Sparkles size={14} className="text-cqTeal-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
