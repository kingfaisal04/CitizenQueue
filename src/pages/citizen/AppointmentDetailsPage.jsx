/**
 * CitizenQueue - Appointment Details Pass
 * 
 * Route: `/appointments/:appointmentId`
 * 
 * Deep dive into an individual appointment, including live checklist tracking,
 * full audit timeline, arrival guidelines, and cancellation.
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Building2,
  MapPin,
  FileCheck2,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Printer,
  History,
  AlertTriangle,
  User,
  Phone,
  Mail,
  ShieldCheck,
  CheckSquare,
  Square
} from 'lucide-react';
import { AppointmentService, APPOINTMENT_STATUSES } from '../../services/appointmentService';
import StatusBadge from '../../components/common/StatusBadge';

export default function AppointmentDetailsPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const loadAppointment = () => {
    const apt = AppointmentService.getById(appointmentId);
    setAppointment(apt);
  };

  useEffect(() => {
    loadAppointment();
  }, [appointmentId]);

  // Handle toggling document checklist item by visitor
  const handleToggleChecklist = (itemId) => {
    const updated = AppointmentService.toggleChecklistItem(appointment.id, itemId);
    if (updated) {
      setAppointment({ ...updated });
    }
  };

  const handleCancel = () => {
    AppointmentService.cancelAppointment(appointment.id, 'Cancelled via appointment pass');
    setShowCancelModal(false);
    loadAppointment();
  };

  if (!appointment) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle size={32} className="text-amber-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Appointment Record Not Found</h2>
        <p className="text-sm text-slate-600">
          The booking reference could not be found in the admission registry records.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-cqNavy-950 text-white rounded-lg text-sm"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const isCancellable = appointment.status === APPOINTMENT_STATUSES.BOOKED;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 w-full space-y-8">
      
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-cqNavy-950"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
          >
            <Printer size={14} />
            <span>Print Pass</span>
          </button>
        </div>
      </div>

      {/* Main Pass Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Pass Top Banner */}
        <div className="bg-cqNavy-950 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cqNavy-900">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cqTeal-400">
              Official Student Reporting & Verification Pass
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-mono">
              {appointment.referenceNumber}
            </h1>
            <p className="text-xs text-slate-400">
              Generated via CitizenQueue Platform
            </p>
          </div>

          <StatusBadge status={appointment.status} size="lg" />
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Key Appointment Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm">
            <div className="space-y-1">
              <span className="text-slate-500 font-medium block">Institution</span>
              <p className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Building2 size={18} className="text-cqTeal-600 shrink-0" />
                {appointment.institutionName}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 font-medium block">Service Workflow</span>
              <p className="font-bold text-slate-900 text-base">
                {appointment.serviceName}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 font-medium block">Date & Scheduled Time</span>
              <p className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Calendar size={18} className="text-cqTeal-600 shrink-0" />
                {appointment.appointmentDate} at {appointment.appointmentTime}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 font-medium block">Service Location & Desk</span>
              <p className="font-bold text-slate-900 text-base flex items-center gap-2">
                <MapPin size={18} className="text-cqTeal-600 shrink-0" />
                {appointment.location}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 font-medium block">Parent / Guardian Contact</span>
              <p className="font-semibold text-slate-800">
                {appointment.visitor?.parentName} • {appointment.visitor?.contactPhone}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 font-medium block">Student Candidate</span>
              <p className="font-semibold text-slate-800">
                {appointment.visitor?.studentName} {appointment.visitor?.studentIndex ? `(Index: ${appointment.visitor?.studentIndex})` : ''}
              </p>
            </div>
          </div>

          {/* Interactive Document Checklist */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <FileCheck2 size={18} className="text-cqTeal-600" />
                  Required Document Packing Checklist
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click each item below to check off documents you have placed in your envelope.
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {appointment.checklist?.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleToggleChecklist(item.id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all ${
                    item.verified
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 line-through opacity-85'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                  }`}
                >
                  {item.verified ? (
                    <CheckSquare size={18} className="text-emerald-600 shrink-0" />
                  ) : (
                    <Square size={18} className="text-slate-400 shrink-0" />
                  )}
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Audit Timeline */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <History size={16} className="text-slate-500" />
              Appointment Audit Log
            </h3>

            <div className="space-y-2 border-l-2 border-slate-200 ml-2 pl-4 text-xs">
              {appointment.history?.map((h, i) => (
                <div key={i} className="relative space-y-0.5">
                  <span className="w-2 h-2 rounded-full bg-cqTeal-600 absolute -left-[21px] top-1" />
                  <p className="font-semibold text-slate-800">{h.action}</p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(h.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Action strip */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            {isCancellable ? (
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
              >
                <XCircle size={15} />
                <span>Cancel This Appointment</span>
              </button>
            ) : (
              <span className="text-xs text-slate-500">
                Status is locked: {appointment.status}
              </span>
            )}

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-cqNavy-950 text-white rounded-xl text-xs font-bold hover:bg-cqNavy-900"
            >
              Return to Citizen Dashboard
            </Link>
          </div>

        </div>

      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              Confirm Cancellation
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Are you sure you want to cancel appointment <strong>{appointment.referenceNumber}</strong>? Your slot will be released back to the school's available capacity.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Yes, Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
