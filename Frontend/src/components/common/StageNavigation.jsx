/**
 * CitizenQueue - Stage Navigation Bar Component
 * 
 * Provides consistent "Back" and "Next" controls across all admission stages,
 * guiding students sequentially through their admission journey.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function StageNavigation({
  prevHref,
  prevLabel = 'Previous Stage',
  nextHref,
  nextLabel = 'Next Stage',
  currentStage = '',
  stageTitle = '',
  onNext = null,
  nextDisabled = false,
  isSubmitting = false
}) {
  const navigate = useNavigate();

  const handleNextClick = (e) => {
    if (nextDisabled || isSubmitting) return;
    if (onNext) {
      onNext(e);
    } else if (nextHref) {
      navigate(nextHref);
    }
  };

  const handlePrevClick = () => {
    if (prevHref) {
      navigate(prevHref);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
      {/* Back Button */}
      <div className="w-full sm:w-auto">
        {prevHref ? (
          <button
            type="button"
            onClick={handlePrevClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-sm font-semibold transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>{prevLabel}</span>
          </button>
        ) : (
          <div className="hidden sm:block w-28" />
        )}
      </div>

      {/* Stage Progress Info */}
      {(currentStage || stageTitle) && (
        <div className="text-center order-first sm:order-none">
          {currentStage && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-cqTeal-700 bg-cqTeal-50 px-2.5 py-0.5 rounded-full border border-cqTeal-100">
              {currentStage}
            </span>
          )}
          {stageTitle && (
            <p className="text-xs font-semibold text-slate-700 mt-1">
              {stageTitle}
            </p>
          )}
        </div>
      )}

      {/* Next Button */}
      <div className="w-full sm:w-auto">
        {nextHref || onNext ? (
          <button
            type="button"
            onClick={handleNextClick}
            disabled={nextDisabled || isSubmitting}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
              nextDisabled || isSubmitting
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-cqTeal-600 hover:bg-cqTeal-700 text-white shadow-cqTeal-600/20 active:scale-[0.98]'
            }`}
          >
            <span>{isSubmitting ? 'Saving...' : nextLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="hidden sm:block w-28" />
        )}
      </div>
    </div>
  );
}
