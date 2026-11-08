/**
 * CitizenQueue - Institutional Appointment Management
 * 
 * Route: `/admin/appointments`
 * 
 * Staff queue desk providing real-time search, date/status filtering,
 * attendee document verification checklists, and live lifecycle status transitions.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Calendar,
  UserCheck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  AlertCircle,
  FileCheck2,
  RefreshCw,
  X,
  Check,
  ChevronDown,
  Building2,
  Phone,
  User
} from 'lucide-react';
import { AppointmentService, APPOINTMENT_STATUSES } from '../../services/appointmentService';
import StatusBadge from '../../components/common/StatusBadge';

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  
  // Selected appointment for details modal / desk action
  const [selectedApt, setSelectedApt] = useState(null);
  const [updateFeedback, setUpdateFeedback] = useState('');

  const loadAppointments = () => {
    setAppointments(AppointmentService.getAll());
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // Update appointment status
  const handleStatusChange = (aptId, newStatus, note = '') => {
    const res = AppointmentService.updateStatus(aptId, newStatus, note);
    if (res.success) {
      loadAppointments();
      if (selectedApt && selectedApt.id === aptId) {
        setSelectedApt(res.appointment);
      }
      setUpdateFeedback(`Status updated to ${newStatus}`);
      setTimeout(() => setUpdateFeedback(''), 2500);
    }
  };

  // Toggle staff checklist verification
  const handleToggleChecklist = (aptId, checklistId) => {
    const updated = AppointmentService.toggleChecklistItem(aptId, checklistId);
    if (updated) {
      loadAppointments();
      setSelectedApt({ ...updated });
    }
  };

  // Unique dates for filter dropdown
  const uniqueDates = useMemo(() => {
    const dates = new Set(appointments.map((a) => a.appointmentDate).filter(Boolean));
    return Array.from(dates).sort();
  }, [appointments]);

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return appointments.filter((apt) => {
      // Status match
      if (statusFilter !== 'all' && apt.status !== statusFilter) {
        return false;
      }

      // Date match
      if (dateFilter && apt.appointmentDate !== dateFilter) {
        return false;
      }

      // Query match (ref number, parent, student, service)
      if (q) {
        const matchesRef = apt.referenceNumber?.toLowerCase().includes(q);
        const matchesParent = apt.visitor?.parentName?.toLowerCase().includes(q);
        const matchesStudent = apt.visitor?.studentName?.toLowerCase().includes(q);
        const matchesPhone = apt.visitor?.contactPhone?.toLowerCase().includes(q);
        const matchesService = apt.serviceName?.toLowerCase().includes(q);

        if (!matchesRef && !matchesParent && !matchesStudent && !matchesPhone && !matchesService) {
          return false;
        }
      }

      return true;
    });
  }, [appointments, searchQuery, statusFilter, dateFilter]);

  return (
    <div className="space-y-6">
      
      {/* Page Title & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-cqNavy-950">
            Appointment Queue Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Track and process verified citizen arrivals at Achimota Senior High School.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAppointments}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs self-start"
        >
          <RefreshCw size={14} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Floating feedback alert */}
      {updateFeedback && (
        <div className="fixed top-20 right-6 z-50 bg-cqNavy-950 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-fade-in border border-cqTeal-500">
          <Check size={16} className="text-cqTeal-400" />
          <span>{updateFeedback}</span>
        </div>
      )}

      {/* Filters Strip */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Search Bar */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference, candidate, parent or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cqTeal-500 bg-slate-50/50"
            />
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
            >
              <option value="all">All Appointment Statuses</option>
              <option value="booked">Confirmed (Booked)</option>
              <option value="checked_in">Checked In</option>
              <option value="in_progress">At Desk (In Progress)</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>

          {/* Date Dropdown */}
          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500"
            >
              <option value="">All Scheduled Dates</option>
              {uniqueDates.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Filter clear prompt */}
        {(searchQuery || statusFilter !== 'all' || dateFilter) && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Filtering {filteredAppointments.length} of {appointments.length} appointments</span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setDateFilter('');
              }}
              className="text-cqTeal-700 font-semibold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Table (Desktop) / Cards (Mobile) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {filteredAppointments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle size={28} className="text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-900 text-base">No appointments match your filters</h3>
            <p className="text-xs text-slate-500">Try adjusting your search criteria or resetting filters.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Reference</th>
                    <th className="px-5 py-3.5">Student / Guardian</th>
                    <th className="px-5 py-3.5">Service</th>
                    <th className="px-5 py-3.5">Date & Time</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Desk Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-slate-900">
                        {apt.referenceNumber}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {apt.visitor?.studentName || 'Student'}
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          {apt.visitor?.parentName} • {apt.visitor?.contactPhone}
                        </div>
                      </td>

                      <td className="px-5 py-4 max-w-xs">
                        <span className="font-medium text-slate-800 line-clamp-1">
                          {apt.serviceName}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {apt.location}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{apt.appointmentDate}</div>
                        <div className="text-slate-500 text-[11px]">{apt.appointmentTime}</div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <StatusBadge status={apt.status} size="sm" />
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedApt(apt)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Eye size={13} />
                          <span>Inspect</span>
                        </button>

                        {/* Fast Status Transition Buttons */}
                        {apt.status === 'booked' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(apt.id, 'checked_in')}
                            className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-xs"
                          >
                            Check In
                          </button>
                        )}

                        {apt.status === 'checked_in' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(apt.id, 'in_progress')}
                            className="px-2.5 py-1.5 bg-cqTeal-600 hover:bg-cqTeal-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                          >
                            Start Desk
                          </button>
                        )}

                        {apt.status === 'in_progress' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(apt.id, 'completed')}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                          >
                            Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-slate-100">
              {filteredAppointments.map((apt) => (
                <div key={apt.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-slate-900">{apt.referenceNumber}</span>
                    <StatusBadge status={apt.status} size="sm" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {apt.visitor?.studentName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Parent: {apt.visitor?.parentName} • {apt.visitor?.contactPhone}
                    </p>
                    <p className="text-xs text-slate-700 font-medium mt-1">
                      {apt.serviceName}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {apt.appointmentDate} at {apt.appointmentTime} ({apt.location})
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedApt(apt)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
                    >
                      Inspect Details
                    </button>

                    <div className="flex items-center gap-1.5">
                      {apt.status === 'booked' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(apt.id, 'checked_in')}
                          className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-semibold"
                        >
                          Check In
                        </button>
                      )}
                      {apt.status === 'checked_in' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(apt.id, 'in_progress')}
                          className="px-3 py-1.5 bg-cqTeal-600 text-white rounded-lg text-xs font-semibold"
                        >
                          Start
                        </button>
                      )}
                      {apt.status === 'in_progress' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(apt.id, 'completed')}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>

      {/* Appointment Inspection Drawer / Modal */}
      {selectedApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                  {selectedApt.referenceNumber}
                </span>
                <h2 className="text-xl font-bold text-cqNavy-950">
                  Verification Desk Dossier
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApt(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Status Selector strip */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Update Appointment Lifecycle Status:
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.values(APPOINTMENT_STATUSES).map((st) => {
                  const isCurrent = selectedApt.status === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(selectedApt.id, st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                        isCurrent
                          ? 'bg-cqNavy-950 text-white ring-2 ring-cqTeal-500 shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Candidate & Guardian Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-xs text-slate-500 font-semibold block">Student Candidate</span>
                <p className="font-bold text-slate-900">{selectedApt.visitor?.studentName}</p>
                <p className="text-xs text-slate-500">
                  BECE Index: {selectedApt.visitor?.studentIndex || 'Not provided'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-xs text-slate-500 font-semibold block">Parent / Guardian Contact</span>
                <p className="font-bold text-slate-900">{selectedApt.visitor?.parentName}</p>
                <p className="text-xs text-slate-500">{selectedApt.visitor?.contactPhone}</p>
              </div>
            </div>

            {/* Staff Document Checklist */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileCheck2 size={16} className="text-cqTeal-600" />
                Physical Document Verification Checklist
              </h3>
              <p className="text-xs text-slate-500">
                Click to mark document verified by officer:
              </p>

              <div className="space-y-2">
                {selectedApt.checklist?.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleToggleChecklist(selectedApt.id, item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left text-xs transition-colors ${
                      item.verified
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.verified
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.verified ? 'Verified ✓' : 'Pending'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Audit Log */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <span className="font-bold text-slate-700">Audit History:</span>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {selectedApt.history?.map((h, i) => (
                  <div key={i} className="text-[11px] text-slate-500 flex items-baseline gap-2">
                    <span className="font-mono text-[10px] text-slate-400">
                      {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>{h.action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedApt(null)}
                className="px-5 py-2.5 bg-cqNavy-950 text-white rounded-xl text-xs font-bold hover:bg-cqNavy-900"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
