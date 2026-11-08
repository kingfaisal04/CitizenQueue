/**
 * CitizenQueue - Institutional Administrator Dashboard
 * 
 * Route: `/admin`
 * 
 * Senior High School Admission Command Centre: Real-time operational metrics,
 * candidate readiness tracking, bottleneck detection, and direct queue shortcuts.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CalendarCheck,
  FileText,
  ShoppingBag,
  Camera,
  CheckCircle2,
  Clock,
  School,
  ChevronRight,
  Layers
} from 'lucide-react';
import { AdmissionService } from '../../services/admissionService';
import { AppointmentService } from '../../services/appointmentService';
import { Storage } from '../../services/storageService';
import StatusBadge from '../../components/common/StatusBadge';

export default function AdminDashboardPage() {
  const [students, setStudents] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [prospectusStatus, setProspectusStatus] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState({});

  const loadAllData = () => {
    setStudents(AdmissionService.getAdmittedStudents());
    setDocuments(AdmissionService.getDocuments());
    setProspectusStatus(AdmissionService.getStudentProspectusStatus());
    setAppointments(AppointmentService.getAll());
    setAvailability(Storage.getAvailability());
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Compute aggregated institutional admission metrics
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const completedProfiles = students.filter((s) => s.profileComplete).length;
    const readyForReporting = students.filter((s) => s.readinessScore >= 80).length;
    
    // Documents metrics
    const docsAwaitingReview = documents.filter(
      (d) => d.status === 'submitted' || d.status === 'under_review'
    ).length;
    const docsChangesRequired = documents.filter((d) => d.status === 'changes_required').length;

    // Item photo review metrics
    let itemsAwaitingReview = 0;
    let itemsChangesRequired = 0;
    Object.values(prospectusStatus).forEach((st) => {
      if (st.photoStatus === 'awaiting_review') itemsAwaitingReview++;
      if (st.photoStatus === 'changes_required') itemsChangesRequired++;
    });

    // Appointment and intake metrics
    const scheduledAppointments = appointments.filter(
      (a) => a.status === 'booked' || a.status === 'checked_in'
    ).length;
    const completedRegistrations = appointments.filter(
      (a) => a.status === 'completed'
    ).length;

    // Slot capacity calculations
    let totalCapacity = 0;
    let totalBooked = 0;
    Object.values(availability).forEach((dateList) => {
      dateList.forEach((d) => {
        (d.slots || []).forEach((slot) => {
          totalCapacity += slot.capacity || 0;
          totalBooked += slot.bookedCount || 0;
        });
      });
    });

    return {
      totalStudents,
      completedProfiles,
      readyForReporting,
      docsAwaitingReview,
      docsChangesRequired,
      itemsAwaitingReview,
      itemsChangesRequired,
      scheduledAppointments,
      completedRegistrations,
      totalCapacity,
      totalBooked,
      remainingCapacity: Math.max(0, totalCapacity - totalBooked)
    };
  }, [students, documents, prospectusStatus, appointments, availability]);

  // Bottleneck breakdown stages
  const bottlenecks = useMemo(() => {
    const profileStuck = students.filter((s) => !s.profileComplete).length;
    const docReviewStuck = stats.docsAwaitingReview;
    const itemReviewStuck = stats.itemsAwaitingReview;
    const readyNotBooked = students.filter((s) => s.readinessScore >= 80 && !s.appointment).length;
    const checkedInPending = appointments.filter((a) => a.status === 'checked_in' || a.status === 'in_progress').length;

    return [
      { label: 'Incomplete Bio-data Profiles', count: profileStuck, color: 'text-amber-700 bg-amber-50', link: '/admin/students' },
      { label: 'Documents Awaiting Staff Verification', count: docReviewStuck, color: 'text-blue-700 bg-blue-50', link: '/admin/documents' },
      { label: 'Prospectus Photos Awaiting Check', count: itemReviewStuck, color: 'text-purple-700 bg-purple-50', link: '/admin/items' },
      { label: 'Pre-Arrival Ready (No Slot Booked)', count: readyNotBooked, color: 'text-teal-700 bg-teal-50', link: '/admin/students' },
      { label: 'At Verification Desk Now', count: checkedInPending, color: 'text-emerald-700 bg-emerald-50', link: '/admin/appointments' }
    ];
  }, [students, stats, appointments]);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Institution Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cqTeal-800 bg-cqTeal-50 px-2.5 py-0.5 rounded-full border border-cqTeal-200">
            <School size={12} />
            <span>Senior High School Admissions Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-cqNavy-950">
            Achimota Senior High School
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Admissions Operations Portal • 2026 Academic Cycle • CSSPS Post-Placement Orchestration
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/admin/documents"
            className="px-4 py-2.5 rounded-xl bg-cqNavy-950 hover:bg-cqNavy-900 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <FileText size={14} />
            <span>Review Documents ({stats.docsAwaitingReview})</span>
          </Link>
          <Link
            to="/admin/items"
            className="px-4 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Camera size={14} />
            <span>Review Item Photos ({stats.itemsAwaitingReview})</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Statistic Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Admitted */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Admitted Cohort</span>
            <Users size={18} className="text-cqNavy-700" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{stats.totalStudents}</span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {stats.completedProfiles} profiles done
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Assigned via CSSPS Batch A</p>
        </div>

        {/* Ready for Reporting */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Pre-Arrival Verified</span>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-emerald-700">{stats.readyForReporting}</span>
            <span className="text-[11px] text-slate-500 font-semibold">
              {Math.round((stats.readyForReporting / (stats.totalStudents || 1)) * 100)}% ready
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Prerequisite checks satisfied</p>
        </div>

        {/* Pending Reviews */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Awaiting Desk Review</span>
            <Clock size={18} className="text-amber-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-amber-700">
              {stats.docsAwaitingReview + stats.itemsAwaitingReview}
            </span>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
              {stats.docsAwaitingReview} docs • {stats.itemsAwaitingReview} items
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Require administrator action</p>
        </div>

        {/* Scheduled Arrivals */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Scheduled Arrivals</span>
            <CalendarCheck size={18} className="text-cqTeal-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{stats.scheduledAppointments}</span>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              {stats.completedRegistrations} completed
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Capacity: {stats.totalBooked}/{stats.totalCapacity} slots filled
          </p>
        </div>
      </div>

      {/* Main Operations Section: Left (Bottleneck Analyzer & Quick Actions), Right (Capacity & Recent Queue) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Bottleneck Analyzer & Administrative Shortcuts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Bottleneck Detection Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cqNavy-50 text-cqNavy-900 flex items-center justify-center">
                  <Layers size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-cqNavy-950">Admission Bottleneck Radar</h2>
                  <p className="text-xs text-slate-500">Identify candidate bottlenecks before they become physical queues</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {bottlenecks.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-cqTeal-400 transition-all flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center shrink-0 ${item.color}`}>
                      {item.count}
                    </span>
                    <span className="font-semibold text-slate-800">{item.label}</span>
                  </div>

                  <Link
                    to={item.link}
                    className="text-cqTeal-600 hover:text-cqTeal-700 font-bold flex items-center gap-1 shrink-0"
                  >
                    <span>Inspect</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Institutional Management Modules */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-cqNavy-950">Administrative Management Modules</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/admin/students"
                className="p-4 rounded-2xl border border-slate-200 hover:border-cqTeal-500 hover:bg-slate-50/50 transition-all flex items-start gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-cqNavy-50 text-cqNavy-900 flex items-center justify-center shrink-0 group-hover:bg-cqNavy-900 group-hover:text-white transition-colors">
                  <Users size={18} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-cqTeal-700">
                    Student Applications
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Search and filter admitted students, view dossiers
                  </p>
                </div>
              </Link>

              <Link
                to="/admin/documents"
                className="p-4 rounded-2xl border border-slate-200 hover:border-cqTeal-500 hover:bg-slate-50/50 transition-all flex items-start gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-cqTeal-700">
                    Document Review Queue
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Verify placement slips, birth certificates and photos
                  </p>
                </div>
              </Link>

              <Link
                to="/admin/items"
                className="p-4 rounded-2xl border border-slate-200 hover:border-cqTeal-500 hover:bg-slate-50/50 transition-all flex items-start gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Camera size={18} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-cqTeal-700">
                    Item Photo Review
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Inspect trunk dimensions, uniform cuts, and items
                  </p>
                </div>
              </Link>

              <Link
                to="/admin/prospectus"
                className="p-4 rounded-2xl border border-slate-200 hover:border-cqTeal-500 hover:bg-slate-50/50 transition-all flex items-start gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-cqTeal-700">
                    Prospectus Management
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Configure school regulations, categories, and exact specs
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Capacity Tracker & Today's Desk Queue */}
        <div className="space-y-6">
          
          {/* Daily Capacity Utilization */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-cqNavy-950">Reporting Desk Capacity</h2>
              <Link to="/admin/availability" className="text-xs text-cqTeal-600 font-bold hover:underline">
                Configure
              </Link>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Intake Capacity Filled</span>
                <span className="font-bold text-slate-900">
                  {stats.totalBooked} / {stats.totalCapacity} Slots ({Math.round((stats.totalBooked / (stats.totalCapacity || 1)) * 100)}%)
                </span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-cqTeal-600 h-full rounded-full transition-all"
                  style={{ width: `${(stats.totalBooked / (stats.totalCapacity || 1)) * 100}%` }}
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
                <p><strong>Available Intake Slots:</strong> {stats.remainingCapacity} seats remaining</p>
                <p className="text-slate-500">Slots are throttled per period to ensure zero physical congestion.</p>
              </div>
            </div>
          </div>

          {/* Recent Candidate Queue Activity */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-cqNavy-950">Today’s Arrivals</h2>
              <Link to="/admin/appointments" className="text-xs text-cqTeal-600 font-bold hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {appointments.slice(0, 4).map((apt) => (
                <div
                  key={apt.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{apt.visitor?.studentName || 'Candidate'}</span>
                    <StatusBadge status={apt.status} size="sm" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{apt.appointmentDate} at {apt.appointmentTime}</span>
                    <span className="font-mono">{apt.referenceNumber}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
