/**
 * CitizenQueue - Official Senior High School Digital Prospectus
 * 
 * Route: `/prospectus`
 * 
 * Clean, precise, and categorized institutional prospectus checklist:
 * - Dropdown tray at top to toggle between Boys and Girls (adds gender items to general items list).
 * - Categorized sections: Item Name, Required Specification, Quantity, Ticking Box to tick/untick.
 * - Non-intrusive optional photo attachment for personal reference.
 * - Live readiness score and print/PDF support.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  School,
  User,
  Camera,
  Trash2,
  Printer,
  Search,
  Check,
  CheckSquare,
  X,
  ChevronDown,
  Shirt,
  Bed,
  Box,
  BookOpen,
  Sparkles,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { AdmissionService } from '../../services/admissionService';
import StageNavigation from '../../components/common/StageNavigation';

export default function DigitalProspectusPage() {
  const [prospectus, setProspectus] = useState([]);
  const [itemStatuses, setItemStatuses] = useState({});
  const [selectedGender, setSelectedGender] = useState('boy'); // 'boy' | 'girl'
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackToast, setFeedbackToast] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState(null);
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
    setTimeout(() => setFeedbackToast(''), 2200);
  };

  // Toggle single item acquired status
  const handleTogglePurchased = (itemId) => {
    const updated = AdmissionService.toggleItemPurchased(itemId);
    setItemStatuses({ ...updated });
    const isNowAcquired = updated[itemId]?.purchased;
    showToast(isNowAcquired ? 'Item marked as acquired ✓' : 'Item marked as pending');
  };

  // Optional image attachment
  const handlePhotoUpload = (e, item) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size exceeds 5MB limit.');
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
      showToast(`Photo attached for "${item.name}"`);
    };
    reader.readAsDataURL(file);
  };

  // Remove optional image
  const handleRemovePhoto = (e, itemId) => {
    e.stopPropagation();
    const updated = AdmissionService.removeItemPhoto(itemId);
    setItemStatuses({ ...updated });
    showToast('Photo removed');
  };

  // Print official prospectus
  const handlePrint = () => {
    window.print();
  };

  // 1. General items (targetGender === 'all')
  const generalItems = useMemo(() => {
    return prospectus.filter((item) => item.targetGender === 'all' || !item.targetGender);
  }, [prospectus]);

  // 2. Gender-specific items based on dropdown selection
  const genderSpecificItems = useMemo(() => {
    return prospectus.filter((item) => item.targetGender === selectedGender);
  }, [prospectus, selectedGender]);

  // 3. Combined active list: General items + Selected Gender items
  const activeItems = useMemo(() => {
    return [...generalItems, ...genderSpecificItems];
  }, [generalItems, genderSpecificItems]);

  // 4. Filter by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return activeItems;
    const q = searchQuery.toLowerCase();
    return activeItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.specification && item.specification.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q))
    );
  }, [activeItems, searchQuery]);

  // 5. Group active items by Category
  const categorizedItems = useMemo(() => {
    const groups = {};
    filteredItems.forEach((item) => {
      const cat = item.category || 'General Supplies';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(item);
    });
    return groups;
  }, [filteredItems]);

  // Overall readiness metrics
  const totalCount = activeItems.length;
  const acquiredCount = activeItems.filter((i) => itemStatuses[i.id]?.purchased).length;
  const remainingCount = totalCount - acquiredCount;
  const percentComplete = totalCount > 0 ? Math.round((acquiredCount / totalCount) * 100) : 0;

  // Mark all active items as acquired
  const handleMarkAllAcquired = () => {
    activeItems.forEach((i) => {
      AdmissionService.setItemPurchased(i.id, true);
    });
    setItemStatuses(AdmissionService.getStudentProspectusStatus());
    showToast('All active items marked as acquired ✓');
  };

  // Reset all active items
  const handleResetAcquired = () => {
    activeItems.forEach((i) => {
      AdmissionService.setItemPurchased(i.id, false);
    });
    setItemStatuses(AdmissionService.getStudentProspectusStatus());
    showToast('All items reset to pending');
  };

  // Helper for category icons
  const getCategoryIcon = (category) => {
    const c = category.toLowerCase();
    if (c.includes('cloth') || c.includes('uniform')) return <Shirt size={15} className="text-cqTeal-600" />;
    if (c.includes('bed')) return <Bed size={15} className="text-cqTeal-600" />;
    if (c.includes('storage') || c.includes('box') || c.includes('trunk')) return <Box size={15} className="text-cqTeal-600" />;
    if (c.includes('academic') || c.includes('book') || c.includes('stationery')) return <BookOpen size={15} className="text-cqTeal-600" />;
    return <Sparkles size={15} className="text-cqTeal-600" />;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-cqNavy-950 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-cqNavy-800 animate-fade-in">
          <CheckCircle2 size={15} className="text-cqTeal-400 shrink-0" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* 1. Header & Live Summary Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-cqTeal-700 bg-cqTeal-50 px-2.5 py-0.5 rounded-md border border-cqTeal-200">
              <School size={12} className="text-cqTeal-600" />
              <span>{profile.assignedSchool || 'Achimota Senior High School'}</span>
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              2026 Academic Year
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Student Prospectus Checklist
          </h1>
          <p className="text-xs text-slate-500">
            Tick items as acquired to track your readiness for physical reporting day.
          </p>
        </div>

        {/* Readiness Meter */}
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-3 sm:px-4 w-full md:w-auto shrink-0">
          <div className="text-center sm:text-left">
            <span className="text-2xl font-black text-slate-900 font-sans">
              {percentComplete}%
            </span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Acquired
            </p>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-800">
              {acquiredCount} of {totalCount} Items Ready
            </p>
            <div className="w-32 sm:w-40 bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500">
              {remainingCount === 0 ? 'All requirements complete' : `${remainingCount} remaining`}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Controls: Dropdown Tray & Search Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Dropdown Tray: Boys / Girls Toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
            <label
              htmlFor="gender-tray-select"
              className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 shrink-0"
            >
              <User size={13} className="text-cqTeal-600" />
              <span>Student Category:</span>
            </label>

            <div className="relative w-full sm:w-64">
              <select
                id="gender-tray-select"
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-300 hover:border-slate-400 font-bold text-xs text-slate-900 rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-cqTeal-500 focus:bg-white transition-all cursor-pointer shadow-2xs"
              >
                <option value="boy">👦 Boys (General + Boys Items)</option>
                <option value="girl">👧 Girls (General + Girls Items)</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              />
            </div>

            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200">
              {generalItems.length} General + {genderSpecificItems.length} {selectedGender === 'boy' ? 'Boys' : 'Girls'} = {totalCount} Items
            </span>
          </div>

          {/* Search & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Live Search */}
            <div className="relative flex-1 sm:w-56 min-w-[180px]">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items or specifications..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cqTeal-500 focus:bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Quick Actions */}
            <button
              type="button"
              onClick={handleMarkAllAcquired}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <CheckSquare size={13} className="text-cqTeal-600" />
              <span>Mark All</span>
            </button>

            <button
              type="button"
              onClick={handleResetAcquired}
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Reset acquisition status"
            >
              <RotateCcw size={13} />
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
              title="Print official prospectus"
            >
              <Printer size={13} />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>

        </div>
      </div>

      {/* 3. Categorized Items List */}
      <div className="space-y-6">
        {Object.keys(categorizedItems).map((categoryName) => {
          const items = categorizedItems[categoryName];
          const catAcquired = items.filter((i) => itemStatuses[i.id]?.purchased).length;
          const catTotal = items.length;
          const isCatComplete = catAcquired === catTotal && catTotal > 0;

          return (
            <div
              key={categoryName}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
            >
              
              {/* Category Header */}
              <div className="p-3.5 sm:px-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                    {getCategoryIcon(categoryName)}
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900">
                      {categoryName}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                      isCatComplete
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {catAcquired} of {catTotal} Acquired
                  </span>
                </div>
              </div>

              {/* Categorized Table Layout */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[580px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/40">
                      <th className="py-2.5 pl-4 pr-2 w-10 text-center">Status</th>
                      <th className="py-2.5 px-3 font-bold w-1/4">Item Name</th>
                      <th className="py-2.5 px-3 font-bold w-2/5">Required Specification</th>
                      <th className="py-2.5 px-3 font-bold w-24">Quantity</th>
                      <th className="py-2.5 pr-4 pl-3 font-bold w-36 text-right">Photo (Optional)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item) => {
                      const isAcquired = Boolean(itemStatuses[item.id]?.purchased);
                      const photoUrl = itemStatuses[item.id]?.photoUrl;
                      const isGenderSpecific = item.targetGender && item.targetGender !== 'all';

                      return (
                        <tr
                          key={item.id}
                          className={`group transition-colors ${
                            isAcquired
                              ? 'bg-emerald-50/20 hover:bg-emerald-50/40'
                              : 'hover:bg-slate-50/70'
                          }`}
                        >
                          {/* Ticking Box */}
                          <td className="py-3 pl-4 pr-2 text-center align-middle">
                            <button
                              type="button"
                              onClick={() => handleTogglePurchased(item.id)}
                              className="focus:outline-none focus:ring-2 focus:ring-cqTeal-500 rounded-md"
                              title={isAcquired ? 'Click to mark unacquired' : 'Click to tick as acquired'}
                            >
                              {isAcquired ? (
                                <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                  <Check size={13} strokeWidth={2.5} />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-md border-2 border-slate-300 hover:border-slate-400 bg-white transition-colors" />
                              )}
                            </button>
                          </td>

                          {/* Item Name & Target Badge */}
                          <td className="py-3 px-3 align-middle">
                            <div className="space-y-0.5">
                              <span
                                onClick={() => handleTogglePurchased(item.id)}
                                className={`font-bold cursor-pointer transition-colors block ${
                                  isAcquired ? 'text-slate-600 line-through' : 'text-slate-900 group-hover:text-cqNavy-900'
                                }`}
                              >
                                {item.name}
                              </span>
                              {isGenderSpecific ? (
                                <span className="inline-block text-[10px] font-semibold text-cqTeal-700 bg-cqTeal-50 px-1.5 py-0.2 rounded border border-cqTeal-200">
                                  {item.targetGender === 'boy' ? '👦 Boys Only' : '👧 Girls Only'}
                                </span>
                              ) : (
                                <span className="inline-block text-[10px] font-medium text-slate-400">
                                  General Requirement
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Required Specification */}
                          <td className="py-3 px-3 align-middle text-slate-600 leading-snug">
                            <span>{item.specification || item.description}</span>
                            {item.referenceNotes && (
                              <span className="block text-[11px] text-slate-400 italic mt-0.5">
                                Note: {item.referenceNotes}
                              </span>
                            )}
                          </td>

                          {/* Quantity */}
                          <td className="py-3 px-3 align-middle whitespace-nowrap">
                            <span className="font-bold text-[11px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200 font-mono">
                              {item.quantity}
                            </span>
                          </td>

                          {/* Optional Photo Attachment */}
                          <td className="py-3 pr-4 pl-3 align-middle text-right whitespace-nowrap">
                            {photoUrl ? (
                              <div className="inline-flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
                                <button
                                  type="button"
                                  onClick={() => setPreviewPhoto({ item, photoUrl })}
                                  className="w-6 h-6 rounded overflow-hidden bg-slate-900 relative group/thumb shrink-0"
                                  title="View photo"
                                >
                                  <img
                                    src={photoUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover/thumb:opacity-75"
                                  />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleRemovePhoto(e, item.id)}
                                  className="text-slate-400 hover:text-rose-600 p-0.5"
                                  title="Remove photo"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ) : (
                              <label className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-[11px] font-medium text-slate-500 cursor-pointer transition-colors">
                                <Camera size={12} className="text-slate-400" />
                                <span>Add Photo</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handlePhotoUpload(e, item)}
                                  className="hidden"
                                />
                              </label>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
            No items match the current search filter.
          </div>
        )}
      </div>

      {/* 4. Stage Navigation: Back to Profile, Next to Document Centre */}
      <StageNavigation
        prevHref="/profile"
        prevLabel="Back to Admission Profile"
        nextHref="/documents"
        nextLabel="Proceed to Document Centre"
        currentStage="Stage 3 of 9"
        stageTitle="Digital Prospectus & Supplies Acquisition"
      />

      {/* 5. Photo Modal Preview */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-xs font-bold text-slate-900 truncate pr-2">
                {previewPhoto.item.name}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-3 bg-slate-900 flex items-center justify-center min-h-[240px]">
              <img
                src={previewPhoto.photoUrl}
                alt={previewPhoto.item.name}
                className="max-h-[50vh] max-w-full object-contain rounded-lg"
              />
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500">
                Optional student reference photo
              </span>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="px-3 py-1.5 bg-cqNavy-950 text-white rounded-lg font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
