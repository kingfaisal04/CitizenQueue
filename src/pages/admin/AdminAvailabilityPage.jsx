/**
 * CitizenQueue - Institutional Availability & Slot Capacity Management
 * 
 * Route: `/admin/availability`
 * 
 * Allows school administrators to configure appointment dates, define intake
 * time slots, manage seat capacity per period, and monitor booked vs remaining loads.
 */

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Plus,
  Users,
  CheckCircle,
  AlertCircle,
  Check,
  ChevronRight,
  Building2,
  Trash2
} from 'lucide-react';
import { ServiceService } from '../../services/serviceService';
import { Storage } from '../../services/storageService';

export default function AdminAvailabilityPage() {
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [feedback, setFeedback] = useState('');

  // Add Slot Form State
  const [newSlotDate, setNewSlotDate] = useState('2026-10-27');
  const [newSlotTime, setNewSlotTime] = useState('12:30 PM');
  const [newSlotCapacity, setNewSlotCapacity] = useState(8);

  const loadData = () => {
    const srvs = ServiceService.getAll();
    setServices(srvs);
    if (srvs.length > 0 && !selectedServiceId) {
      setSelectedServiceId(srvs[0].id);
      setSchedule(ServiceService.getAvailability(srvs[0].id));
    } else if (selectedServiceId) {
      setSchedule(ServiceService.getAvailability(selectedServiceId));
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedServiceId]);

  const handleSelectService = (id) => {
    setSelectedServiceId(id);
    setSchedule(ServiceService.getAvailability(id));
  };

  // Adjust capacity for a slot
  const handleCapacityChange = (slotId, newCapacity) => {
    const updated = ServiceService.updateSlotCapacity(
      selectedServiceId,
      slotId,
      Number(newCapacity)
    );
    if (updated) {
      setSchedule(ServiceService.getAvailability(selectedServiceId));
      setFeedback(`Slot capacity updated to ${newCapacity}`);
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  // Add new slot
  const handleAddSlot = (e) => {
    e.preventDefault();
    if (!newSlotTime.trim() || !newSlotDate.trim()) return;

    ServiceService.addSlot(selectedServiceId, newSlotDate.trim(), {
      time: newSlotTime.trim(),
      capacity: Number(newSlotCapacity) || 6
    });

    setSchedule(ServiceService.getAvailability(selectedServiceId));
    setFeedback(`New slot ${newSlotTime} added to ${newSlotDate}!`);
    setTimeout(() => setFeedback(''), 2500);
  };

  const currentService = services.find((s) => s.id === selectedServiceId);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-cqNavy-950">
            Capacity & Slot Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Regulate daily intake limits to prevent campus overcrowding and long lines.
          </p>
        </div>

        {/* Service Selector Dropdown */}
        <div className="w-full sm:w-72">
          <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
            Selected Service Desk:
          </label>
          <select
            value={selectedServiceId}
            onChange={(e) => handleSelectService(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cqTeal-500 shadow-xs"
          >
            {services.map((srv) => (
              <option key={srv.id} value={srv.id}>
                {srv.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Floating feedback alert */}
      {feedback && (
        <div className="fixed top-20 right-6 z-50 bg-cqNavy-950 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-fade-in border border-cqTeal-500">
          <Check size={16} className="text-cqTeal-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Service Context Strip */}
      {currentService && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-cqTeal-700 uppercase">
              {currentService.category}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-cqNavy-950">
              {currentService.name}
            </h2>
            <p className="text-xs text-slate-500">
              Desk: {currentService.location} • Standard duration: {currentService.durationMinutes} mins
            </p>
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <strong>Capacity Principle:</strong> Slot capacity represents the maximum number of families our staff can attend to in that block.
          </div>
        </div>
      )}

      {/* Schedule by Date Cards */}
      <div className="space-y-6">
        {schedule.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
            <Calendar size={28} className="text-slate-400 mx-auto" />
            <h3 className="font-bold text-base text-slate-900">
              No dates configured for this service
            </h3>
            <p className="text-xs text-slate-500">
              Use the "Add New Time Slot" form below to establish appointment periods.
            </p>
          </div>
        ) : (
          schedule.map((day) => {
            const totalDayCapacity = day.slots?.reduce((sum, s) => sum + s.capacity, 0) || 0;
            const totalDayBooked = day.slots?.reduce((sum, s) => sum + s.bookedCount, 0) || 0;
            const dayRemaining = Math.max(0, totalDayCapacity - totalDayBooked);

            return (
              <div
                key={day.date}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4"
              >
                {/* Date Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-cqTeal-600" />
                    <span className="font-bold text-base text-slate-900">
                      {day.date}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({day.slots?.length || 0} periods)
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500">
                      Booked: <strong className="text-slate-900">{totalDayBooked}</strong> / {totalDayCapacity}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                      {dayRemaining} open seats
                    </span>
                  </div>
                </div>

                {/* Slots Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {day.slots?.map((slot) => {
                    const remaining = Math.max(0, slot.capacity - slot.bookedCount);
                    const isFull = remaining === 0;

                    return (
                      <div
                        key={slot.id}
                        className={`p-4 rounded-xl border text-xs space-y-2.5 transition-all ${
                          isFull
                            ? 'bg-rose-50/50 border-rose-200'
                            : 'bg-slate-50/70 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                            <Clock size={14} className="text-cqTeal-600" />
                            {slot.time}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isFull
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isFull ? 'FULL' : `${remaining} left`}
                          </span>
                        </div>

                        {/* Capacity meter */}
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${isFull ? 'bg-rose-500' : 'bg-cqTeal-500'}`}
                            style={{
                              width: `${Math.min(100, (slot.bookedCount / slot.capacity) * 100)}%`
                            }}
                          />
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                          <span>{slot.bookedCount} booked</span>
                          <div className="flex items-center gap-1">
                            <span>Max:</span>
                            <input
                              type="number"
                              min={slot.bookedCount}
                              max="50"
                              value={slot.capacity}
                              onChange={(e) => handleCapacityChange(slot.id, e.target.value)}
                              className="w-12 px-1.5 py-0.5 rounded border border-slate-300 text-center text-xs font-bold bg-white"
                              title="Cannot set capacity below currently booked count"
                            />
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Add Slot Tool */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-cqNavy-950 flex items-center gap-2">
          <Plus size={18} className="text-cqTeal-600" />
          Add an Appointment Time Slot
        </h3>

        <form onSubmit={handleAddSlot} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase">
              Date (YYYY-MM-DD)
            </label>
            <input
              type="date"
              value={newSlotDate}
              onChange={(e) => setNewSlotDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase">
              Time Slot (e.g. 03:00 PM)
            </label>
            <input
              type="text"
              placeholder="e.g. 03:00 PM"
              value={newSlotTime}
              onChange={(e) => setNewSlotTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase">
              Capacity (Max Citizens)
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={newSlotCapacity}
              onChange={(e) => setNewSlotCapacity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-cqNavy-950 hover:bg-cqNavy-900 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors"
            >
              <Plus size={16} />
              <span>Add Slot</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
