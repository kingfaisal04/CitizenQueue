/**
 * CitizenQueue - Student Admission Command Centre
 * 
 * Route: `/dashboard`
 * 
 * Redesigned central command hub for Senior High School applicants and guardians.
 * Provides real-time admission progress, readiness breakdown, outstanding task
 * checklist, quick navigation, and appointment monitoring.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  School,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  FileText,
  User,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { AdmissionService } from '../../services/admissionService';
import { AppointmentService } from '../../services/appointmentService';
import { Storage } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';

export default function CitizenDashboardPage() {
  const { currentUser } = useAuth();

  const [profile, setProfile] = useState(AdmissionService.getProfile());
  const [metrics, setMetrics] = useState(null);
  const [outstandingTasks, setOutstandingTasks] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Cancel appointment modal state
  const [cancelModalApt, setCancelModalApt] = useState(null);
  const [cancelReason, setCancelReason] = useState('Change of family schedule');

  const loadDashboardData = () => {
    setProfile(AdmissionService.getProfile());
    setMetrics(AdmissionService.getReadinessMetrics());
    setOutstandingTasks(AdmissionService.getOutstandingTasks());
    setAppointments(AppointmentService.getCitizenAppointments());
    setNotifications(Storage.getNotifications());
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleConfirmCancel = () => {
    if (!cancelModalApt) return;
    AppointmentService.cancelAppointment(cancelModalApt.id, cancelReason);
    setCancelModalApt(null);
    loadDashboardData();
  };

  if (!metrics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        Loading admission command centre...
      </div>
    );
  }

  // Active reporting appointment
  const upcomingAppointment = appointments.find((apt) =>
    ['booked', 'checked_in', 'in_progress'].includes(apt.status)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 w-full space-y-8 animate-fade-in">
      
      {/* 1. Welcome Section & Assigned School Command Header */}
      <div className="bg-gradient-to-r from-cqNavy-950 via-cqNavy-900 to-cqNavy-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-md border border-cqNavy-800">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-cqTeal-300 bg-cqNavy-800/90 px-3 py-1 rounded-full border border-cqNavy-700">
              <School size={13} />
              <span>{profile.assignedSchool || 'Senior High School Placement'}</span>
            </span>
            <span className="text-xs text-slate-300 font-medium px-2 py-0.5 rounded bg-cqNavy-800/50">
              {profile.programme || 'General Science'} • {profile.residentialStatus || 'Boarding'}
            </span>
            <span className="text-xs text-cqTeal-300 font-mono">
              BECE Index: {profile.beceIndexNumber || '101245089'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
            Welcome, {profile.fullName || currentUser?.name || 'Emmanuel Mensah'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Welcome to your Senior High School admission orchestration command centre. Coordinate your digital prospectus, submit documents for preliminary review, and secure your physical reporting slot.
          </p>
        </div>

        {/* Admission Progress Stage Widget */}
        <div className="bg-cqNavy-900/90 border border-cqNavy-700/80 rounded-2xl p-5 flex flex-col items-start sm:items-end justify-center shrink-0 w-full lg:w-auto shadow-inner">
          <span className="text-[11px] font-semibold text-cqTeal-400 uppercase tracking-wider">
            Admission Journey Stage
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-3xl font-black text-white">{metrics.currentStage}</span>
            <span className="text-sm text-slate-400 font-semibold">of 9</span>
          </div>
          <p className="text-xs font-bold text-white mt-1">
            {metrics.stages.find((s) => s.stage === metrics.currentStage)?.title || 'In Progress'}
          </p>
          <Link
            to="/progress"
            className="text-xs text-cqTeal-300 hover:text-white mt-3 font-semibold flex items-center gap-1 group"
          >
            <span>View Full Journey Timeline</span>
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* 2. Readiness Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Profile Completion */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Profile Data</span>
            <User size={16} className="text-cqNavy-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{metrics.profileScore}%</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              metrics.profileComplete ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            }`}>
              {metrics.profileComplete ? 'Complete' : 'Pending'}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-cqNavy-900 h-full rounded-full transition-all"
              style={{ width: `${metrics.profileScore}%` }}
            />
          </div>
        </div>

        {/* Prospectus Completion */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Prospectus Items</span>
            <ShoppingBag size={16} className="text-cqTeal-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{metrics.prospectusProgress}%</span>
            <span className="text-[10px] text-slate-500 font-semibold">
              {metrics.purchasedCount}/{metrics.totalProspectusItems}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-cqTeal-500 h-full rounded-full transition-all"
              style={{ width: `${metrics.prospectusProgress}%` }}
            />
          </div>
        </div>

        {/* Document Submissions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Documents</span>
            <FileText size={16} className="text-blue-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{metrics.documentProgress}%</span>
            <span className="text-[10px] text-emerald-600 font-bold">
              {metrics.docsAccepted} verified
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all"
              style={{ width: `${metrics.documentProgress}%` }}
            />
          </div>
        </div>

        {/* Supplies Acquired */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Supplies Ready</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">
              {metrics.purchasedCount}
            </span>
            <span className="text-[10px] font-bold text-slate-500">
              of {metrics.totalProspectusItems} items
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            {metrics.totalProspectusItems - metrics.purchasedCount > 0 ? (
              <span className="text-amber-700 font-semibold">{metrics.totalProspectusItems - metrics.purchasedCount} items remaining</span>
            ) : (
              <span className="text-emerald-700 font-bold">All supplies acquired ✓</span>
            )}
          </p>
        </div>

        {/* Reporting Appointment Status */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Reporting Slot</span>
            <Calendar size={16} className="text-emerald-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-black text-slate-900">
              {upcomingAppointment ? 'Slot Booked' : metrics.isReadyForReporting ? 'Ready to Book' : 'Prerequisites Pending'}
            </span>
          </div>
          <div className="pt-1">
            {upcomingAppointment ? (
              <StatusBadge status={upcomingAppointment.status} size="sm" />
            ) : (
              <span className="text-[11px] text-slate-500">
                {metrics.isReadyForReporting ? 'Click below to schedule' : 'Complete documents & prospectus first'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Grid: Left (Outstanding Tasks & Actions), Right (Reporting Visit & Quick Access) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols on lg) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Outstanding Tasks Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <AlertCircle size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-cqNavy-950">Outstanding Admission Tasks</h2>
                  <p className="text-xs text-slate-500">Items requiring student or guardian action before school reporting</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {outstandingTasks.length} pending
              </span>
            </div>

            {outstandingTasks.length > 0 ? (
              <div className="space-y-3">
                {outstandingTasks.map((task) => {
                  const isUrgent = task.priority === 'urgent';
                  const isHigh = task.priority === 'high';

                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        isUrgent
                          ? 'border-rose-200 bg-rose-50/30'
                          : isHigh
                          ? 'border-amber-200 bg-amber-50/20'
                          : 'border-slate-200 bg-slate-50/30'
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded ${
                            isUrgent
                              ? 'bg-rose-100 text-rose-800'
                              : isHigh
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {task.category}
                          </span>
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                            {task.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {task.description}
                        </p>
                      </div>

                      <Link
                        to={task.link}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 shadow-xs ${
                          isUrgent
                            ? 'bg-rose-600 hover:bg-rose-700 text-white'
                            : isHigh
                            ? 'bg-cqNavy-950 hover:bg-cqNavy-900 text-white'
                            : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                        }`}
                      >
                        <span>{task.actionLabel}</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
                <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
                <p className="text-sm font-bold text-emerald-950">
                  All Pre-Arrival Tasks Completed!
                </p>
                <p className="text-xs text-emerald-800 max-w-md mx-auto">
                  Your admission profile, prospectus requirements, and documents are in order. You are ready for physical reporting.
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions Navigation Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-cqNavy-950">Quick Navigation</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              <Link
                to="/profile"
                className="p-4 rounded-2xl border border-slate-200 hover:border-cqTeal-500 hover:bg-slate-50/50 transition-all flex items-start gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-cqNavy-50 text-cqNavy-900 flex items-center justify-center shrink-0 group-hover:bg-cqNavy-900 group-hover:text-white transition-colors">
                  <User size={18} />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-cqTeal-700">
                    My Admission Profile
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Manage bio-data, guardian details and placement slip
                  </p>
                </div>
              </Link>

              <Link
                to="/prospectus"
                className="p-4 rounded-2xl border border-slate-200 hover:border-cqTeal-500 hover:bg-slate-50/50 transition-all flex items-start gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-cqTeal-50 text-cqTeal-800 flex items-center justify-center shrink-0 group-hover:bg-cqTeal-600 group-hover:text-white transition-colors">
                  <ShoppingBag size={18} />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-cqTeal-700">
                    Digital Prospectus
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Inspect specifications and submit item photos
                  </p>
                </div>
              </Link>

              <Link
                to="/documents"
                className="p-4 rounded-2xl border border-slate-200 hover:border-cqTeal-500 hover:bg-slate-50/50 transition-all flex items-start gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FileText size={18} />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-cqTeal-700">
                    Document Centre
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Upload certificates and view verification feedback
                  </p>
                </div>
              </Link>

              <Link
                to="/progress"
                className="p-4 rounded-2xl border border-slate-200 hover:border-cqTeal-500 hover:bg-slate-50/50 transition-all flex items-start gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <TrendingUp size={18} />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-cqTeal-700">
                    Admission Progress Timeline
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Track the 9 admission stages from placement to enrollment
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col on lg): Reporting Visit Card & Notifications */}
        <div className="space-y-6">
          
          {/* Active Appointment / Reporting Visit Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-cqTeal-600" />
                <h2 className="text-base font-bold text-cqNavy-950">Reporting Visit</h2>
              </div>
              {upcomingAppointment && (
                <StatusBadge status={upcomingAppointment.status} size="sm" />
              )}
            </div>

            {upcomingAppointment ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Reference Token</span>
                    <span className="font-mono font-bold text-cqNavy-950">
                      {upcomingAppointment.referenceNumber}
                    </span>
                  </div>

                  <div className="space-y-1 pt-1">
                    <p className="text-xs font-bold text-slate-900">
                      {upcomingAppointment.serviceName}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Clock size={13} className="text-cqTeal-600" />
                      <span>{upcomingAppointment.appointmentDate} at {upcomingAppointment.appointmentTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <MapPin size={13} className="text-cqTeal-600" />
                      <span>{upcomingAppointment.location}</span>
                    </div>
                  </div>
                </div>

                {upcomingAppointment.delayNotice && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-700" />
                    <span>{upcomingAppointment.delayNotice}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Link
                    to={`/appointments/${upcomingAppointment.id}`}
                    className="flex-1 py-2 text-center rounded-xl bg-cqNavy-950 hover:bg-cqNavy-900 text-white text-xs font-bold transition-colors"
                  >
                    View Appointment Details
                  </Link>
                  <button
                    type="button"
                    onClick={() => setCancelModalApt(upcomingAppointment)}
                    className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <Calendar size={32} className="mx-auto text-slate-300" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800">
                    No Reporting Appointment Scheduled
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {metrics.isReadyForReporting
                      ? 'You have completed all prerequisite documents and prospectus items! Book your school reporting date now.'
                      : 'Please complete your documents and prospectus review before booking a physical reporting slot.'}
                  </p>
                </div>

                <Link
                  to="/book/srv-101"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cqTeal-600 hover:bg-cqTeal-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Calendar size={13} />
                  <span>Choose Reporting Slot</span>
                </Link>
              </div>
            )}
          </div>

          {/* Service Alerts & Communications */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              School Desk Notices
            </h3>

            <div className="space-y-2.5">
              {notifications.slice(0, 3).map((notif) => (
                <div
                  key={notif.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{notif.title}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(notif.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Appointment Modal */}
      {cancelModalApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Cancel Reporting Appointment?
            </h3>
            <p className="text-xs text-slate-600">
              This will release your allocated reporting time slot at {cancelModalApt.institutionName} on {cancelModalApt.appointmentDate} at {cancelModalApt.appointmentTime}.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Reason for Cancellation</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-900"
              >
                <option value="Change of family schedule">Change of family schedule</option>
                <option value="Documents still in preparation">Documents still in preparation</option>
                <option value="Prospectus items still outstanding">Prospectus items still outstanding</option>
                <option value="Booked wrong date/time">Booked wrong date/time</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setCancelModalApt(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                Yes, Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
