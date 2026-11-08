/**
 * CitizenQueue - Demonstration Banner
 * 
 * Prominently visible indicator that this is a prototype, offering quick demo role
 * switching and prototype state reset.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, RotateCcw, User, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { resetPrototypeStorage } from '../../services/storageService';

export default function DemoBanner() {
  const { currentUser, loginAsCitizen, loginAsAdmin } = useAuth();
  const navigate = useNavigate();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleReset = () => {
    resetPrototypeStorage();
    setResetDone(true);
    setShowResetConfirm(false);
    setTimeout(() => {
      setResetDone(false);
      window.location.reload();
    }, 800);
  };

  return (
    <>
      <div className="bg-cqNavy-950 text-slate-200 border-b border-cqNavy-800 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-semibold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600/50">
              <AlertCircle size={12} />
              PROTOTYPE DEMONSTRATION
            </span>
            <span className="hidden sm:inline text-slate-300">
              All institution and appointment data is fictional. No real appointments are booked.
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Quick Role Switchers */}
            <div className="flex items-center bg-cqNavy-900 rounded-md p-0.5 border border-cqNavy-700">
              <button
                type="button"
                onClick={() => {
                  loginAsCitizen();
                  navigate('/dashboard');
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
                  currentUser?.role === 'citizen'
                    ? 'bg-cqTeal-600 text-white font-medium shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Switch to Citizen demonstration view"
              >
                <User size={12} />
                Citizen Mode
              </button>

              <button
                type="button"
                onClick={() => {
                  loginAsAdmin();
                  navigate('/admin');
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
                  currentUser?.role === 'admin'
                    ? 'bg-cqTeal-600 text-white font-medium shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Switch to School Administrator demonstration view"
              >
                <ShieldCheck size={12} />
                Admin Mode
              </button>
            </div>

            {/* Prototype Reset Button */}
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 hover:bg-cqNavy-800 px-2 py-1 rounded transition-colors text-xs"
              title="Reset demonstration data to original state"
            >
              <RotateCcw size={12} />
              <span className="hidden md:inline">Reset Demo Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                <RotateCcw size={22} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 text-base">
                  Reset Demonstration Data?
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  This will restore all demo institutions, services, appointments, and capacity slots to their initial state. Any new demo bookings or edits you made will be refreshed.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-white bg-cqNavy-900 hover:bg-cqNavy-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <RotateCcw size={14} />
                Yes, Reset All Demo Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast feedback on reset */}
      {resetDone && (
        <div className="fixed bottom-4 right-4 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-sm">
          <Check size={16} />
          Demo data reset to original defaults! Reloading...
        </div>
      )}
    </>
  );
}
