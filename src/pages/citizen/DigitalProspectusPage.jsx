/**
 * CitizenQueue - Official Senior High School Digital Prospectus
 * 
 * Route: `/prospectus`
 * 
 * Official, comprehensive digital prospectus structured into two core sections:
 * 1. General Requirements (Mandatory for ALL students regardless of gender).
 * 2. Gender-Specific Panel with interactive toggle for Male and Female student requirements.
 * 
 * Features:
 * - Straightforward item acquisition checklist (progress saves automatically).
 * - Optional image attachment: candidates may optionally upload a photo of any item
 *   for personal verification or recordkeeping (strictly optional, not required for readiness).
 * - Official Ghana Education Service (GES) institutional structure & styling.
 * - Live readiness meter, category filtering, search, and official PDF print support.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  CheckCircle2,
  School,
  User,
  Users,
  Camera,
  Trash2,
  Printer,
  Search,
  Filter,
  Info,
  Check,
  X,
  ZoomIn
} from 'lucide-react';
import { AdmissionService } from '../../services/admissionService';
import StageNavigation from '../../components/common/StageNavigation';

export default function DigitalProspectusPage() {
  const [prospectus, setProspectus] = useState([]);
  const [itemStatuses, setItemStatuses] = useState({});
  const [selectedGender, setSelectedGender] = useState('boy'); // 'boy' | 'girl'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [feedbackToast, setFeedbackToast] = useState('');
  
  // Image preview modal state
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const fileInputRefs = useRef({});
  const profile = AdmissionService.getProfile();

  useEffect(() => {
    setProspectus(AdmissionService.getProspectus());
    setItemStatuses(AdmissionService.getStudentProspectusStatus());

    // Auto-detect gender preference from profile if available
    if (profile?.gender) {
      const g = profile.gender.toLowerCase();
      if (g.includes('fem') || g.includes('girl') || g.includes('woman')) {
        setSelectedGender('girl');
      } else {
        setSelectedGender('boy');
      }
    }
  }, []);

  const showToast = (msg) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(''), 2500);
  };

  // Toggle item purchased / acquired
  const handleTogglePurchased = (itemId) => {
    const updated = AdmissionService.toggleItemPurchased(itemId);
    setItemStatuses({ ...updated });
    const isNowAcquired = updated[itemId]?.purchased;
    showToast(isNowAcquired ? 'Item marked as acquired ✓' : 'Item marked as pending');
  };

  // Optional image attachment handler
  const handlePhotoUpload = (e, item) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size exceeds 5MB limit. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      const updated = AdmissionService.submitItemPhoto(item.id, {
        photoUrl: dataUrl,
        photoName: file.name
      });
      setItemStatuses({ ...updated });
      showToast(`Optional photo attached for "${item.name}"`);
    };
    reader.readAsDataURL(file);
  };

  // Remove optional image
  const handleRemovePhoto = (e, itemId) => {
    e.stopPropagation();
    const updated = AdmissionService.removeItemPhoto(itemId);
    setItemStatuses({ ...updated });
    showToast('Optional photo removed');
  };

  const handlePrint = () => {
    window.print();
  };

  // Partition items into General (targetGender === 'all') and Gender-Specific
  const generalItems = useMemo(() => {
    return prospectus.filter((item) => item.targetGender === 'all' || !item.targetGender);
  }, [prospectus]);

  const genderSpecificItems = useMemo(() => {
    return prospectus.filter((item) => item.targetGender === selectedGender);
  }, [prospectus, selectedGender]);

  // Compute metrics for active view (General items + active gender items)
  const activeViewItems = useMemo(() => {
    return [...generalItems, ...genderSpecificItems];
  }, [generalItems, genderSpecificItems]);

  // Filtered lists based on search & category
  const filterItem = (item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.specification && item.specification.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  };

  const filteredGeneralItems = generalItems.filter(filterItem);
  const filteredGenderItems = genderSpecificItems.filter(filterItem);

  const totalActive = activeViewItems.length;
  const acquiredActive = activeViewItems.filter(
    (item) => itemStatuses[item.id]?.purchased
  ).length;
  const photosAttachedCount = activeViewItems.filter(
    (item) => itemStatuses[item.id]?.photoUrl
  ).length;
  const percentComplete = totalActive > 0 ? Math.round((acquiredActive / totalActive) * 100) : 0;

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(activeViewItems.map((i) => i.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [activeViewItems]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8 animate-fade-in">
      
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-cqNavy-950 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-cqNavy-800 animate-fade-in">
          <CheckCircle2 size={16} className="text-cqTeal-400 shrink-0" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* 1. Official Institutional Prospectus Header */}
      <div className="bg-gradient-to-r from-cqNavy-950 via-cqNavy-900 to-cqNavy-950 rounded-3xl p-6 sm:p-8 text-white border border-cqNavy-800 shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-cqTeal-300 bg-cqNavy-800/90 px-3 py-1 rounded-full border border-cqNavy-700">
              <School size={13} className="text-cqTeal-400" />
              <span>{profile.assignedSchool || 'Achimota Senior High School'}</span>
            </span>
            <span className="text-xs text-slate-300 bg-cqNavy-800/60 px-2.5 py-1 rounded-full border border-cqNavy-700/60">
              Official 2026 Academic Cycle Prospectus
            </span>
            <span className="text-xs text-emerald-400 font-semibold bg-cqNavy-900 px-2.5 py-1 rounded-full border border-cqNavy-700/60">
              GES Approved Specifications
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            Digital Prospectus & Required Supplies
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Approved checklist of mandatory boarding, academic, and personal supplies. Mark items as you acquire them to track your reporting day readiness. Optional photos can be attached for your personal reference.
          </p>
        </div>

        {/* Readiness Meter Card */}
        <div className="bg-cqNavy-900/90 border border-cqNavy-700/80 rounded-2xl p-5 flex items-center gap-5 shrink-0 w-full lg:w-auto shadow-inner">
          <div className="text-center sm:text-right">
            <div className="text-3xl sm:text-4xl font-black text-cqTeal-400 font-sans">
              {percentComplete}%
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Readiness Score
            </p>
          </div>
          
          <div className="h-12 w-px bg-cqNavy-800" />
          
          <div className="space-y-1">
            <p className="text-sm font-extrabold text-white">
              {acquiredActive} of {totalActive} Acquired
            </p>
            <p className="text-xs text-slate-300">
              {totalActive - acquiredActive === 0 ? (
                <span className="text-emerald-400 font-semibold">All supplies complete ✓</span>
              ) : (
                <span>{totalActive - acquiredActive} items remaining</span>
              )}
            </p>
            <div className="w-36 bg-cqNavy-950 rounded-full h-1.5 overflow-hidden border border-cqNavy-700">
              <div
                className="bg-cqTeal-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Controls & Search Toolbar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Live Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prospectus items (e.g. trunk, uniform, maths set, soap)..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Quick Actions & Print */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                activeViewItems.forEach((i) => {
                  AdmissionService.setItemPurchased(i.id, true);
                });
                setItemStatuses(AdmissionService.getStudentProspectusStatus());
                showToast('All items marked as acquired ✓');
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <CheckSquare size={13} className="text-cqTeal-600" />
              <span>Mark All Acquired</span>
            </button>

            <button
              type="button"
              onClick={() => {
                activeViewItems.forEach((i) => {
                  AdmissionService.setItemPurchased(i.id, false);
                });
                setItemStatuses(AdmissionService.getStudentProspectusStatus());
                showToast('Acquisition status reset');
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-colors"
            >
              Reset
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
              title="Print official prospectus"
            >
              <Printer size={13} />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
          </div>

        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0 flex items-center gap-1">
            <Filter size={11} />
            Category:
          </span>
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl font-semibold capitalize whitespace-nowrap transition-all ${
                  active
                    ? 'bg-cqNavy-950 text-white shadow-xs font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {cat === 'all' ? 'All Supplies' : cat}
              </button>
            );
          })}
        </div>

      </div>

      {/* Official Pre-Arrival Guidance Notice */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-start gap-2.5">
          <Info size={17} className="text-cqTeal-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-slate-900">
              Physical Verification on School Premises:
            </p>
            <p className="text-slate-600 leading-relaxed">
              All physical items are inspected upon your scheduled arrival at the house of residence. Photo addition is strictly optional and not mandatory for arrival clearance.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-cqTeal-700 bg-cqTeal-50 border border-cqTeal-200 px-2.5 py-1 rounded-xl shrink-0">
          Photos Attached: {photosAttachedCount} (Optional)
        </span>
      </div>

      {/* ========================================================================= */}
      {/* PARTITION 1: GENERAL REQUIREMENTS (REQUIRED FOR ALL STUDENTS REGARDLESS OF GENDER) */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cqNavy-950 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-1 ring-cqNavy-800/20 shrink-0">
              <Users size={18} className="text-cqTeal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">
                  Partition 1: General School Requirements
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-cqNavy-900 text-white px-2 py-0.5 rounded-md">
                  All Students
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Mandatory supplies and academic provisions required from every student irrespective of gender.
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 self-start sm:self-auto shrink-0">
            {filteredGeneralItems.length} General Items
          </span>
        </div>

        {/* General Items Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGeneralItems.map((item) => (
            <ProspectusItemCard
              key={item.id}
              item={item}
              status={itemStatuses[item.id]}
              onTogglePurchased={() => handleTogglePurchased(item.id)}
              onPhotoUpload={(e) => handlePhotoUpload(e, item)}
              onRemovePhoto={(e) => handleRemovePhoto(e, item.id)}
              onPreviewPhoto={(photoUrl) => setPreviewPhoto({ item, photoUrl })}
              fileInputRef={(el) => (fileInputRefs.current[item.id] = el)}
            />
          ))}
        </div>

        {filteredGeneralItems.length === 0 && (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
            No general requirements match the current search or category filter.
          </div>
        )}

      </section>

      {/* ========================================================================= */}
      {/* PARTITION 2: GENDER-SPECIFIC REQUIREMENTS PANEL (INTERACTIVE TRAY TOGGLE) */}
      {/* ========================================================================= */}
      <section className="space-y-4 pt-6 border-t border-slate-200">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cqTeal-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
              <User size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">
                  Partition 2: Gender-Specific Provisions Panel
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-cqTeal-50 text-cqTeal-800 border border-cqTeal-200 px-2 py-0.5 rounded-md">
                  Gender Specific
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Tailored uniform cuts, grooming articles, and personal provisions for male or female students.
              </p>
            </div>
          </div>

          {/* Interactive Male / Female Tray Toggle */}
          <div className="flex items-center p-1.5 bg-slate-100 rounded-2xl border border-slate-200/90 shadow-2xs self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setSelectedGender('boy')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedGender === 'boy'
                  ? 'bg-cqNavy-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span>👦</span>
              <span>Male Requirements</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGender('girl')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedGender === 'girl'
                  ? 'bg-cqNavy-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span>👧</span>
              <span>Female Requirements</span>
            </button>
          </div>
        </div>

        {/* Gender Panel Notice */}
        <div className="p-3.5 bg-cqNavy-950 text-white rounded-2xl flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">
              {selectedGender === 'boy' ? '👦' : '👧'}
            </span>
            <span>
              Displaying official prospectus items for{' '}
              <strong className="text-cqTeal-300 capitalize">
                {selectedGender === 'boy' ? 'Male (Boys)' : 'Female (Girls)'} Students
              </strong>
            </span>
          </div>
          <span className="text-[11px] text-slate-300 font-mono">
            {filteredGenderItems.length} Tailored Items
          </span>
        </div>

        {/* Gender Items Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGenderItems.map((item) => (
            <ProspectusItemCard
              key={item.id}
              item={item}
              status={itemStatuses[item.id]}
              onTogglePurchased={() => handleTogglePurchased(item.id)}
              onPhotoUpload={(e) => handlePhotoUpload(e, item)}
              onRemovePhoto={(e) => handleRemovePhoto(e, item.id)}
              onPreviewPhoto={(photoUrl) => setPreviewPhoto({ item, photoUrl })}
              fileInputRef={(el) => (fileInputRefs.current[item.id] = el)}
            />
          ))}
        </div>

        {filteredGenderItems.length === 0 && (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
            No gender-specific requirements match the current search or category filter.
          </div>
        )}

      </section>

      {/* 3. Stage Navigation: Back to Profile, Next to Document Centre */}
      <StageNavigation
        prevHref="/profile"
        prevLabel="Back to Admission Profile"
        nextHref="/documents"
        nextLabel="Proceed to Document Centre"
        currentStage="Stage 3 of 9"
        stageTitle="Digital Prospectus & Supplies Acquisition"
      />

      {/* 4. Fullscreen Photo Preview Modal */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{previewPhoto.item.name}</h3>
                <p className="text-[11px] text-slate-500">Optional Candidate Verification Photo</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 bg-slate-900 flex items-center justify-center min-h-[300px]">
              <img
                src={previewPhoto.photoUrl}
                alt={previewPhoto.item.name}
                className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-lg"
              />
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 italic">
                Photo attached for student personal recordkeeping.
              </span>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="px-4 py-2 bg-cqNavy-950 text-white rounded-xl font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/**
 * Sub-component for an Individual Prospectus Item Card
 * Features clear acquisition toggle, quantity, specifications, and optional photo attachment
 */
function ProspectusItemCard({
  item,
  status,
  onTogglePurchased,
  onPhotoUpload,
  onRemovePhoto,
  onPreviewPhoto,
  fileInputRef
}) {
  const isAcquired = Boolean(status?.purchased);
  const photoUrl = status?.photoUrl;
  const photoName = status?.photoName;

  return (
    <div
      className={`p-4 sm:p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-3.5 shadow-2xs ${
        isAcquired
          ? 'border-emerald-200 bg-emerald-50/30'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      
      {/* Top Details & Checkbox */}
      <div className="space-y-2.5">
        
        <div className="flex items-start justify-between gap-3">
          
          {/* Checkbox & Item Name */}
          <div
            onClick={onTogglePurchased}
            className="flex items-start gap-3 cursor-pointer select-none flex-1 min-w-0"
          >
            <div className="mt-0.5 shrink-0">
              {isAcquired ? (
                <div className="w-5 h-5 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Check size={14} />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-lg border-2 border-slate-300 hover:border-cqTeal-500 bg-white transition-colors" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  className={`text-sm font-bold truncate ${
                    isAcquired ? 'text-emerald-950 line-through opacity-85' : 'text-slate-900'
                  }`}
                >
                  {item.name}
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {item.category}
              </p>
            </div>
          </div>

          {/* Quantity Badge */}
          <span className="text-xs font-black font-mono px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 shrink-0">
            Qty: {item.quantity}
          </span>
        </div>

        {/* Specification & Notes */}
        <p className="text-xs text-slate-600 leading-relaxed pl-8">
          {item.specification || item.description}
        </p>

        {item.referenceNotes && (
          <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100 pl-3 ml-8 italic">
            <strong>School Note:</strong> {item.referenceNotes}
          </p>
        )}
      </div>

      {/* Bottom Row: Optional Image Attachment & Status Pill */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
        
        {/* Optional Image Section */}
        <div className="flex items-center gap-2">
          {photoUrl ? (
            <div className="flex items-center gap-2 bg-slate-100 p-1 pl-1.5 pr-2 rounded-xl border border-slate-200">
              <div
                onClick={() => onPreviewPhoto(photoUrl)}
                className="w-7 h-7 rounded-lg overflow-hidden bg-slate-900 cursor-pointer relative group shrink-0"
                title="Click to view full photo"
              >
                <img
                  src={photoUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ZoomIn size={10} className="text-white" />
                </div>
              </div>

              <span
                onClick={() => onPreviewPhoto(photoUrl)}
                className="text-[10px] font-bold text-slate-700 cursor-pointer hover:underline truncate max-w-[90px] sm:max-w-[120px]"
                title={photoName || 'Item Photo'}
              >
                {photoName || 'Photo Attached'}
              </span>

              <button
                type="button"
                onClick={onRemovePhoto}
                className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                title="Remove optional photo"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ) : (
            <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-dashed border-slate-300 hover:border-cqTeal-500 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-600 cursor-pointer transition-all">
              <Camera size={13} className="text-cqTeal-600" />
              <span>Add Photo (Optional)</span>
              <input
                type="file"
                accept="image/*"
                onChange={onPhotoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Acquired Toggle Button */}
        <button
          type="button"
          onClick={onTogglePurchased}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            isAcquired
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          {isAcquired ? 'Acquired ✓' : 'Mark Acquired'}
        </button>

      </div>

    </div>
  );
}
