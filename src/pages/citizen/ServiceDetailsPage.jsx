/**
 * CitizenQueue - Service Details Page
 * 
 * Route: `/services/:serviceId`
 * 
 * Displays complete requirements checklist, operating desk location,
 * cancellation policies, and slot preview before beginning booking.
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Clock,
  CalendarCheck,
  FileCheck,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  HelpCircle,
  Shield,
  Phone,
  Mail,
  Info
} from 'lucide-react';
import { ServiceService } from '../../services/serviceService';
import { InstitutionService } from '../../services/institutionService';

export default function ServiceDetailsPage() {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const targetService = ServiceService.getById(serviceId);
    if (targetService) {
      setService(targetService);
      const inst = InstitutionService.getById(targetService.institutionId);
      setInstitution(inst);
      const slotsData = ServiceService.getAvailability(serviceId);
      setAvailability(slotsData);
    }
    setIsLoading(false);
  }, [serviceId]);

  // Handle invalid route or not found
  if (!isLoading && !service) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle size={28} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Service Not Found</h2>
        <p className="text-slate-600 text-sm">
          The requested service ID "{serviceId}" does not exist in our demonstration catalog.
        </p>
        <Link
          to="/services"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-cqNavy-950 text-white rounded-lg text-sm font-semibold hover:bg-cqNavy-900"
        >
          <ArrowLeft size={16} />
          Return to Service Directory
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-6 bg-slate-200 rounded w-1/4" />
        <div className="h-10 bg-slate-200 rounded w-3/4" />
        <div className="h-32 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  const hasConfirmedAvailability =
    service.hasAvailability &&
    availability.length > 0 &&
    availability.some((d) => d.slots && d.slots.length > 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 w-full">
      
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/services"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-cqNavy-950 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Service Directory
        </Link>
      </div>

      {/* Service Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 lg:p-10 shadow-xs mb-8 space-y-6">
        
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-cqTeal-800 bg-cqTeal-50 px-3 py-1 rounded-full border border-cqTeal-200">
              {service.category}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Service ID: {service.id}
            </span>
          </div>

          {hasConfirmedAvailability ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Appointment Slots Available
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-800 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              No Slots Available Currently
            </span>
          )}
        </div>

        {/* Title & Description */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-cqNavy-950 tracking-tight leading-tight">
            {service.name}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-4xl">
            {service.description}
          </p>
        </div>

        {/* Institution Info strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-700">
          <div className="flex items-start gap-2.5">
            <Building2 size={18} className="text-cqTeal-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">{service.institutionName}</p>
              <p className="text-xs text-slate-500">{institution?.category || 'Public Educational Institution'}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <MapPin size={18} className="text-cqTeal-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Desk / Location</p>
              <p className="text-xs text-slate-500">{service.location}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Clock size={18} className="text-cqTeal-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Estimated Duration</p>
              <p className="text-xs text-slate-500">~{service.durationMinutes} minutes per attendee</p>
            </div>
          </div>
        </div>

        {/* Delay notice if present */}
        {service.delayNotice && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <Info size={18} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Administrative Traffic Notice: </span>
              {service.delayNotice}
            </div>
          </div>
        )}

        {/* Action Button CTA */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            {hasConfirmedAvailability
              ? 'Appointments are free of charge. No payment required.'
              : 'New appointment windows are updated directly by school administration.'}
          </div>

          {hasConfirmedAvailability ? (
            <Link
              to={`/book/${service.id}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-cqTeal-600 hover:bg-cqTeal-700 text-white font-bold rounded-xl shadow-md transition-all text-sm"
            >
              <CalendarCheck size={18} />
              <span>Proceed to Booking ({service.name.length > 25 ? 'Select Slot' : service.name})</span>
            </Link>
          ) : (
            <button
              disabled
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 text-slate-500 font-medium rounded-xl text-sm cursor-not-allowed"
            >
              Booking Unavailable for This Service
            </button>
          )}
        </div>

      </div>

      {/* Two Column Layout: Requirements Checklist & Operating Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Required Documents & Visitor Guidelines */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Document Checklist Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cqTeal-50 text-cqTeal-700 flex items-center justify-center">
                <FileCheck size={20} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-cqNavy-950">
                  Required Documents Checklist
                </h2>
                <p className="text-xs text-slate-500">
                  Have these prepared before arriving at the school administration desk.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {service.requirements?.map((req, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-800"
                >
                  <div className="w-5 h-5 rounded-md bg-cqTeal-100 text-cqTeal-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <span className="font-medium">{req}</span>
                </div>
              ))}
            </div>

            <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
              <Info size={16} className="text-blue-700 shrink-0 mt-0.5" />
              <span>
                <strong>Document Integrity Note:</strong> Ensure all photocopies are clear and legible. School registry officers will verify originals and retain certified copies for student files.
              </span>
            </div>
          </div>

          {/* Appointment Instructions Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="font-bold text-lg text-cqNavy-950">
              Arrival & Verification Instructions
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              {service.instructions}
            </p>

            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-2">
              <p>
                <strong>Security Checkpoint:</strong> Display your digital confirmation reference on your mobile phone or printed slip at the main security entrance.
              </p>
              <p>
                <strong>Cancellation Policy:</strong> {service.cancellationPolicy}
              </p>
            </div>
          </div>

        </div>

        {/* Right 1 Col: Availability Schedule Preview & Institution Contacts */}
        <div className="space-y-6">
          
          {/* Availability Preview */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-cqNavy-950 flex items-center gap-2">
              <CalendarCheck size={18} className="text-cqTeal-600" />
              Upcoming Schedule Preview
            </h3>

            {availability.length === 0 ? (
              <p className="text-xs text-slate-500">
                No active demonstration slots are currently configured for this service.
              </p>
            ) : (
              <div className="space-y-3">
                {availability.slice(0, 3).map((day) => {
                  const totalSlots = day.slots?.length || 0;
                  const availableSlots = day.slots?.filter(
                    (s) => s.bookedCount < s.capacity
                  ).length || 0;

                  return (
                    <div
                      key={day.date}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span>{day.date}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            availableSlots > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {availableSlots} / {totalSlots} slots open
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 text-[11px] text-slate-500">
                        {day.slots?.map((s) => (
                          <span
                            key={s.id}
                            className={`px-1.5 py-0.5 rounded border ${
                              s.bookedCount >= s.capacity
                                ? 'bg-slate-100 text-slate-400 line-through border-slate-200'
                                : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            {s.time}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {hasConfirmedAvailability && (
              <Link
                to={`/book/${service.id}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-cqNavy-950 text-white rounded-xl text-xs font-semibold hover:bg-cqNavy-900 transition-colors"
              >
                <span>Select Date & Time</span>
              </Link>
            )}
          </div>

          {/* Institution Contact card */}
          {institution && (
            <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 space-y-3 text-xs text-slate-600">
              <h4 className="font-bold text-slate-900 text-sm">
                About {institution.name}
              </h4>
              <p className="leading-relaxed">
                {institution.description}
              </p>
              <div className="pt-2 border-t border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-slate-400" />
                  <span>{institution.city}, {institution.region}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-slate-400" />
                  <span>{institution.operatingHours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-slate-400" />
                  <span>{institution.contactPhone}</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
