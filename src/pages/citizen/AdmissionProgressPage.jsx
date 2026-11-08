/**
 * CitizenQueue - Admission Progress & Visual Timeline
 * 
 * Route: `/progress`
 * 
 * Interactive 9-stage visual roadmap representing the student's complete journey
 * from initial CSSPS placement to physical verification and campus enrollment.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronRight,
  School
} from 'lucide-react';
import { AdmissionService } from '../../services/admissionService';
import StageNavigation from '../../components/common/StageNavigation';

export default function AdmissionProgressPage() {
  const [metrics, setMetrics] = useState(null);

  const loadProgress = () => {
    setMetrics(AdmissionService.getReadinessMetrics());
  };

  useEffect(() => {
    loadProgress();
  }, []);

  if (!metrics) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-slate-500">
        Loading admission timeline...
      </div>
    );
  }

  const { currentStage, stages, compositeScore, activeAppointment, isReadyForReporting } = metrics;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8 animate-fade-in">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-cqNavy-950 to-cqNavy-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cqTeal-300 bg-cqNavy-800/80 px-2.5 py-1 rounded-full border border-cqNavy-700">
            <School size={12} />
            <span>Admission Orchestration Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Admission Progress & Journey
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Track your journey through each administrative stage. Ensure all pre-arrival steps are verified before attending your scheduled reporting visit.
          </p>
        </div>

        {/* Current Stage Indicator */}
        <div className="bg-cqNavy-900/90 border border-cqNavy-700 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shrink-0">
          <div>
            <p className="text-xs text-slate-400 font-medium">Current Status</p>
            <p className="text-xl font-black text-white">Stage {currentStage} of 9</p>
            <p className="text-[11px] text-cqTeal-300 font-semibold">
              {compositeScore}% Overall Readiness
            </p>
          </div>
        </div>
      </div>

      {/* Readiness Overview Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Profile Details</p>
            <p className="text-base font-bold text-slate-900">
              {metrics.profileComplete ? '100% Completed' : 'Incomplete'}
            </p>
          </div>
          <Link to="/profile" className="text-cqTeal-600 hover:text-cqTeal-700 text-xs font-semibold flex items-center gap-1">
            <span>Manage</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Prospectus Items</p>
            <p className="text-base font-bold text-slate-900">
              {metrics.purchasedCount}/{metrics.totalProspectusItems} Ready
            </p>
          </div>
          <Link to="/prospectus" className="text-cqTeal-600 hover:text-cqTeal-700 text-xs font-semibold flex items-center gap-1">
            <span>Inspect</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Admission Documents</p>
            <p className="text-base font-bold text-slate-900">
              {metrics.docsAccepted} Verified
            </p>
          </div>
          <Link to="/documents" className="text-cqTeal-600 hover:text-cqTeal-700 text-xs font-semibold flex items-center gap-1">
            <span>Review</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* 9-Stage Visual Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-cqNavy-950">9-Stage Service Orchestration Timeline</h2>
          <p className="text-xs text-slate-500">Every stage responds directly to your completed submissions and administrator reviews</p>
        </div>

        <div className="relative pl-6 sm:pl-8 space-y-8 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {stages.map((st) => {
            let statusIcon;
            let badgeBg;
            let cardBorder;

            if (st.isCompleted) {
              statusIcon = (
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                  <CheckCircle2 size={16} />
                </div>
              );
              badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
              cardBorder = 'border-slate-200 bg-white';
            } else if (st.isCurrent) {
              statusIcon = (
                <div className="w-8 h-8 rounded-full bg-cqTeal-600 text-white flex items-center justify-center ring-4 ring-cqTeal-100 animate-pulse shadow-sm">
                  <Clock size={16} />
                </div>
              );
              badgeBg = 'bg-cqTeal-50 text-cqTeal-800 border-cqTeal-200 font-bold';
              cardBorder = 'border-cqTeal-300 bg-cqTeal-50/20';
            } else {
              statusIcon = (
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 border border-slate-300 flex items-center justify-center">
                  <Circle size={14} />
                </div>
              );
              badgeBg = 'bg-slate-100 text-slate-500 border-slate-200';
              cardBorder = 'border-slate-100 bg-slate-50/40 opacity-70';
            }

            return (
              <div key={st.id} className="relative group">
                {/* Timeline Node Point */}
                <div className="absolute -left-7 sm:-left-9 top-1">
                  {statusIcon}
                </div>

                <div className={`p-5 rounded-2xl border transition-all ${cardBorder}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          STAGE {st.stage}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">
                          {st.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                        {st.description}
                      </p>
                    </div>

                    <div className="shrink-0 self-start sm:self-center">
                      <span className={`inline-flex items-center text-[11px] px-2.5 py-1 rounded-full border ${badgeBg}`}>
                        {st.isCompleted ? 'Completed' : st.isCurrent ? 'Current Active Stage' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Contextual guidance on current stage */}
                  {st.isCurrent && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <span className="text-cqTeal-900 font-medium">
                        Next required action for this stage:
                      </span>

                      {st.stage === 2 && (
                        <Link
                          to="/profile"
                          className="px-3.5 py-1.5 bg-cqNavy-900 text-white rounded-xl font-bold flex items-center gap-1.5"
                        >
                          <span>Complete Bio-data Form</span>
                          <ArrowRight size={13} />
                        </Link>
                      )}

                      {st.stage === 3 && (
                        <Link
                          to="/prospectus"
                          className="px-3.5 py-1.5 bg-cqNavy-900 text-white rounded-xl font-bold flex items-center gap-1.5"
                        >
                          <span>Review Prospectus Requirements</span>
                          <ArrowRight size={13} />
                        </Link>
                      )}

                      {st.stage === 4 && (
                        <Link
                          to="/documents"
                          className="px-3.5 py-1.5 bg-cqNavy-900 text-white rounded-xl font-bold flex items-center gap-1.5"
                        >
                          <span>Upload Mandatory Documents</span>
                          <ArrowRight size={13} />
                        </Link>
                      )}

                      {st.stage === 5 && (
                        <span className="text-amber-800 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
                          Awaiting School Admissions Desk review of your submitted records
                        </span>
                      )}

                      {st.stage === 6 && (
                        <Link
                          to="/book/srv-101"
                          className="px-3.5 py-1.5 bg-cqTeal-600 text-white rounded-xl font-bold flex items-center gap-1.5 hover:bg-cqTeal-700 shadow-xs"
                        >
                          <span>Schedule Reporting Appointment</span>
                          <ArrowRight size={13} />
                        </Link>
                      )}

                      {st.stage === 7 && activeAppointment && (
                        <Link
                          to={`/appointments/${activeAppointment.id}`}
                          className="px-3.5 py-1.5 bg-cqNavy-900 text-white rounded-xl font-bold flex items-center gap-1.5"
                        >
                          <span>View Reporting Appointment Slip</span>
                          <ArrowRight size={13} />
                        </Link>
                      )}

                      {st.stage === 8 && (
                        <span className="text-slate-700 font-semibold">
                          Please proceed to Desk 3 at Assembly Hall Annex for physical document verification.
                        </span>
                      )}

                      {st.stage === 9 && (
                        <span className="text-emerald-700 font-bold">
                          Congratulations! Your registration and house allocation are completed.
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reporting Day Preparation Tips */}
      <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-3">
        <div className="flex items-center gap-2 text-cqTeal-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles size={14} />
          <span>Physical Reporting Instructions</span>
        </div>
        <h3 className="text-lg font-bold">When Arriving on School Premises</h3>
        <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
          <li>Ensure all original documents (BECE slip, Birth Certificate, Placement Form) are neatly arranged in a brown envelope.</li>
          <li>Wear standard junior high school uniform during this verification exercise.</li>
          <li>Keep your digital appointment confirmation reference number handy for security gate entry.</li>
          <li>Both the student and registered parent or guardian must be present during document signing.</li>
        </ul>
      </div>

      {/* Stage Navigation: Back to Documents, Next to Reporting Appointment */}
      <StageNavigation
        prevHref="/documents"
        prevLabel="Back to Document Centre"
        nextHref="/book/srv-101"
        nextLabel="Proceed to Book Reporting Slot"
        currentStage="Stage 7 of 9"
        stageTitle="Reporting Appointment Scheduling"
      />
    </div>
  );
}
