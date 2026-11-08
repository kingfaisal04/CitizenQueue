/**
 * CitizenQueue - Simplified Appointment & Reporting Slot Booking
 * 
 * Route: `/book` and `/book/:serviceId`
 * 
 * Features:
 * 1. Simple, intuitive 3-step booking flow
 * 2. Instant selection between:
 *    - Fresh SHS Students Admission Completion (srv-101)
 *    - School Certificate & Official Transcript Request (for SHS) (srv-102)
 * 3. Live capacity indicator per slot
 * 4. Candidate & Guardian form (Phone is mandatory, Email is optional)
 * 5. "Next" and "Back" navigation buttons on every step and stage
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Sparkles,
  School,
  GraduationCap,
  FileCheck2,
  ShieldCheck
} from 'lucide-react';
import { ServiceService } from '../../services/serviceService';
import { AppointmentService } from '../../services/appointmentService';
import { AdmissionService } from '../../services/admissionService';
import StageNavigation from '../../components/common/StageNavigation';

export default function BookingPage() {
  const { serviceId: paramServiceId } = useParams();
  const navigate = useNavigate();

  // Primary service choices
  const [selectedServiceId, setSelectedServiceId] = useState(paramServiceId || 'srv-101');
  const [service, setService] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simple 3-step booking flow
  // Step 1: Select Service, Date & Slot
  // Step 2: Enter Candidate & Guardian Information
  // Step 3: Review & Finalize Booking
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [visitorInfo, setVisitorInfo] = useState({
    parentName: '',
    contactPhone: '',
    contactEmail: '',
    studentName: '',
    studentIndex: '',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load service & availability when selectedServiceId changes
  useEffect(() => {
    setIsLoading(true);
    const targetId = selectedServiceId || 'srv-101';
    let srv = ServiceService.getById(targetId);
    if (!srv) {
      srv = ServiceService.getById('srv-101');
    }

    if (srv) {
      setService(srv);
      const av = ServiceService.getAvailability(srv.id);
      setAvailability(av);
      if (av && av.length > 0) {
        setSelectedDate(av[0].date);
        setSelectedSlot(null);
      }
    }

    // Prepopulate with student admission profile
    const profile = AdmissionService.getProfile();
    if (profile) {
      setVisitorInfo((prev) => ({
        ...prev,
        studentName: profile.fullName || 'Emmanuel Mensah',
        studentIndex: profile.beceIndexNumber || '101245089',
        parentName: profile.guardianName || prev.parentName || 'Kwame Mensah',
        contactPhone: profile.guardianPhone || prev.contactPhone || '+233 24 411 2233',
        contactEmail: profile.guardianEmail || prev.contactEmail || '',
        notes: prev.notes || `${profile.programme || 'General Science'} - ${profile.residentialStatus || 'Boarding'}`
      }));
    }

    setIsLoading(false);
  }, [selectedServiceId]);

  // Handle service switch
  const handleServiceSelect = (newServiceId) => {
    setSelectedServiceId(newServiceId);
    setSelectedSlot(null);
    setSubmitError('');
  };

  // Validate Step 2 (Visitor Info)
  const validateVisitorInfo = () => {
    const errors = {};
    if (!visitorInfo.studentName?.trim()) {
      errors.studentName = 'Candidate full name is required.';
    }
    if (!visitorInfo.studentIndex?.trim()) {
      errors.studentIndex = 'BECE Index Number is required.';
    }
    if (!visitorInfo.parentName?.trim()) {
      errors.parentName = 'Parent or Guardian full name is required.';
    }
    if (!visitorInfo.contactPhone?.trim()) {
      errors.contactPhone = 'Guardian contact phone number is mandatory.';
    } else if (visitorInfo.contactPhone.trim().length < 9) {
      errors.contactPhone = 'Please enter a valid phone number (e.g. +233 24 411 2233).';
    }

    // Guardian email is OPTIONAL - only check if entered
    if (visitorInfo.contactEmail?.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(visitorInfo.contactEmail.trim())) {
        errors.contactEmail = 'Please enter a valid email address or leave it blank.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Next Step Transition
  const handleNextStep = () => {
    setSubmitError('');

    if (currentStep === 1) {
      if (!selectedSlot) {
        setSubmitError('Please click to select an available time slot before continuing.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!validateVisitorInfo()) return;
      setCurrentStep(3);
    }
  };

  // Previous Step Transition
  const handlePrevStep = () => {
    setSubmitError('');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Confirm and create appointment
  const handleConfirmBooking = () => {
    setIsSubmitting(true);
    setSubmitError('');

    const result = AppointmentService.createAppointment({
      service,
      date: selectedDate,
      slot: selectedSlot,
      visitor: visitorInfo
    });

    if (result.success) {
      AdmissionService.syncStudentCohort();
      navigate(`/booking-confirmation/${result.appointment.id}`);
    } else {
      setIsSubmitting(false);
      setSubmitError(result.error || 'Failed to complete appointment booking.');
    }
  };

  // Active date slots
  const activeDateEntry = availability.find((d) => d.date === selectedDate);
  const currentSlots = activeDateEntry ? activeDateEntry.slots : [];

  if (isLoading || !service) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="h-48 bg-slate-100 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 w-full space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cqTeal-50 border border-cqTeal-200 text-cqTeal-800 rounded-full text-xs font-bold uppercase tracking-wider">
          <School size={13} />
          <span>Physical Reporting Appointment Desk</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-cqNavy-950 tracking-tight">
          Schedule Physical Reporting Slot
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Reserve an official time slot to present your physical documents, verify your items, and finalize your school enrollment.
        </p>
      </div>

      {/* Step Progress Indicators */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { num: 1, label: '1. Service & Slot' },
            { num: 2, label: '2. Candidate Details' },
            { num: 3, label: '3. Review & Confirm' }
          ].map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <div key={s.num} className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors mb-1 ${
                    isCompleted
                      ? 'bg-cqTeal-600 text-white'
                      : isCurrent
                      ? 'bg-cqNavy-950 text-white ring-4 ring-cqTeal-100'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle size={14} /> : s.num}
                </div>
                <span
                  className={`text-[11px] sm:text-xs font-semibold truncate ${
                    isCurrent ? 'text-cqNavy-950' : isCompleted ? 'text-cqTeal-700' : 'text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Banner */}
      {submitError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="font-medium">{submitError}</div>
        </div>
      )}

      {/* STEP 1: SERVICE & TIME SLOT SELECTION */}
      {currentStep === 1 && (
        <div className="space-y-6">
          
          {/* Service Switcher Tray (Fresh SHS vs Certificate/Transcript) */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Official Reporting Service:
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Service A: Fresh SHS Students Admission Completion */}
              <button
                type="button"
                onClick={() => handleServiceSelect('srv-101')}
                className={`p-5 rounded-2xl border text-left transition-all relative ${
                  selectedServiceId === 'srv-101'
                    ? 'border-cqTeal-600 bg-cqTeal-50/40 ring-2 ring-cqTeal-500 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-cqNavy-950 text-cqTeal-300 flex items-center justify-center shadow-xs">
                    <GraduationCap size={18} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-cqTeal-100 text-cqTeal-800 px-2 py-0.5 rounded">
                    Fresh Placements
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-1">
                  Fresh SHS Students Admission Completion
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Verification of CSSPS placement, physical inspection of prospectus requirements, and house/dormitory allocation.
                </p>
                <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                  <span>⏱ 20 Minutes</span>
                  <span>•</span>
                  <span>Assembly Hall Annex, Desk 3</span>
                </div>
              </button>

              {/* Service B: School Certificate & Official Transcript Request */}
              <button
                type="button"
                onClick={() => handleServiceSelect('srv-102')}
                className={`p-5 rounded-2xl border text-left transition-all relative ${
                  selectedServiceId === 'srv-102'
                    ? 'border-cqTeal-600 bg-cqTeal-50/40 ring-2 ring-cqTeal-500 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 text-amber-300 flex items-center justify-center shadow-xs">
                    <FileCheck2 size={18} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                    SHS Records
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-1">
                  School Certificate & Official Transcript Request
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Collection of official WASSCE certificates, certified letter of completion, and official academic transcripts.
                </p>
                <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                  <span>⏱ 15 Minutes</span>
                  <span>•</span>
                  <span>Records Office, Room 12</span>
                </div>
              </button>
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-3 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Choose Reporting Date:
              </label>
              <span className="text-xs text-slate-400">Achimota Senior High School Campus</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {availability.map((day) => {
                const isSelected = selectedDate === day.date;
                const availableCount = day.slots?.filter((s) => s.bookedCount < s.capacity).length || 0;

                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => {
                      setSelectedDate(day.date);
                      setSelectedSlot(null);
                      setSubmitError('');
                    }}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-cqTeal-600 bg-cqTeal-50 text-cqTeal-950 ring-2 ring-cqTeal-500 font-bold'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Calendar size={16} className={`mx-auto mb-1 ${isSelected ? 'text-cqTeal-600' : 'text-slate-400'}`} />
                    <p className="text-xs font-bold">{day.date}</p>
                    <span className="text-[10px] text-slate-500 font-normal">
                      {availableCount} slots open
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots Grid with Capacity */}
          <div className="space-y-3 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Available Intake Slots for {selectedDate}
                </h3>
                <p className="text-xs text-slate-500">
                  Click on an open slot. Slots in red are fully booked.
                </p>
              </div>
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Live Capacity Control
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {currentSlots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id;
                const remaining = slot.capacity - slot.bookedCount;
                const isFull = remaining <= 0;

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={isFull}
                    onClick={() => {
                      setSelectedSlot(slot);
                      setSubmitError('');
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-cqTeal-600 bg-cqTeal-50 ring-2 ring-cqTeal-500 shadow-xs'
                        : isFull
                        ? 'border-slate-200 bg-slate-100 opacity-50 cursor-not-allowed'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                        <Clock size={14} className={isSelected ? 'text-cqTeal-600' : 'text-slate-400'} />
                        <span>{slot.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {isFull ? 'Intake limit reached' : `${remaining} slots remaining`}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isFull
                          ? 'bg-rose-100 text-rose-800'
                          : isSelected
                          ? 'bg-cqTeal-600 text-white'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isFull ? 'FULL' : isSelected ? 'SELECTED' : `${slot.bookedCount}/${slot.capacity}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls for Step 1 */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => navigate('/progress')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Progress Tracker</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cqTeal-600 hover:bg-cqTeal-700 text-white text-xs sm:text-sm font-bold transition-all shadow-sm"
            >
              <span>Next: Candidate Details</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: CANDIDATE & GUARDIAN DETAILS */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xl font-bold text-slate-900">
              Step 2: Candidate & Guardian Information
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Confirm the reporting visitor details. Guardian contact phone is mandatory for SMS notifications. Email is optional.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Student Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Student Full Name *
              </label>
              <input
                type="text"
                required
                value={visitorInfo.studentName}
                onChange={(e) => setVisitorInfo({ ...visitorInfo, studentName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
              />
              {formErrors.studentName && (
                <p className="text-[11px] text-rose-600">{formErrors.studentName}</p>
              )}
            </div>

            {/* BECE Index */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                BECE Index Number *
              </label>
              <input
                type="text"
                required
                value={visitorInfo.studentIndex}
                onChange={(e) => setVisitorInfo({ ...visitorInfo, studentIndex: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
              />
              {formErrors.studentIndex && (
                <p className="text-[11px] text-rose-600">{formErrors.studentIndex}</p>
              )}
            </div>

            {/* Parent Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Parent or Guardian Full Name *
              </label>
              <input
                type="text"
                required
                value={visitorInfo.parentName}
                onChange={(e) => setVisitorInfo({ ...visitorInfo, parentName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
              />
              {formErrors.parentName && (
                <p className="text-[11px] text-rose-600">{formErrors.parentName}</p>
              )}
            </div>

            {/* Guardian Phone (Mandatory) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Guardian Phone Number * (Mandatory)
              </label>
              <input
                type="tel"
                required
                placeholder="+233 24 411 2233"
                value={visitorInfo.contactPhone}
                onChange={(e) => setVisitorInfo({ ...visitorInfo, contactPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
              />
              {formErrors.contactPhone && (
                <p className="text-[11px] text-rose-600">{formErrors.contactPhone}</p>
              )}
            </div>

            {/* Guardian Email (Optional) */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">
                Guardian Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="e.g. kwame.mensah@example.com (optional)"
                value={visitorInfo.contactEmail}
                onChange={(e) => setVisitorInfo({ ...visitorInfo, contactEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
              />
              {formErrors.contactEmail && (
                <p className="text-[11px] text-rose-600">{formErrors.contactEmail}</p>
              )}
            </div>
          </div>

          {/* Navigation Controls for Step 2 */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handlePrevStep}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back: Change Slot</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cqTeal-600 hover:bg-cqTeal-700 text-white text-xs sm:text-sm font-bold transition-all shadow-sm"
            >
              <span>Next: Review & Confirm</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW & CONFIRM */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xl font-bold text-slate-900">
              Step 3: Review Appointment Summary
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Verify your reporting details. Once confirmed, a digital intake pass with unique QR reference will be generated.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Service & Slot card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Service & Venue
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">{service.name}</p>
                <p className="text-xs text-slate-600 mt-0.5">{service.institutionName}</p>
                <p className="text-xs text-cqTeal-700 font-medium mt-1">{service.location}</p>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span>Date: <strong className="text-slate-800">{selectedDate}</strong></span>
                <span>Time: <strong className="text-slate-800">{selectedSlot?.time}</strong></span>
              </div>
            </div>

            {/* Candidate details card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Candidate & Guardian
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">{visitorInfo.studentName}</p>
                <p className="text-xs text-slate-600 mt-0.5">BECE Index: {visitorInfo.studentIndex}</p>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-1 text-xs">
                <p>Guardian: <strong className="text-slate-800">{visitorInfo.parentName}</strong></p>
                <p>Telephone: <strong className="text-slate-800">{visitorInfo.contactPhone}</strong></p>
                {visitorInfo.contactEmail && (
                  <p>Email: <strong className="text-slate-800">{visitorInfo.contactEmail}</strong></p>
                )}
              </div>
            </div>
          </div>

          {/* Fairness Notice */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <ShieldCheck size={18} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Queue Fairness Policy:</strong> Physical check-in follows your scheduled arrival window. No paid priority jumping is permitted. Please arrive 15 minutes before your time slot with original documents.
            </div>
          </div>

          {/* Navigation Controls for Step 3 */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back: Edit Details</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmBooking}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-cqNavy-950 hover:bg-cqNavy-900 text-white text-sm font-bold transition-all shadow-md active:scale-[0.98]"
            >
              <Sparkles size={16} className="text-cqTeal-400" />
              <span>{isSubmitting ? 'Confirming Slot...' : 'Confirm & Generate Reporting Pass'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Global Stage Navigation: Back to Progress Tracker, Next to Dashboard */}
      <StageNavigation
        prevHref="/progress"
        prevLabel="Back to Progress Tracker"
        nextHref="/dashboard"
        nextLabel="Return to Dashboard"
        currentStage="Stage 7 of 9"
        stageTitle="Reporting Appointment"
      />
    </div>
  );
}
