/**
 * CitizenQueue - Public Footer Component
 * 
 * Provides transparent civic footer with navigation, educational context,
 * fairness principles, and prototype notices.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, School, ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = 2026;
  return (
    <footer className="bg-cqNavy-950 text-slate-400 border-t border-cqNavy-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cqNavy-800 text-cqTeal-400 flex items-center justify-center border border-cqNavy-700">
                <School className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Citizen<span className="text-cqTeal-400">Queue</span>
              </span>
            </div>
            
            <p className="text-sm text-slate-400 leading-relaxed">
              Cloud-native Senior High School admission orchestration platform in Ghana. Coordinating prospectus requirements, document screening, and reporting capacity before physical arrival on campus.
            </p>

            <div className="pt-2 text-xs text-slate-500 border-t border-cqNavy-900">
              Initial focus: Ghanaian Senior High School (SHS) admission post-CSSPS placement.
            </div>
          </div>

          {/* Student & Guardian Access */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Student Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/dashboard" className="hover:text-cqTeal-300 transition-colors">
                  Command Centre
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-cqTeal-300 transition-colors">
                  My Admission Profile
                </Link>
              </li>
              <li>
                <Link to="/prospectus" className="hover:text-cqTeal-300 transition-colors">
                  Digital School Prospectus
                </Link>
              </li>
              <li>
                <Link to="/documents" className="hover:text-cqTeal-300 transition-colors">
                  Document Centre
                </Link>
              </li>
              <li>
                <Link to="/progress" className="hover:text-cqTeal-300 transition-colors">
                  Admission Journey Timeline
                </Link>
              </li>
            </ul>
          </div>

          {/* Institutional Partners */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              School Administration
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/admin" className="hover:text-cqTeal-300 transition-colors flex items-center gap-1.5">
                  <span>Admissions Dashboard</span>
                  <ExternalLink size={12} />
                </Link>
              </li>
              <li>
                <Link to="/admin/students" className="hover:text-cqTeal-300 transition-colors">
                  Student Cohort Manager
                </Link>
              </li>
              <li>
                <Link to="/admin/documents" className="hover:text-cqTeal-300 transition-colors">
                  Document Review Queue
                </Link>
              </li>
              <li>
                <Link to="/admin/items" className="hover:text-cqTeal-300 transition-colors">
                  Item Photo Review Desk
                </Link>
              </li>
              <li>
                <Link to="/admin/prospectus" className="hover:text-cqTeal-300 transition-colors">
                  Prospectus Configuration
                </Link>
              </li>
              <li>
                <Link to="/admin/availability" className="hover:text-cqTeal-300 transition-colors">
                  Capacity & Slot Rules
                </Link>
              </li>
            </ul>
          </div>

          {/* Principles & Demo Notice */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Civic Commitment
            </h4>
            <div className="bg-cqNavy-900/80 p-3.5 rounded-2xl border border-cqNavy-800 text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-cqTeal-400 font-semibold">
                <ShieldCheck size={14} />
                Zero-Tolerance for Paid Priority
              </div>
              <p className="text-slate-400 leading-normal">
                CitizenQueue does not allow paid queue prioritization or preferential appointments. Admission onboarding is fair, transparent, and dignified for every family.
              </p>
            </div>
            <p className="text-[11px] text-slate-500">
              Demonstration prototype created for SHS service orchestration in Ghana.
            </p>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-cqNavy-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} CitizenQueue Project. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-slate-400">
              Civic Technology for Ghanaian Senior High Schools
            </span>
            <span>•</span>
            <span className="text-amber-400/90 font-medium">Demonstration Release</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
