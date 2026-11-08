/**
 * CitizenQueue - Demonstration Booking Confirmation
 * 
 * Route: `/booking-confirmation/:appointmentId`
 * 
 * Displays digital reference token, date/time confirmation, document checklist,
 * arrival directions, and persistent prototype demonstration disclaimers.
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Clock,
  MapPin,
  FileCheck2,
  ArrowRight,
  Printer,
  Copy,
  Check,
  LayoutDashboard,
  ShieldAlert
} from 'lucide-react';
import { AppointmentService } from '../../services/appointmentService';

export default function BookingConfirmationPage() {
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const apt = AppointmentService.getById(appointmentId);
    setAppointment(apt);
  }, [appointmentId]);

  const handleCopyRef = () => {
    if (appointment?.referenceNumber) {
      navigator.clipboard.writeText(appointment.referenceNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!appointment) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle size={32} className="text-amber-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Appointment Not Found</h2>
        <p className="text-sm text-slate-600">
          The booking reference could not be loaded from local storage.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-cqNavy-950 text-white rounded-lg text-sm"
        >
          Go to Citizen Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 w-full">
      
      {/* Prominent Demo Notice */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 flex items-start gap-3 shadow-xs">
        <ShieldAlert size={22} className="text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm">
          <p className="font-extrabold uppercase tracking-wide">
            DEMO MODE: This is a prototype booking and has not been submitted to a real institution.
          </p>
          <p className="mt-1 text-amber-800">
            No actual queue position has been allocated at {appointment.institutionName}. This screen demonstrates the citizen confirmation experience.
          </p>
        </div>
      </div>

      {/* Main Confirmation Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
        
        {/* Top Celebration Header */}
        <div className="bg-gradient-to-r from-cqNavy-950 via-cqNavy-900 to-cqNavy-950 text-white p-6 sm:p-8 text-center space-y-3">
          <div className="w-14 h-14 bg-cqTeal-500 text-cqNavy-950 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Appointment Reserved
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto">
            Your verification slot has been recorded in the local demonstration system.
          </p>

          {/* Reference Badge */}
          <div className="pt-2 inline-flex items-center gap-2 bg-cqNavy-800/80 px-4 py-2 rounded-xl border border-cqNavy-700">
            <span className="text-xs text-slate-400">Reference:</span>
            <span className="font-mono font-bold text-base sm:text-lg text-cqTeal-300">
              {appointment.referenceNumber}
            </span>
            <button
              type="button"
              onClick={handleCopyRef}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="Copy Reference Number"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        {/* Appointment Specifics */}
        <div className="p-6 sm:p-8 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm">
            <div>
              <span className="text-slate-500 block text-xs">Institution</span>
              <strong className="text-slate-900 flex items-center gap-1.5 mt-0.5">
                <Building2 size={15} className="text-cqTeal-600 shrink-0" />
                {appointment.institutionName}
              </strong>
            </div>

            <div>
              <span className="text-slate-500 block text-xs">Service</span>
              <strong className="text-slate-900 block mt-0.5">
                {appointment.serviceName}
              </strong>
            </div>

            <div>
              <span className="text-slate-500 block text-xs">Date & Time</span>
              <strong className="text-slate-900 flex items-center gap-1.5 mt-0.5">
                <Calendar size={15} className="text-cqTeal-600 shrink-0" />
                {appointment.appointmentDate} at {appointment.appointmentTime}
              </strong>
            </div>

            <div>
              <span className="text-slate-500 block text-xs">Reporting Location</span>
              <strong className="text-slate-900 flex items-center gap-1.5 mt-0.5">
                <MapPin size={15} className="text-cqTeal-600 shrink-0" />
                {appointment.location}
              </strong>
            </div>

            <div>
              <span className="text-slate-500 block text-xs">Parent / Guardian</span>
              <span className="text-slate-800 font-medium">
                {appointment.visitor?.parentName} ({appointment.visitor?.contactPhone})
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-xs">Student Candidate</span>
              <span className="text-slate-800 font-medium">
                {appointment.visitor?.studentName} {appointment.visitor?.studentIndex ? `• Index: ${appointment.visitor?.studentIndex}` : ''}
              </span>
            </div>
          </div>

          {/* Checklist reminder */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FileCheck2 size={18} className="text-cqTeal-600" />
              Remember to bring these documents with you:
            </h3>

            <div className="space-y-2">
              {appointment.checklist?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 p-2.5 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <div className="w-2 h-2 rounded-full bg-cqTeal-500 shrink-0" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Next steps advice */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-900 space-y-1">
            <p className="font-bold">Next Steps on the Day of Your Visit:</p>
            <ul className="list-disc list-inside space-y-0.5 text-blue-800">
              <li>Arrive 10 to 15 minutes before {appointment.appointmentTime}.</li>
              <li>Present reference <strong>{appointment.referenceNumber}</strong> at the campus reception or verification desk.</li>
              <li>Show original documents and submit certified photocopies.</li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-colors"
            >
              <Printer size={16} />
              <span>Print Demonstration Pass</span>
            </button>

            <div className="w-full sm:w-auto flex items-center gap-2">
              <Link
                to={`/appointments/${appointment.id}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-colors"
              >
                <span>View Details</span>
              </Link>

              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cqNavy-950 hover:bg-cqNavy-900 text-white text-xs sm:text-sm font-bold shadow-xs transition-all"
              >
                <LayoutDashboard size={16} />
                <span>Go to Citizen Dashboard</span>
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
