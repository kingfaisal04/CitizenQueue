/**
 * CitizenQueue - Digital Prospectus Management
 * 
 * Route: `/prospectus`
 * 
 * Interactive digital prospectus partitioned into:
 * 1. General items needed from every student (School-wide requirements)
 * 2. Gender-specific items with an interactive tray toggle (Boy / Girl)
 * 
 * Listings are concise with short explanations and straightforward acquisition checkboxes.
 * Image/photo upload is removed from prospectus verification.
 * Includes "Back" and "Next" stage navigation.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  Circle,
  School,
  Sparkles,
  User,
  Users
} from 'lucide-react';
import { AdmissionService } from '../../services/admissionService';
import StageNavigation from '../../components/common/StageNavigation';

export default function DigitalProspectusPage() {
  const [prospectus, setProspectus] = useState([]);
  const [itemStatuses, setItemStatuses] = useState({});
  const [selectedGender, setSelectedGender] = useState('boy');
  const [feedbackToast, setFeedbackToast] = useState('');

  const profile = AdmissionService.getProfile();

  useEffect(() => {
    setProspectus(AdmissionService.getProspectus());
    setItemStatuses(AdmissionService.getStudentProspectusStatus());

    // Auto-select gender from student profile if available
    if (profile?.gender) {
      const g = profile.gender.toLowerCase();
      if (g.includes('fem') || g.includes('girl')) {
        setSelectedGender('girl');
      } else {
        setSelectedGender('boy');
      }
    }
  }, []);

  // Toggle item purchased / acquired
  const handleTogglePurchased = (itemId) => {
    const updated = AdmissionService.toggleItemPurchased(itemId);
    setItemStatuses({ ...updated });
    showToast('Item acquisition status updated');
  };

  const showToast = (msg) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(''), 2200);
  };

  // Partition items into General (targetGender === 'all') and Gender-Specific
  const generalItems = useMemo(() => {
    return prospectus.filter((item) => item.targetGender === 'all' || !item.targetGender);
  }, [prospectus]);

  const genderSpecificItems = useMemo(() => {
    return prospectus.filter((item) => item.targetGender === selectedGender);
  }, [prospectus, selectedGender]);

  // Compute metrics for active view (General items + currently active gender items)
  const activeViewItems = useMemo(() => {
    return [...generalItems, ...genderSpecificItems];
  }, [generalItems, genderSpecificItems]);

  const totalActive = activeViewItems.length;
  const acquiredActive = activeViewItems.filter(
    (item) => itemStatuses[item.id]?.purchased
  ).length;
  const percentComplete = totalActive > 0 ? Math.round((acquiredActive / totalActive) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8 animate-fade-in">
      
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cqNavy-950 to-cqNavy-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cqTeal-300 bg-cqNavy-800/80 px-2.5 py-1 rounded-full border border-cqNavy-700">
            <School size={12} />
            <span>{profile.assignedSchool || 'Senior High School'} Official Prospectus</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Digital Prospectus & Requirements
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Track mandatory school supplies before reporting. Check off items as you purchase them to verify your readiness.
          </p>
        </div>

        {/* Readiness Meter */}
        <div className="bg-cqNavy-900/90 border border-cqNavy-700 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shrink-0">
          <div className="text-center sm:text-right">
            <div className="text-2xl sm:text-3xl font-black text-cqTeal-400">
              {percentComplete}%
            </div>
            <p className="text-xs text-slate-400 font-medium">Acquired</p>
          </div>
          <div className="h-10 w-px bg-cqNavy-800" />
          <div>
            <p className="text-sm font-bold text-white">
              {acquiredActive} of {totalActive} Items
            </p>
            <p className="text-[11px] text-slate-400">
              {totalActive - acquiredActive} items remaining
            </p>
          </div>
        </div>
      </div>

      {/* Fast Check-all / Uncheck Helper */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 shadow-xs">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-cqTeal-600" />
          <span>
            Click on any item card to toggle its acquired status. Your progress saves automatically.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              activeViewItems.forEach((i) => {
                AdmissionService.setItemPurchased(i.id, true);
              });
              setItemStatuses(AdmissionService.getStudentProspectusStatus());
              showToast('All items marked as acquired');
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
          >
            Mark All Acquired
          </button>
          <button
            type="button"
            onClick={() => {
              activeViewItems.forEach((i) => {
                AdmissionService.setItemPurchased(i.id, false);
              });
              setItemStatuses(AdmissionService.getStudentProspectusStatus());
              showToast('Acquisition status cleared');
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
          >
            Reset Status
          </button>
        </div>
      </div>

      {/* PARTITION 1: GENERAL ITEMS NEEDED FROM EVERY STUDENT */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cqNavy-900 text-cqTeal-400 flex items-center justify-center font-bold text-xs shadow-xs">
              <Users size={16} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                1. General Items (Required from Every Student)
              </h2>
              <p className="text-xs text-slate-500">
                Official institutional supplies applicable to all admitted students regardless of gender.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {generalItems.length} Items
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {generalItems.map((item) => {
            const isAcquired = Boolean(itemStatuses[item.id]?.purchased);

            return (
              <div
                key={item.id}
                onClick={() => handleTogglePurchased(item.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  isAcquired
                    ? 'border-emerald-300 bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                {/* Checkbox Icon */}
                <div className="mt-0.5 shrink-0">
                  {isAcquired ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3
                      className={`text-sm font-bold truncate ${
                        isAcquired ? 'text-emerald-950 line-through opacity-80' : 'text-slate-900'
                      }`}
                    >
                      {item.name}
                    </h3>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 shrink-0">
                      {item.quantity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1 leading-relaxed">
                    {item.specification || item.description}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">{item.category}</span>
                    <span
                      className={`font-semibold ${
                        isAcquired ? 'text-emerald-700 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {isAcquired ? 'Acquired ✓' : 'Tap to mark acquired'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* PARTITION 2: GENDER-SPECIFIC REQUIREMENTS WITH TRAY SELECTOR */}
      <section className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cqTeal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <User size={16} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                2. Gender-Specific Uniforms & Personal Items
              </h2>
              <p className="text-xs text-slate-500">
                Select your gender tray below to view tailored clothing and grooming items.
              </p>
            </div>
          </div>

          {/* Tray Selector Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSelectedGender('boy')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedGender === 'boy'
                  ? 'bg-cqNavy-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👦</span>
              <span>Boy Prospectus</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedGender('girl')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedGender === 'girl'
                  ? 'bg-cqNavy-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👧</span>
              <span>Girl Prospectus</span>
            </button>
          </div>
        </div>

        {/* Gender Tray Notice */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
          <span>
            Currently viewing: <strong className="text-slate-900 capitalize">{selectedGender} Student Requirements</strong>
          </span>
          <span className="text-[11px] font-semibold text-slate-500">
            {genderSpecificItems.length} specific items
          </span>
        </div>

        {/* Gender items list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {genderSpecificItems.map((item) => {
            const isAcquired = Boolean(itemStatuses[item.id]?.purchased);

            return (
              <div
                key={item.id}
                onClick={() => handleTogglePurchased(item.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  isAcquired
                    ? 'border-emerald-300 bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                {/* Checkbox Icon */}
                <div className="mt-0.5 shrink-0">
                  {isAcquired ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3
                      className={`text-sm font-bold truncate ${
                        isAcquired ? 'text-emerald-950 line-through opacity-80' : 'text-slate-900'
                      }`}
                    >
                      {item.name}
                    </h3>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 shrink-0">
                      {item.quantity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1 leading-relaxed">
                    {item.specification || item.description}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">{item.category}</span>
                    <span
                      className={`font-semibold ${
                        isAcquired ? 'text-emerald-700 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {isAcquired ? 'Acquired ✓' : 'Tap to mark acquired'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stage Navigation: Back to Profile, Next to Document Centre */}
      <StageNavigation
        prevHref="/profile"
        prevLabel="Back to Admission Profile"
        nextHref="/documents"
        nextLabel="Proceed to Document Centre"
        currentStage="Stage 3 of 9"
        stageTitle="Digital Prospectus & Supplies"
      />
    </div>
  );
}
