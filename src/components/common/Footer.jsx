/**
 * CitizenQueue - Public Footer Component
 * 
 * Provides transparent civic footer with navigation, educational context,
 * fairness principles, and official institutional support channels.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, School, CheckCircle2, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = 2026;

  return (
    <footer className="bg-cqNavy-950 text-slate-400 border-t border-cqNavy-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cqNavy-800 text-cqTeal-400 flex items-center justify-center border border-cqNavy-700 shadow-xs">
                <School className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Citizen<span className="text-cqTeal-400">Queue</span>
              </span>
            </div>
            
            <p className="text-sm text-slate-400 leading-relaxed">
              Ghanaian Senior High School admission orchestration platform. Coordinating prospectus requirements, document pre-screening, and physical reporting capacity after CSSPS placement.
            </p>

            <div className="pt-2 text-xs text-slate-500 border-t border-cqNavy-900">
              Partnered with participating Senior High Schools across Ghana.
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
                  Admission Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-cqTeal-300 transition-colors">
                  Admission Profile
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
              <li>
                <Link to="/book" className="hover:text-cqTeal-300 transition-colors">
                  Reporting Appointments
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
                <Link to="/admin" className="hover:text-cqTeal-300 transition-colors">
                  Admissions Command Desk
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
                <Link to="/admin/prospectus" className="hover:text-cqTeal-300 transition-colors">
                  Prospectus Configuration
                </Link>
              </li>
              <li>
                <Link to="/admin/availability" className="hover:text-cqTeal-300 transition-colors">
                  Capacity & Intake Schedule
                </Link>
              </li>
            </ul>
          </div>

          {/* Civic & Contact Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Fairness & Support
            </h4>
            
            <div className="bg-cqNavy-900 p-4 rounded-2xl border border-cqNavy-800 text-xs space-y-2.5">
              <div className="flex items-center gap-1.5 text-cqTeal-400 font-bold">
                <ShieldCheck size={15} />
                <span>Zero Priority Jumping</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                CitizenQueue is strictly free for students and guardians. Arrival windows follow orderly scheduling with no fee-based fast tracks.
              </p>
            </div>

            <div className="space-y-1.5 text-xs text-slate-400 pt-1">
              <p className="flex items-center gap-2">
                <Phone size={13} className="text-cqTeal-400" />
                <span>Desk Hotline: (+233) 30 200 1122</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail size={13} className="text-cqTeal-400" />
                <span>support@citizenqueue.gov.gh</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-12 border-t border-cqNavy-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center sm:text-left">
          <p>© {currentYear} CitizenQueue. Powered for Ghanaian Senior High School Admissions.</p>
          <div className="flex items-center gap-4">
            <span>Terms of Service</span>
            <span>•</span>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Ghana Education Service (GES)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
