/**
 * CitizenQueue - Student Admission Reporting Pass & Confirmation
 * 
 * Route: `/booking-confirmation/:appointmentId`
 * 
 * Official student intake confirmation pass with verifiable reference token,
 * scheduled date/time slot, brown-envelope document checklist, arrival guidelines,
 * and print pass capabilities.
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Building2,
  Calendar,
  Clock,
  MapPin,
  FileCheck2,
  Printer,
  Copy,
  Check,
  LayoutDashboard,
  ShieldCheck,
  QrCode,
  AlertCircle
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
        <AlertCircle size={32} className="text-amber-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Appointment Record Not Found</h2>
        <p className="text-sm text-slate-600">
          The booking reference could not be located in registry storage.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-cqNavy-950 text-white rounded-xl text-xs font-bold"
        >
          Go to Admission Command Centre
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 w-full space-y-6 animate-fade-in">
      
      {/* Official Verification Notice Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-3.5 shadow-xs">
        <ShieldCheck size={22} className="text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm space-y-1">
          <p className="font-extrabold uppercase tracking-wide text-emerald-900">
            Official Reporting Slot Confirmed & Synchronized
          </p>
          <p className="text-emerald-800 leading-relaxed">
            Your physical intake slot at <strong>{appointment.institutionName}</strong> has been locked in the school registry. Please save or print this official digital pass for presentation at campus security and the registration desk.
          </p>
        </div>
      </div>

      {/* Main Official Reporting Pass Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
        
        {/* Pass Executive Header */}
        <div className="bg-gradient-to-r from-cqNavy-950 via-cqNavy-900 to-cqNavy-950 text-white p-6 sm:p-8 text-center space-y-3 relative">
          <div className="w-14 h-14 bg-cqTeal-500 text-cqNavy-950 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 size={32} />
          </div>
          
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-cqTeal-300 uppercase tracking-widest bg-cqNavy-800/80 px-3 py-1 rounded-full border border-cqNavy-700">
              Senior High School Admission Reporting Pass
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight pt-1">
              Reporting Slot Reserved
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto">
              Present this pass at {appointment.institutionName} on your scheduled reporting day.
            </p>
          </div>

          {/* Reference Badge with Copy Action */}
          <div className="pt-2 inline-flex items-center gap-2 bg-cqNavy-800/90 px-4 py-2 rounded-xl border border-cqNavy-700 shadow-inner">
            <span className="text-xs text-slate-400 font-medium">Pass Reference:</span>
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

        {/* Appointment Specifics Grid */}
        <div className="p-6 sm:p-8 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm">
            <div>
              <span className="text-slate-500 block text-xs font-semibold">Assigned Institution</span>
              <strong className="text-slate-900 flex items-center gap-1.5 mt-0.5">
                <Building2 size={16} className="text-cqTeal-600 shrink-0" />
                {appointment.institutionName}
              </strong>
            </div>

            <div>
              <span className="text-slate-500 block text-xs font-semibold">Service Workflow</span>
              <strong className="text-slate-900 block mt-0.5">
                {appointment.serviceName}
              </strong>
            </div>

            <div>
              <span className="text-slate-500 block text-xs font-semibold">Reporting Date & Allocated Time</span>
              <strong className="text-slate-900 flex items-center gap-1.5 mt-0.5">
                <Calendar size={16} className="text-cqTeal-600 shrink-0" />
                {appointment.appointmentDate} at {appointment.appointmentTime}
              </strong>
            </div>

            <div>
              <span className="text-slate-500 block text-xs font-semibold">Reporting Venue & Desk</span>
              <strong className="text-slate-900 flex items-center gap-1.5 mt-0.5">
                <MapPin size={16} className="text-cqTeal-600 shrink-0" />
                {appointment.location}
              </strong>
            </div>

            <div>
              <span className="text-slate-500 block text-xs font-semibold">Registered Parent / Guardian</span>
              <span className="text-slate-800 font-medium block mt-0.5">
                {appointment.visitor?.parentName} ({appointment.visitor?.contactPhone})
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-xs font-semibold">Student Candidate</span>
              <span className="text-slate-800 font-medium block mt-0.5">
                {appointment.visitor?.studentName} {appointment.visitor?.studentIndex ? `• BECE Index: ${appointment.visitor?.studentIndex}` : ''}
              </span>
            </div>
          </div>

          {/* Verification QR / Security Bar */}
          <div className="p-4 rounded-2xl border border-dashed border-slate-300 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 border border-slate-200">
                <QrCode size={30} className="text-slate-700" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cqTeal-700 bg-cqTeal-50 px-2 py-0.5 rounded-full border border-cqTeal-200">
                  Campus Verification QR
                </span>
                <p className="text-xs font-bold text-slate-900">
                  Fast-Track Security & Reception Scan
                </p>
                <p className="text-[11px] text-slate-500">
                  Present this QR code or quoting token <strong className="font-mono text-slate-800">{appointment.referenceNumber}</strong> at the intake gates.
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">
              GES-VERIFIED
            </span>
          </div>

          {/* Physical Document Checklist (The Brown Envelope) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileCheck2 size={18} className="text-cqTeal-600" />
                <span>Physical Arrival Checklist (Brown Envelope Dossier)</span>
              </h3>
              <span className="text-[11px] text-slate-400">Bring original + 2 copies</span>
            </div>

            <div className="space-y-2">
              {appointment.checklist && appointment.checklist.length > 0 ? (
                appointment.checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 p-3 rounded-xl bg-slate-50 border border-slate-200/80"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-cqTeal-500 shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center gap-2.5 text-xs text-slate-700 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="w-2.5 h-2.5 rounded-full bg-cqTeal-500 shrink-0" />
                    <span className="font-medium">Original BECE Result Slip & CSSPS Placement Form</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-700 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="w-2.5 h-2.5 rounded-full bg-cqTeal-500 shrink-0" />
                    <span className="font-medium">Certified Copy of Birth Certificate</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-700 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="w-2.5 h-2.5 rounded-full bg-cqTeal-500 shrink-0" />
                    <span className="font-medium">Completed Medical Examination & Immunization Report</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-700 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="w-2.5 h-2.5 rounded-full bg-cqTeal-500 shrink-0" />
                    <span className="font-medium">4 Recent Passport-Size Photographs (White/Red background)</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Reporting Guidelines Notice */}
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200/80 text-xs text-blue-950 space-y-1.5">
            <p className="font-bold flex items-center gap-1.5 text-blue-900">
              <ShieldCheck size={14} className="text-blue-700" />
              <span>Arrival Guidelines on Reporting Day:</span>
            </p>
            <ul className="list-disc list-inside space-y-1 text-blue-800 leading-relaxed">
              <li>Arrive 10 to 15 minutes before your scheduled window ({appointment.appointmentTime}) to avoid congestion.</li>
              <li>Present reference token <strong>{appointment.referenceNumber}</strong> at the reception desk.</li>
              <li>Student must appear in clean Junior High School uniform for identity verification.</li>
              <li>Registered parent or legal guardian must be present to sign the official enrollment register.</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-colors shadow-xs"
            >
              <Printer size={16} />
              <span>Print Official Reporting Pass</span>
            </button>

            <div className="w-full sm:w-auto flex items-center gap-2">
              <Link
                to={`/appointments/${appointment.id}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-colors"
              >
                <span>View Full Details</span>
              </Link>

              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cqNavy-950 hover:bg-cqNavy-900 text-white text-xs sm:text-sm font-bold shadow-xs transition-all"
              >
                <LayoutDashboard size={16} />
                <span>Return to Command Centre</span>
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
