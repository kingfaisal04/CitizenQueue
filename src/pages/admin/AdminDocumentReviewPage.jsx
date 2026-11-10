/**
 * CitizenQueue - Institutional Document Verification & Credential Clearance Terminal
 * 
 * Route: `/admin/documents`
 * 
 * Official admissions desk verification terminal for school registrars and verification
 * officers to inspect submitted placement slips, BECE certificates, birth records,
 * and identification cards in a structured, categorized tabular form.
 * 
 * Features:
 * - Tabular layout categorized by credential type
 * - Multi-select checker with batch verification actions
 * - Individual quick Approve / Decline checker controls
 * - Photo pre-load visual thumbnails with hover zoom and high-res inspection modal
 * - Document metadata editing & requirement deletion
 * - New document requirement creation
 * - Active candidate dossier switcher
 */

import React, { useState } from 'react';
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
  ZoomOut,
  RotateCw,
  AlertTriangle,
  Edit2,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  Filter,
  CheckSquare,
  Square,
  User,
  Layers,
  CheckCheck
} from 'lucide-react';
import { AdmissionService } from '../../services/admissionService';
import { Storage } from '../../services/storageService';

export default function AdminDocumentReviewPage() {
  const [documents, setDocuments] = useState(() => AdmissionService.getDocuments());
  const [admittedStudents, setAdmittedStudents] = useState(() => Storage.getAdmittedStudents() || []);
  const [activeStudent, setActiveStudent] = useState(() => AdmissionService.getProfile());
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'accepted' | 'changes'
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [collapsedCategories, setCollapsedCategories] = useState({});

  // High-Resolution Inspection Modal State
  const [inspectModalDoc, setInspectModalDoc] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Review Decision Modal State
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    doc: null,
    isBatch: false
  });
  const [reviewAction, setReviewAction] = useState('provisionally_accepted'); // 'provisionally_accepted' | 'changes_required'
  const [feedbackNote, setFeedbackNote] = useState('');

  // Add / Edit Document Requirement Modal State
  const [editModal, setEditModal] = useState({
    isOpen: false,
    doc: null,
    isNew: false
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    category: 'Academic Records',
    description: '',
    required: true,
    fileUrl: ''
  });

  // Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    doc: null
  });

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState('');

  const reloadData = () => {
    setDocuments(AdmissionService.getDocuments());
    setAdmittedStudents(Storage.getAdmittedStudents() || []);
    setActiveStudent(AdmissionService.getProfile());
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Official preset feedback templates
  const PRESET_FEEDBACKS = {
    provisionally_accepted: [
      'Verified and provisionally approved for reporting day intake registration.',
      'Document authenticity confirmed. Raw aggregate and personal details match school placement record.',
      'Document certified and placed in active student pre-arrival registry dossier.',
      'Serial code and official institutional stamps verified successfully.'
    ],
    changes_required: [
      'The uploaded scan is blurred or illegible. Please re-upload a clear, high-resolution copy.',
      'Document is cut off at the borders. Please provide a full-page scan showing all margins.',
      'Placement slip is missing parent or guardian signature. Please sign and re-upload.',
      'Official document stamp or serial number is not visible in this upload. Please rescan.',
      'The reverse side of the card / certificate is missing. Please provide both sides.'
    ]
  };

  // Preset categories for document requirements
  const PRESET_CATEGORIES = [
    'Placement & Enrollment',
    'Academic Records',
    'Identity & Bio-data',
    'Identification',
    'Health & Welfare',
    'Guardian Records'
  ];

  // ==========================================================================
  // CANDIDATE SWITCHER
  // ==========================================================================
  const handleSelectStudent = (studentId) => {
    const student = admittedStudents.find((s) => s.id === studentId);
    if (student) {
      setActiveStudent({
        fullName: student.name,
        beceIndexNumber: student.indexNumber,
        gender: student.gender,
        programme: student.programme,
        residentialStatus: student.residentialStatus,
        guardianName: student.guardianName,
        guardianPhone: student.guardianPhone,
        guardianEmail: student.guardianEmail
      });
      showToast(`Switched active review dossier to ${student.name} (${student.indexNumber}).`);
    }
  };

  // ==========================================================================
  // CHECKER SELECTION (MULTI-SELECT)
  // ==========================================================================
  const handleToggleSelectDoc = (docId) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const handleSelectAllCategory = (categoryDocs) => {
    const catDocIds = categoryDocs.map((d) => d.id);
    const allSelected = catDocIds.every((id) => selectedDocIds.includes(id));
    if (allSelected) {
      setSelectedDocIds((prev) => prev.filter((id) => !catDocIds.includes(id)));
    } else {
      setSelectedDocIds((prev) => Array.from(new Set([...prev, ...catDocIds])));
    }
  };

  const handleSelectAllGlobal = () => {
    if (selectedDocIds.length === filteredDocs.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(filteredDocs.map((d) => d.id));
    }
  };

  // ==========================================================================
  // REVIEW DECISION ACTIONS (SINGLE & BATCH)
  // ==========================================================================
  const handleOpenReviewModal = (doc, initialAction = 'provisionally_accepted') => {
    setReviewModal({
      isOpen: true,
      doc,
      isBatch: false
    });
    setReviewAction(initialAction);
    setFeedbackNote(
      initialAction === 'provisionally_accepted'
        ? PRESET_FEEDBACKS.provisionally_accepted[0]
        : PRESET_FEEDBACKS.changes_required[0]
    );
  };

  const handleOpenBatchReviewModal = (action = 'provisionally_accepted') => {
    if (selectedDocIds.length === 0) return;
    setReviewModal({
      isOpen: true,
      doc: null,
      isBatch: true
    });
    setReviewAction(action);
    setFeedbackNote(
      action === 'provisionally_accepted'
        ? PRESET_FEEDBACKS.provisionally_accepted[0]
        : PRESET_FEEDBACKS.changes_required[0]
    );
  };

  const handleQuickSingleApprove = (doc) => {
    AdmissionService.adminReviewDocument(doc.id, {
      status: 'provisionally_accepted',
      adminFeedback: 'Verified and provisionally approved by admissions desk checker.'
    });
    reloadData();
    showToast(`"${doc.name}" provisionally approved.`);
  };

  const handleSubmitReviewDecision = (e) => {
    e.preventDefault();
    if (reviewModal.isBatch) {
      AdmissionService.adminBatchReviewDocuments(selectedDocIds, {
        status: reviewAction,
        adminFeedback: feedbackNote.trim()
      });
      reloadData();
      showToast(
        reviewAction === 'provisionally_accepted'
          ? `Batch approved ${selectedDocIds.length} selected documents.`
          : `Issued correction request for ${selectedDocIds.length} selected documents.`
      );
      setSelectedDocIds([]);
    } else if (reviewModal.doc) {
      AdmissionService.adminReviewDocument(reviewModal.doc.id, {
        status: reviewAction,
        adminFeedback: feedbackNote.trim()
      });
      reloadData();
      showToast(
        reviewAction === 'provisionally_accepted'
          ? `"${reviewModal.doc.name}" has been provisionally approved.`
          : `Correction notice issued for "${reviewModal.doc.name}".`
      );
    }
    setReviewModal({ isOpen: false, doc: null, isBatch: false });
  };

  // ==========================================================================
  // EDIT & ADD DOCUMENT REQUIREMENT
  // ==========================================================================
  const handleOpenAddModal = () => {
    setEditModal({
      isOpen: true,
      doc: null,
      isNew: true
    });
    setEditFormData({
      name: '',
      category: 'Academic Records',
      description: '',
      required: true,
      fileUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=600&auto=format&fit=crop&q=60'
    });
  };

  const handleOpenEditModal = (doc) => {
    setEditModal({
      isOpen: true,
      doc,
      isNew: false
    });
    setEditFormData({
      name: doc.name,
      category: doc.category,
      description: doc.description || '',
      required: doc.required !== false,
      fileUrl: doc.fileUrl || ''
    });
  };

  const handleSubmitEditForm = (e) => {
    e.preventDefault();
    if (!editFormData.name.trim()) return;

    if (editModal.isNew) {
      AdmissionService.addDocumentRequirement(editFormData);
      showToast(`New requirement "${editFormData.name}" added to dossier.`);
    } else if (editModal.doc) {
      AdmissionService.updateDocumentRequirement(editModal.doc.id, editFormData);
      showToast(`Requirement "${editFormData.name}" updated successfully.`);
    }

    reloadData();
    setEditModal({ isOpen: false, doc: null, isNew: false });
  };

  // ==========================================================================
  // DELETE DOCUMENT REQUIREMENT
  // ==========================================================================
  const handleOpenDeleteModal = (doc) => {
    setDeleteModal({
      isOpen: true,
      doc
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteModal.doc) return;
    AdmissionService.deleteDocumentRequirement(deleteModal.doc.id);
    setSelectedDocIds((prev) => prev.filter((id) => id !== deleteModal.doc.id));
    reloadData();
    showToast(`Removed "${deleteModal.doc.name}" from dossier requirements.`);
    setDeleteModal({ isOpen: false, doc: null });
  };

  // ==========================================================================
  // FILTERING & CATEGORIZATION
  // ==========================================================================
  const filteredDocs = documents.filter((doc) => {
    // Status filter
    let matchesStatus = true;
    if (filterStatus === 'pending') {
      matchesStatus = doc.status === 'submitted' || doc.status === 'under_review';
    } else if (filterStatus === 'accepted') {
      matchesStatus = doc.status === 'provisionally_accepted';
    } else if (filterStatus === 'changes') {
      matchesStatus = doc.status === 'changes_required';
    }

    // Category filter
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;

    // Search filter
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      doc.name.toLowerCase().includes(q) ||
      doc.category.toLowerCase().includes(q) ||
      (doc.fileName && doc.fileName.toLowerCase().includes(q)) ||
      (doc.description && doc.description.toLowerCase().includes(q));

    return matchesStatus && matchesCategory && matchesSearch;
  });

  // Group filtered documents by category
  const categorizedDocs = {};
  filteredDocs.forEach((doc) => {
    const cat = doc.category || 'General Credentials';
    if (!categorizedDocs[cat]) {
      categorizedDocs[cat] = [];
    }
    categorizedDocs[cat].push(doc);
  });

  // Available unique categories
  const allCategories = Array.from(new Set(documents.map((d) => d.category)));

  // Metrics
  const totalCount = documents.length;
  const acceptedCount = documents.filter((d) => d.status === 'provisionally_accepted').length;
  const pendingCount = documents.filter((d) => d.status === 'submitted' || d.status === 'under_review').length;
  const changesCount = documents.filter((d) => d.status === 'changes_required').length;
  const clearanceRate = totalCount ? Math.round((acceptedCount / totalCount) * 100) : 0;

  // Toggle category collapse
  const toggleCategoryCollapse = (catName) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* 1. Official Terminal Header & Active Candidate Dossier */}
      <div className="bg-gradient-to-r from-cqNavy-950 via-cqNavy-900 to-cqNavy-950 text-white rounded-3xl p-6 sm:p-7 border border-cqNavy-800 shadow-lg flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
        
        <div className="space-y-2.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-cqTeal-300 bg-cqNavy-800/90 px-3 py-1 rounded-full border border-cqNavy-700/80">
              <ShieldCheck size={14} className="text-cqTeal-400" />
              <span>GES Institutional Admissions Verification Desk</span>
            </span>
            <span className="text-xs text-slate-300 bg-cqNavy-800/60 px-2.5 py-1 rounded-full border border-cqNavy-700/60 font-mono">
              Desk 03 • Achimota Senior High School
            </span>
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 bg-cqNavy-900/90 px-2.5 py-1 rounded-full border border-cqNavy-700/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Registry Active
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Document Verification & Credential Clearance
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Tabular admissions ledger for verifying CSSPS placement slips, BECE result records, civil identification, and medical clearance certificates for the 2026 academic intake.
          </p>
        </div>

        {/* Candidate Dossier Selector & Active Profile */}
        <div className="bg-cqNavy-900/95 border border-cqNavy-700/90 rounded-2xl p-4 sm:p-5 text-xs space-y-3 shrink-0 w-full xl:w-84 shadow-inner">
          <div className="flex items-center justify-between gap-3 text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider text-cqTeal-400 flex items-center gap-1.5">
              <User size={12} />
              <span>Active Dossier</span>
            </span>
            {admittedStudents.length > 0 && (
              <select
                aria-label="Switch Candidate Dossier"
                value={admittedStudents.find((s) => s.name === activeStudent?.fullName)?.id || ''}
                onChange={(e) => handleSelectStudent(e.target.value)}
                className="bg-cqNavy-800 text-slate-200 border border-cqNavy-700 text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-cqTeal-400 cursor-pointer"
              >
                <option value="" disabled>Switch Candidate...</option>
                {admittedStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.indexNumber})
                  </option>
                ))}
              </select>
            )}
          </div>

          {activeStudent && (
            <div className="space-y-1.5 pt-1 border-t border-cqNavy-800">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-black text-white">{activeStudent.fullName || 'Candidate'}</p>
                <span className="font-mono text-white text-[11px] bg-cqNavy-800 px-2 py-0.5 rounded border border-cqNavy-700">
                  {activeStudent.beceIndexNumber || '101245089'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                {activeStudent.programme || 'General Science'} • {activeStudent.residentialStatus || 'Boarding'}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Guardian: {activeStudent.guardianName || 'Kwame Mensah'}</span>
                <span className="text-cqTeal-300 font-mono">{activeStudent.guardianPhone || '+233 24 411 2233'}</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 2. Executive KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Documents */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Total Mandatory Dossier</span>
            <FileText size={18} className="text-cqNavy-700" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalCount}</span>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              Credentials
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-cqNavy-700 h-full rounded-full transition-all duration-500"
              style={{ width: '100%' }}
            />
          </div>
          <p className="text-[11px] text-slate-500">Master checklist requirements</p>
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
              Requires Review
            </span>
          </div>
          <div className="w-full bg-amber-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${totalCount ? (pendingCount / totalCount) * 100 : 0}%` }}
            />
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
              {clearanceRate}% Cleared
            </span>
          </div>
          <div className="w-full bg-emerald-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${clearanceRate}%` }}
            />
          </div>
          <p className="text-[11px] text-emerald-800">Verified for reporting day</p>
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
              Notice Active
            </span>
          </div>
          <div className="w-full bg-rose-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${totalCount ? (changesCount / totalCount) * 100 : 0}%` }}
            />
          </div>
          <p className="text-[11px] text-rose-800">Awaiting applicant rescan</p>
        </div>

      </div>

      {/* 3. Toolbar: Status Filter, Category Filter, Search, and Add Requirement */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Status Filter Segmented Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
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

          {/* Action Buttons: Add Document Requirement & Category Filter */}
          <div className="flex items-center gap-2.5">
            
            {/* Category Dropdown */}
            <div className="relative">
              <select
                aria-label="Filter documents by category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-8 pr-8 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 focus:outline-none focus:ring-2 focus:ring-cqTeal-500 cursor-pointer appearance-none"
              >
                <option value="all">All Categories</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Add Document Requirement Button */}
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-3.5 py-2 rounded-xl bg-cqNavy-950 hover:bg-cqNavy-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
            >
              <Plus size={14} />
              <span>Add Document</span>
            </button>

          </div>

        </div>

        {/* Live Search and Global Selection Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by document name, category, or file..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500 transition-colors"
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

          {/* Quick Select All in View */}
          <div className="flex items-center gap-3 text-xs text-slate-600 justify-between sm:justify-end">
            <button
              type="button"
              onClick={handleSelectAllGlobal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 font-semibold text-slate-700 transition-colors"
            >
              {selectedDocIds.length === filteredDocs.length && filteredDocs.length > 0 ? (
                <CheckSquare size={14} className="text-cqTeal-600" />
              ) : (
                <Square size={14} className="text-slate-400" />
              )}
              <span>{selectedDocIds.length === filteredDocs.length && filteredDocs.length > 0 ? 'Deselect All' : 'Select All in View'}</span>
            </button>
            <span className="text-[11px] text-slate-400">
              Showing <strong>{filteredDocs.length}</strong> of {totalCount} records
            </span>
          </div>

        </div>

      </div>

      {/* 4. Batch Checker Action Bar (Sticky when rows are selected) */}
      {selectedDocIds.length > 0 && (
        <div className="sticky top-4 z-30 bg-cqNavy-950 text-white rounded-2xl p-4 shadow-xl border border-cqNavy-800 flex flex-wrap items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cqTeal-500/20 text-cqTeal-300 border border-cqTeal-400/30 flex items-center justify-center font-bold text-xs">
              {selectedDocIds.length}
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                {selectedDocIds.length} {selectedDocIds.length === 1 ? 'Credential' : 'Credentials'} Selected in Checker
              </p>
              <p className="text-[11px] text-slate-300">
                Execute batch verification sign-off across selected documents
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenBatchReviewModal('changes_required')}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <AlertCircle size={14} />
              <span>Decline Selected</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenBatchReviewModal('provisionally_accepted')}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <CheckCheck size={14} />
              <span>Batch Approve ({selectedDocIds.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDocIds([])}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-cqNavy-800 transition-colors"
              title="Clear selection"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 5. Categorized Tabular Tables */}
      <div className="space-y-7">
        {Object.entries(categorizedDocs).map(([categoryName, catDocs]) => {
          const isCollapsed = Boolean(collapsedCategories[categoryName]);
          const catApprovedCount = catDocs.filter((d) => d.status === 'provisionally_accepted').length;
          const catPendingCount = catDocs.filter((d) => d.status === 'submitted' || d.status === 'under_review').length;
          const catAllSelected = catDocs.every((d) => selectedDocIds.includes(d.id));

          return (
            <div
              key={categoryName}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden transition-all"
            >
              
              {/* Category Header Strip */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 via-slate-50/80 to-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                
                <div className="flex items-center gap-3">
                  {/* Category select-all checker */}
                  <button
                    type="button"
                    onClick={() => handleSelectAllCategory(catDocs)}
                    className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                    title={catAllSelected ? 'Deselect category' : 'Select all in category'}
                  >
                    {catAllSelected && catDocs.length > 0 ? (
                      <CheckSquare size={18} className="text-cqTeal-600" />
                    ) : (
                      <Square size={18} className="text-slate-400" />
                    )}
                  </button>

                  <div className="w-8 h-8 rounded-xl bg-cqNavy-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Layers size={16} className="text-cqTeal-400" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                        {categoryName}
                      </h2>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
                        {catDocs.length} {catDocs.length === 1 ? 'record' : 'records'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Official credential verification sub-ledger
                    </p>
                  </div>
                </div>

                {/* Category Verification Progress & Collapse Button */}
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 text-xs">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                      catApprovedCount === catDocs.length
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : catPendingCount > 0
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {catApprovedCount} / {catDocs.length} Verified
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleCategoryCollapse(categoryName)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                    title={isCollapsed ? 'Expand category table' : 'Collapse category table'}
                  >
                    {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                  </button>
                </div>

              </div>

              {/* Responsive Category Table */}
              {!isCollapsed && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[850px]">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="py-3 px-4 w-12 text-center">Checker</th>
                        <th className="py-3 px-4">Document Name & Type</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-4 text-center">Photo Pre-load</th>
                        <th className="py-3 px-4">Status & Notes</th>
                        <th className="py-3 px-4 text-center">Checker Action</th>
                        <th className="py-3 px-4 text-center w-28">Management</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {catDocs.map((doc) => {
                        const isSelected = selectedDocIds.includes(doc.id);
                        const isAccepted = doc.status === 'provisionally_accepted';
                        const isChanges = doc.status === 'changes_required';
                        const isPending = doc.status === 'submitted' || doc.status === 'under_review';

                        return (
                          <tr
                            key={doc.id}
                            className={`transition-colors hover:bg-slate-50/80 ${
                              isSelected
                                ? 'bg-cqNavy-50/60'
                                : isChanges
                                ? 'bg-rose-50/20'
                                : isPending
                                ? 'bg-amber-50/15'
                                : ''
                            }`}
                          >
                            
                            {/* 1. Checker Selection */}
                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleSelectDoc(doc.id)}
                                className="text-slate-400 hover:text-cqTeal-600 transition-colors p-1"
                                title={isSelected ? 'Deselect item' : 'Select item for batch checker'}
                              >
                                {isSelected ? (
                                  <CheckSquare size={16} className="text-cqTeal-600" />
                                ) : (
                                  <Square size={16} className="text-slate-400" />
                                )}
                              </button>
                            </td>

                            {/* 2. Document Name & Type */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-start gap-2.5">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                                  isAccepted
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : isChanges
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : isPending
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-slate-50 text-slate-500 border-slate-200'
                                }`}>
                                  <FileText size={16} />
                                </div>
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                                      {doc.name}
                                    </h3>
                                    {doc.required !== false ? (
                                      <span className="text-[9px] uppercase font-extrabold text-cqNavy-800 bg-cqNavy-100/80 px-1.5 py-0.2 rounded border border-cqNavy-200">
                                        Mandatory
                                      </span>
                                    ) : (
                                      <span className="text-[9px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                        Optional
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 line-clamp-1 max-w-sm">
                                    {doc.description || 'Standard institutional verification requirement.'}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* 3. Category */}
                            <td className="py-3.5 px-3">
                              <span className="inline-block text-[10px] font-bold tracking-wide text-cqTeal-800 bg-cqTeal-50 px-2 py-0.5 rounded-lg border border-cqTeal-200/80 whitespace-nowrap">
                                {doc.category}
                              </span>
                            </td>

                            {/* 4. Photo Pre-load Preview */}
                            <td className="py-3.5 px-4 text-center">
                              {doc.fileUrl ? (
                                <div
                                  onClick={() => {
                                    setInspectModalDoc(doc);
                                    setZoomLevel(1);
                                    setRotation(0);
                                  }}
                                  className="relative group inline-block cursor-pointer rounded-xl overflow-hidden border border-slate-300 shadow-xs hover:shadow-md hover:border-cqTeal-400 transition-all"
                                  title="Click to preview high-resolution scan"
                                >
                                  <img
                                    src={doc.fileUrl}
                                    alt={doc.name}
                                    className="w-14 h-10 object-cover group-hover:scale-110 transition-transform duration-200"
                                  />
                                  <div className="absolute inset-0 bg-cqNavy-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                    <Eye size={14} />
                                  </div>
                                  <span className="absolute bottom-0 right-0 bg-cqNavy-900/90 text-cqTeal-300 font-mono text-[8px] px-1 rounded-tl">
                                    {doc.fileSize || 'SCAN'}
                                  </span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-dashed border-slate-200">
                                  <Clock size={12} />
                                  <span>Pending Upload</span>
                                </div>
                              )}
                            </td>

                            {/* 5. Status & Desk Notes */}
                            <td className="py-3.5 px-4">
                              <div className="space-y-1">
                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                                  isAccepted
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : isChanges
                                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                                    : isPending
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                  {isAccepted && <CheckCircle2 size={11} className="text-emerald-600" />}
                                  {isChanges && <AlertCircle size={11} className="text-rose-600" />}
                                  {isPending && <Clock size={11} className="text-amber-600" />}
                                  <span>
                                    {isAccepted ? 'Provisionally Approved' : isChanges ? 'Correction Needed' : isPending ? 'Awaiting Verification' : 'Not Uploaded'}
                                  </span>
                                </span>

                                {doc.adminFeedback && (
                                  <p className="text-[10px] text-slate-600 line-clamp-1 italic max-w-xs">
                                    "{doc.adminFeedback}"
                                  </p>
                                )}
                              </div>
                            </td>

                            {/* 6. Checker Action: Quick Approve / Decline */}
                            <td className="py-3.5 px-4 text-center">
                              {doc.fileUrl ? (
                                <div className="flex items-center justify-center gap-1.5">
                                  {/* Quick Approve Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleQuickSingleApprove(doc)}
                                    className={`p-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 ${
                                      isAccepted
                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                        : 'bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border-emerald-200'
                                    }`}
                                    title="Quick Approve document"
                                  >
                                    <Check size={13} />
                                    <span className="hidden sm:inline">Approve</span>
                                  </button>

                                  {/* Quick Decline / Correction Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenReviewModal(doc, 'changes_required')}
                                    className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center gap-1"
                                    title="Issue correction request or decline"
                                  >
                                    <X size={13} />
                                    <span className="hidden sm:inline">Decline</span>
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">
                                  No scan
                                </span>
                              )}
                            </td>

                            {/* 7. Management: Edit & Delete */}
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(doc)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-cqNavy-900 hover:bg-slate-100 transition-colors"
                                  title="Edit document specification"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenDeleteModal(doc)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Delete document requirement"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          );
        })}

        {filteredDocs.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
            <FileText size={36} className="mx-auto text-slate-300" />
            <h3 className="font-bold text-slate-900">No Documents Found</h3>
            <p className="text-xs text-slate-500">
              No credential records matched your current query "{searchQuery}" or status filter "{filterStatus}".
            </p>
            <button
              type="button"
              onClick={() => {
                setFilterStatus('all');
                setFilterCategory('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-800 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}

      </div>

      {/* =====================================================================
          MODAL 1: HIGH-RESOLUTION PHOTO PRE-LOAD INSPECTION MODAL
          ===================================================================== */}
      {inspectModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cqNavy-950 text-white flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-cqTeal-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>{inspectModalDoc.name}</span>
                    <span className="text-[10px] font-bold text-cqTeal-700 bg-cqTeal-50 px-2 py-0.5 rounded border border-cqTeal-200">
                      {inspectModalDoc.category}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {inspectModalDoc.fileName || 'document_scan.pdf'} • {inspectModalDoc.fileSize || '1.4 MB'}
                  </p>
                </div>
              </div>

              {/* Viewer Control Buttons: Zoom In, Zoom Out, Rotate, Close */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-200/70 rounded-xl p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
                    className="p-1.5 rounded-lg text-slate-700 hover:bg-white transition-colors"
                    title="Zoom in"
                  >
                    <ZoomIn size={16} />
                  </button>
                  <span className="text-[10px] font-mono font-bold text-slate-600 px-1">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
                    className="p-1.5 rounded-lg text-slate-700 hover:bg-white transition-colors"
                    title="Zoom out"
                  >
                    <ZoomOut size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="p-1.5 rounded-lg text-slate-700 hover:bg-white transition-colors"
                    title="Rotate 90 degrees"
                  >
                    <RotateCw size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setInspectModalDoc(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Document Interactive Viewport */}
            <div className="flex-1 overflow-auto bg-slate-900 p-6 flex items-center justify-center min-h-[420px]">
              {inspectModalDoc.fileUrl ? (
                <div
                  className="transition-transform duration-200 ease-out origin-center"
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`
                  }}
                >
                  <img
                    src={inspectModalDoc.fileUrl}
                    alt={inspectModalDoc.name}
                    className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-2xl border border-slate-800"
                  />
                </div>
              ) : (
                <div className="text-center text-slate-400">No high-resolution scan attached.</div>
              )}
            </div>

            {/* Inspection Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-500">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>GES Authenticated Document Preview • Achimota Registry Desk</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const docToReview = inspectModalDoc;
                    setInspectModalDoc(null);
                    handleOpenReviewModal(docToReview, 'changes_required');
                  }}
                  className="px-3.5 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-xl font-bold flex items-center gap-1.5"
                >
                  <AlertCircle size={14} />
                  <span>Request Correction</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const docToReview = inspectModalDoc;
                    setInspectModalDoc(null);
                    handleOpenReviewModal(docToReview, 'provisionally_accepted');
                  }}
                  className="px-4 py-1.5 bg-cqNavy-950 hover:bg-cqNavy-900 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 size={14} />
                  <span>Verify & Approve</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: OFFICIAL REVIEW DECISION MODAL (APPROVE / DECLINE)
          ===================================================================== */}
      {reviewModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 border border-slate-200 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cqNavy-50 text-cqNavy-900 flex items-center justify-center">
                  <ShieldCheck size={18} className="text-cqTeal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {reviewModal.isBatch ? 'Batch Review Decision' : 'Official Verification Decision'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Admissions Desk Verification Sign-off</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReviewModal({ isOpen: false, doc: null, isBatch: false })}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Target Target Info */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Scope:</span>
                <span className="font-bold text-slate-900">
                  {reviewModal.isBatch
                    ? `${selectedDocIds.length} Selected Credentials`
                    : reviewModal.doc?.name}
                </span>
              </div>
              {!reviewModal.isBatch && reviewModal.doc?.fileName && (
                <div className="flex items-center justify-between font-mono text-[11px] text-slate-500">
                  <span>Attached File:</span>
                  <span className="text-slate-800">{reviewModal.doc.fileName}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmitReviewDecision} className="space-y-4">
              
              {/* Decision Outcome Radio Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Official Outcome</label>
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

              {/* Presets List */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600">
                  Quick Official Presets:
                </span>
                <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
                  {(reviewAction === 'provisionally_accepted'
                    ? PRESET_FEEDBACKS.provisionally_accepted
                    : PRESET_FEEDBACKS.changes_required
                  ).map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFeedbackNote(preset)}
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

              {/* Custom Desk Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Official Verification Notes (Visible to Candidate & Parent)
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
                  onClick={() => setReviewModal({ isOpen: false, doc: null, isBatch: false })}
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

      {/* =====================================================================
          MODAL 3: ADD / EDIT DOCUMENT REQUIREMENT MODAL
          ===================================================================== */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 border border-slate-200 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cqNavy-900 text-white flex items-center justify-center">
                  {editModal.isNew ? <Plus size={18} className="text-cqTeal-400" /> : <Edit2 size={18} className="text-cqTeal-400" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editModal.isNew ? 'Add Document Requirement' : 'Edit Document Specification'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Registry Master Requirement Specification</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditModal({ isOpen: false, doc: null, isNew: false })}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitEditForm} className="space-y-4">
              
              {/* Document Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Document Title / Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="e.g., Baptismal Certificate, NHIS Card, BECE Results Slip..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Category</label>
                <div className="flex gap-2">
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                  >
                    {PRESET_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Requirement Description & Guidelines</label>
                <textarea
                  rows={2}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  placeholder="Provide clarity on what students/parents must supply..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                />
              </div>

              {/* Mandatory Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="mandatoryCheck"
                  checked={editFormData.required}
                  onChange={(e) => setEditFormData({ ...editFormData, required: e.target.checked })}
                  className="rounded border-slate-300 text-cqNavy-900 focus:ring-cqTeal-500 h-4 w-4 cursor-pointer"
                />
                <label htmlFor="mandatoryCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Mandatory for Admissions Clearance
                </label>
              </div>

              {/* Sample Photo Preview URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Photo Pre-load / Sample Scan URL (Optional)</label>
                <input
                  type="url"
                  value={editFormData.fileUrl}
                  onChange={(e) => setEditFormData({ ...editFormData, fileUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModal({ isOpen: false, doc: null, isNew: false })}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-cqNavy-950 hover:bg-cqNavy-900 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>{editModal.isNew ? 'Add Requirement' : 'Save Changes'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 4: DELETE CONFIRMATION MODAL
          ===================================================================== */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={22} />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-bold text-slate-900 text-base">
                Delete Document Requirement?
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Are you sure you want to remove <strong>"{deleteModal.doc?.name}"</strong> from the official admissions dossier checklist?
              </p>
            </div>

            <div className="p-3 bg-rose-50/60 rounded-2xl border border-rose-100 text-rose-800 text-[11px] flex items-center gap-2">
              <AlertTriangle size={16} className="text-rose-600 shrink-0" />
              <span>This requirement will be removed from all candidate checklists.</span>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, doc: null })}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
              >
                Confirm Delete
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 8. Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-cqNavy-950 text-white text-xs px-4 py-3 rounded-2xl shadow-xl border border-cqNavy-800 flex items-center gap-2.5 animate-fade-in">
          <Sparkles size={15} className="text-cqTeal-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
